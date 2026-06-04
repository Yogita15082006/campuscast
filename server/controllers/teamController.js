const Team = require('../models/Team');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// POST /api/teams
exports.createTeam = async (req, res) => {
  try {
    const { teamName, eventId } = req.body;
    const leaderId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (!event.isTeamEvent) {
      return res.status(400).json({ success: false, message: 'This event does not support teams' });
    }

    // Check if student is registered
    const registration = await Registration.findOne({ student: leaderId, event: eventId });
    if (!registration) {
      return res.status(400).json({ success: false, message: 'You must register for the event first' });
    }

    // Check if student already has a team for this event
    const existingTeam = await Team.findOne({ event: eventId, members: leaderId });
    if (existingTeam) {
      return res.status(400).json({ success: false, message: 'You are already in a team for this event' });
    }

    const team = await Team.create({
      teamName,
      event: eventId,
      leader: leaderId,
      members: [leaderId],
      maxSize: event.teamSizeLimit,
    });

    // Update registration with team reference
    registration.team = team._id;
    await registration.save();

    const populated = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .populate('event', 'title');

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
    const studentId = req.user._id;

    const team = await Team.findOne({ teamCode: teamCode.toUpperCase() });
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found. Check the code.' });
    }

    // Check if registered for the event
    const registration = await Registration.findOne({ student: studentId, event: team.event });
    if (!registration) {
      return res.status(400).json({ success: false, message: 'You must register for the event first' });
    }

    // Check if already in a team
    const existingTeam = await Team.findOne({ event: team.event, members: studentId });
    if (existingTeam) {
      return res.status(400).json({ success: false, message: 'You are already in a team for this event' });
    }

    // Check capacity
    if (team.members.length >= team.maxSize) {
      return res.status(400).json({ success: false, message: 'Team is full' });
    }

    team.members.push(studentId);
    await team.save();

    registration.team = team._id;
    await registration.save();

    const populated = await Team.findById(team._id)
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .populate('event', 'title');

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
    const teams = await Team.find({ members: req.user._id })
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .populate('event', 'title date venue');

    res.json({ success: true, data: { teams } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/teams/event/:eventId
exports.getEventTeams = async (req, res) => {
  try {
    const teams = await Team.find({ event: req.params.eventId })
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.json({ success: true, data: { teams } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/teams/:id/kick/:memberId
exports.kickMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only team leader can kick members' });
    }

    if (memberId === team.leader.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot kick yourself. Use disband instead.' });
    }

    team.members = team.members.filter((m) => m.toString() !== memberId);
    await team.save();

    // Remove team ref from registration
    await Registration.findOneAndUpdate(
      { student: memberId, event: team.event },
      { team: null }
    );

    res.json({ success: true, message: 'Member kicked from team' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/teams/:id
exports.disbandTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Remove team ref from all registrations
    await Registration.updateMany(
      { team: team._id },
      { team: null }
    );

    await Team.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Team disbanded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
