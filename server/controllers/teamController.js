const { supabaseAdmin } = require('../config/supabase');

// Helper: generate random 8-char uppercase team code
const generateTeamCode = () => Math.random().toString(36).substring(2, 10).toUpperCase().padEnd(8, '0');

// POST /api/teams
exports.createTeam = async (req, res) => {
  try {
    const { teamName, eventId } = req.body;
    const leaderId = req.user.id;

    // Check event exists and supports teams
    const { data: event, error: evtError } = await supabaseAdmin
      .from('events')
      .select('id, is_team_event, team_size_limit')
      .eq('id', eventId)
      .single();

    if (evtError || !event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (!event.is_team_event) {
      return res.status(400).json({ success: false, message: 'This event does not support teams' });
    }

    // Check leader is registered
    const { data: registration } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('student_id', leaderId)
      .eq('event_id', eventId)
      .maybeSingle();

    if (!registration) {
      return res.status(400).json({ success: false, message: 'You must register for the event first' });
    }

    // Check leader not already in a team for this event
    const { data: existingMembership } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('student_id', leaderId)
      .eq('teams.event_id', eventId)
      .limit(1)
      .maybeSingle();

    // Alternate check via join
    const { data: existingTeam } = await supabaseAdmin
      .from('teams')
      .select('id, team_members!inner(student_id)')
      .eq('event_id', eventId)
      .eq('team_members.student_id', leaderId)
      .maybeSingle();

    if (existingTeam) {
      return res.status(400).json({ success: false, message: 'You are already in a team for this event' });
    }

    // Create team
    const teamCode = generateTeamCode();
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert({
        team_name: teamName,
        team_code: teamCode,
        event_id: eventId,
        leader_id: leaderId,
        max_size: event.team_size_limit,
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Add leader to team_members
    await supabaseAdmin.from('team_members').insert({
      team_id: team.id,
      student_id: leaderId,
    });

    // Update registration with team_id
    await supabaseAdmin
      .from('registrations')
      .update({ team_id: team.id })
      .eq('student_id', leaderId)
      .eq('event_id', eventId);

    const populated = await getPopulatedTeam(team.id);

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: { team: populated },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/teams/join
exports.joinTeam = async (req, res) => {
  try {
    const { teamCode } = req.body;
    const studentId = req.user.id;

    // Find team by code
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('*, members:team_members(student_id)')
      .eq('team_code', teamCode.toUpperCase())
      .single();

    if (teamError || !team) {
      return res.status(404).json({ success: false, message: 'Team not found. Check the code.' });
    }

    // Check registered for event
    const { data: registration } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('student_id', studentId)
      .eq('event_id', team.event_id)
      .maybeSingle();

    if (!registration) {
      return res.status(400).json({ success: false, message: 'You must register for the event first' });
    }

    // Check not already in a team for this event
    const { data: existingTeam } = await supabaseAdmin
      .from('teams')
      .select('id, team_members!inner(student_id)')
      .eq('event_id', team.event_id)
      .eq('team_members.student_id', studentId)
      .maybeSingle();

    if (existingTeam) {
      return res.status(400).json({ success: false, message: 'You are already in a team for this event' });
    }

    // Check capacity
    const memberCount = team.members?.length || 0;
    if (memberCount >= team.max_size) {
      return res.status(400).json({ success: false, message: 'Team is full' });
    }

    // Join team
    const { error: joinError } = await supabaseAdmin.from('team_members').insert({
      team_id: team.id,
      student_id: studentId,
    });

    if (joinError) throw joinError;

    // Update registration
    await supabaseAdmin
      .from('registrations')
      .update({ team_id: team.id })
      .eq('student_id', studentId)
      .eq('event_id', team.event_id);

    const populated = await getPopulatedTeam(team.id);

    res.json({
      success: true,
      message: 'Joined team successfully',
      data: { team: populated },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/teams/my
exports.getMyTeams = async (req, res) => {
  try {
    const { data: memberships, error } = await supabaseAdmin
      .from('team_members')
      .select('team_id')
      .eq('student_id', req.user.id);

    if (error) throw error;

    const teamIds = memberships.map((m) => m.team_id);
    if (teamIds.length === 0) {
      return res.json({ success: true, data: { teams: [] } });
    }

    const teams = await Promise.all(teamIds.map(getPopulatedTeam));

    res.json({ success: true, data: { teams } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/teams/event/:eventId
exports.getEventTeams = async (req, res) => {
  try {
    const { data: teams, error } = await supabaseAdmin
      .from('teams')
      .select(`
        *,
        leader:profiles!leader_id(id, name, email),
        team_members(student_id, profiles(id, name, email))
      `)
      .eq('event_id', req.params.eventId);

    if (error) throw error;

    res.json({ success: true, data: { teams: teams.map(normalizeTeam) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/teams/:id/kick/:memberId
exports.kickMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .select('id, leader_id, event_id')
      .eq('id', id)
      .single();

    if (error || !team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    if (team.leader_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leader can kick members' });
    }
    if (memberId === team.leader_id) {
      return res.status(400).json({ success: false, message: 'Cannot kick yourself. Use disband instead.' });
    }

    await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('team_id', id)
      .eq('student_id', memberId);

    // Remove team ref from registration
    await supabaseAdmin
      .from('registrations')
      .update({ team_id: null })
      .eq('student_id', memberId)
      .eq('event_id', team.event_id);

    res.json({ success: true, message: 'Member kicked from team' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/teams/:id
exports.disbandTeam = async (req, res) => {
  try {
    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .select('id, leader_id, event_id')
      .eq('id', req.params.id)
      .single();

    if (error || !team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    if (team.leader_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Remove team ref from all registrations
    await supabaseAdmin
      .from('registrations')
      .update({ team_id: null })
      .eq('team_id', team.id);

    // Delete team (cascade deletes team_members)
    await supabaseAdmin.from('teams').delete().eq('id', req.params.id);

    res.json({ success: true, message: 'Team disbanded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helpers
async function getPopulatedTeam(teamId) {
  const { data } = await supabaseAdmin
    .from('teams')
    .select(`
      *,
      leader:profiles!leader_id(id, name, email),
      event:events(id, title),
      team_members(student_id, member:profiles(id, name, email))
    `)
    .eq('id', teamId)
    .single();
  return data ? normalizeTeam(data) : null;
}

function normalizeTeam(team) {
  if (!team) return null;
  return {
    ...team,
    _id: team.id,
    teamName: team.team_name,
    teamCode: team.team_code,
    maxSize: team.max_size,
    leader: team.leader ? { ...team.leader, _id: team.leader.id } : team.leader_id,
    members: (team.team_members || []).map((m) => ({
      ...(m.member || m.profiles || {}),
      _id: m.student_id,
      id: m.student_id,
    })),
    event: team.event ? { ...team.event, _id: team.event.id } : team.event_id,
    createdAt: team.created_at,
  };
}
