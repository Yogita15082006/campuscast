const { supabaseAdmin } = require('../config/supabase');
const { sendRegistrationEmail } = require('../utils/email');

// POST /api/registrations/:eventId
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user.id;

    // Call atomic RPC — handles validation + seat decrement
    const { data: registration, error } = await supabaseAdmin.rpc('create_registration', {
      p_student_id: studentId,
      p_event_id: eventId,
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    // Get updated seat count
    const { data: event } = await supabaseAdmin
      .from('events')
      .select('id, title, date, venue, remaining_seats')
      .eq('id', eventId)
      .single();

    // Send email (fire-and-forget)
    if (event) {
      sendRegistrationEmail(req.user.email, req.user.name, event.title, event.date, event.venue);
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io && event) {
      io.emit('seat_updated', {
        eventId: event.id,
        remainingSeats: event.remaining_seats,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event',
      data: {
        registration: normalizeRegistration(registration),
        remainingSeats: event?.remaining_seats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrations/my
exports.getMyRegistrations = async (req, res) => {
  try {
    const { data: registrations, error } = await supabaseAdmin
      .from('registrations')
      .select(`
        *,
        event:events(*),
        team:teams(id, team_name, team_code)
      `)
      .eq('student_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: { registrations: registrations.map(normalizeRegistration) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrations/event/:eventId
exports.getEventRegistrations = async (req, res) => {
  try {
    const { data: registrations, error } = await supabaseAdmin
      .from('registrations')
      .select(`
        *,
        student:profiles!student_id(id, name, email),
        team:teams(id, team_name, team_code)
      `)
      .eq('event_id', req.params.eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: { registrations: registrations.map(normalizeRegistration) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/registrations/:id (cancel)
exports.cancelRegistration = async (req, res) => {
  try {
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.student_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete registration
    await supabaseAdmin.from('registrations').delete().eq('id', req.params.id);

    // Atomically increment seat count back
    await supabaseAdmin.rpc('increment_seats', { p_event_id: registration.event_id });

    // Get latest seat count for socket emit
    const { data: latestEvent } = await supabaseAdmin
      .from('events')
      .select('remaining_seats')
      .eq('id', registration.event_id)
      .single();

    const io = req.app.get('io');
    if (io) {
      io.emit('seat_updated', {
        eventId: registration.event_id,
        remainingSeats: latestEvent?.remaining_seats,
      });
    }

    res.json({ success: true, message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrations/check/:eventId
exports.checkRegistration = async (req, res) => {
  try {
    const { data: registration, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('student_id', req.user.id)
      .eq('event_id', req.params.eventId)
      .maybeSingle();

    if (error) throw error;

    res.json({
      success: true,
      data: { isRegistered: !!registration, registration: normalizeRegistration(registration) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrations/export/:eventId (CSV)
exports.exportRegistrations = async (req, res) => {
  try {
    const { data: registrations, error } = await supabaseAdmin
      .from('registrations')
      .select(`
        *,
        student:profiles!student_id(name, email),
        event:events(title, date)
      `)
      .eq('event_id', req.params.eventId);

    if (error) throw error;

    let csv = 'Student Name,Email,Event,Date,Status,Registered At\n';
    registrations.forEach((r) => {
      csv += `"${r.student?.name}","${r.student?.email}","${r.event?.title}","${r.event?.date}","${r.status}","${r.created_at}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=registrations-${req.params.eventId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function normalizeRegistration(reg) {
  if (!reg) return null;
  return {
    ...reg,
    _id: reg.id,
    student: reg.student ? { ...reg.student, _id: reg.student.id } : reg.student_id,
    event: reg.event ? { ...reg.event, _id: reg.event.id } : reg.event_id,
    team: reg.team ? { ...reg.team, _id: reg.team.id } : reg.team_id,
    createdAt: reg.created_at,
  };
}
