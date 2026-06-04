const { supabaseAdmin } = require('../config/supabase');
const { logActivity } = require('../utils/activityLog');
const { v4: uuidv4 } = require('uuid');

// Helper to generate a random 6-char uppercase code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// POST /api/attendance/generate-code
exports.generateCode = async (req, res) => {
  try {
    const { eventId, duration = 15 } = req.body;

    // Deactivate old codes for this event
    await supabaseAdmin
      .from('attendance_codes')
      .update({ is_active: false })
      .eq('event_id', eventId)
      .eq('is_active', true);

    const expiresAt = new Date(Date.now() + parseInt(duration) * 60 * 1000).toISOString();
    const code = generateCode();

    const { data, error } = await supabaseAdmin
      .from('attendance_codes')
      .insert({
        code,
        event_id: eventId,
        created_by: req.user.id,
        expires_at: expiresAt,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    await logActivity(req.user.id, 'Generated attendance code', 'attendance', data.id, code);

    res.status(201).json({
      success: true,
      message: 'Attendance code generated',
      data: { code: { ...data, _id: data.id } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance/mark
exports.markAttendance = async (req, res) => {
  try {
    const { code } = req.body;
    const studentId = req.user.id;

    // Find active code
    const { data: attendanceCode, error: codeError } = await supabaseAdmin
      .from('attendance_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (codeError || !attendanceCode) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive attendance code' });
    }

    // Check expiry
    if (new Date() > new Date(attendanceCode.expires_at)) {
      await supabaseAdmin
        .from('attendance_codes')
        .update({ is_active: false })
        .eq('id', attendanceCode.id);
      return res.status(400).json({ success: false, message: 'Attendance code has expired' });
    }

    // Check registration
    const { data: registration } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('student_id', studentId)
      .eq('event_id', attendanceCode.event_id)
      .maybeSingle();

    if (!registration) {
      return res.status(400).json({ success: false, message: 'You are not registered for this event' });
    }

    // Check duplicate
    const { data: existing } = await supabaseAdmin
      .from('attendance')
      .select('id')
      .eq('student_id', studentId)
      .eq('event_id', attendanceCode.event_id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already marked' });
    }

    // Insert attendance
    const { data: attendance, error: insertError } = await supabaseAdmin
      .from('attendance')
      .insert({
        student_id: studentId,
        event_id: attendanceCode.event_id,
        status: 'present',
        code_used: code.toUpperCase(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update registration status
    await supabaseAdmin
      .from('registrations')
      .update({ status: 'attended' })
      .eq('student_id', studentId)
      .eq('event_id', attendanceCode.event_id);

    // Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('attendance_marked', {
        eventId: attendanceCode.event_id,
        studentId,
        studentName: req.user.name,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: { attendance: { ...attendance, _id: attendance.id } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/my
exports.getMyAttendance = async (req, res) => {
  try {
    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .select('*, event:events(id, title, date, venue)')
      .eq('student_id', req.user.id)
      .order('marked_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        attendance: attendance.map((a) => ({
          ...a,
          _id: a.id,
          event: a.event ? { ...a.event, _id: a.event.id } : a.event_id,
          markedAt: a.marked_at,
          codeUsed: a.code_used,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/event/:eventId
exports.getEventAttendance = async (req, res) => {
  try {
    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .select('*, student:profiles!student_id(id, name, email)')
      .eq('event_id', req.params.eventId)
      .order('marked_at', { ascending: false });

    if (error) throw error;

    const { count: totalRegistered } = await supabaseAdmin
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', req.params.eventId);

    res.json({
      success: true,
      data: {
        attendance: attendance.map((a) => ({
          ...a,
          _id: a.id,
          student: a.student ? { ...a.student, _id: a.student.id } : a.student_id,
          markedAt: a.marked_at,
          codeUsed: a.code_used,
        })),
        totalRegistered: totalRegistered || 0,
        totalPresent: attendance.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/active-code/:eventId
exports.getActiveCode = async (req, res) => {
  try {
    const { data: code, error } = await supabaseAdmin
      .from('attendance_codes')
      .select('*')
      .eq('event_id', req.params.eventId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;

    res.json({
      success: true,
      data: { code: code ? { ...code, _id: code.id } : null },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/export/:eventId
exports.exportAttendance = async (req, res) => {
  try {
    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .select('*, student:profiles!student_id(name, email), event:events(title, date)')
      .eq('event_id', req.params.eventId);

    if (error) throw error;

    let csv = 'Student Name,Email,Event,Status,Marked At,Code Used\n';
    attendance.forEach((a) => {
      csv += `"${a.student?.name}","${a.student?.email}","${a.event?.title}","${a.status}","${a.marked_at}","${a.code_used}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${req.params.eventId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
