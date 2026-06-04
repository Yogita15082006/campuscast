const AttendanceCode = require('../models/AttendanceCode');
const Attendance = require('../models/Attendance');
const Registration = require('../models/Registration');
const { logActivity } = require('../utils/activityLog');

// POST /api/attendance/generate-code
exports.generateCode = async (req, res) => {
  try {
    const { eventId, duration = 15 } = req.body;
    // Deactivate old codes
    await AttendanceCode.updateMany({ event: eventId, isActive: true }, { isActive: false });
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);
    const code = await AttendanceCode.create({ event: eventId, expiresAt, createdBy: req.user._id });
    await logActivity(req.user._id, 'Generated attendance code', 'attendance', code._id, code.code);
    res.status(201).json({ success: true, message: 'Attendance code generated', data: { code } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance/mark
exports.markAttendance = async (req, res) => {
  try {
    const { code } = req.body;
    const studentId = req.user._id;
    const attendanceCode = await AttendanceCode.findOne({ code: code.toUpperCase(), isActive: true });
    if (!attendanceCode) return res.status(400).json({ success: false, message: 'Invalid or inactive attendance code' });
    if (new Date() > attendanceCode.expiresAt) {
      attendanceCode.isActive = false;
      await attendanceCode.save();
      return res.status(400).json({ success: false, message: 'Attendance code has expired' });
    }
    const registration = await Registration.findOne({ student: studentId, event: attendanceCode.event });
    if (!registration) return res.status(400).json({ success: false, message: 'You are not registered for this event' });
    const existing = await Attendance.findOne({ student: studentId, event: attendanceCode.event });
    if (existing) return res.status(400).json({ success: false, message: 'Attendance already marked' });
    const attendance = await Attendance.create({ student: studentId, event: attendanceCode.event, status: 'present', codeUsed: code.toUpperCase() });
    registration.status = 'attended';
    await registration.save();
    const io = req.app.get('io');
    if (io) io.emit('attendance_marked', { eventId: attendanceCode.event, studentId, studentName: req.user.name });
    res.status(201).json({ success: true, message: 'Attendance marked successfully', data: { attendance } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/my
exports.getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user._id }).populate('event', 'title date venue').sort({ markedAt: -1 });
    res.json({ success: true, data: { attendance } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/event/:eventId
exports.getEventAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ event: req.params.eventId }).populate('student', 'name email').sort({ markedAt: -1 });
    const totalRegistered = await Registration.countDocuments({ event: req.params.eventId });
    res.json({ success: true, data: { attendance, totalRegistered, totalPresent: attendance.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/active-code/:eventId
exports.getActiveCode = async (req, res) => {
  try {
    const code = await AttendanceCode.findOne({ event: req.params.eventId, isActive: true, expiresAt: { $gt: new Date() } });
    res.json({ success: true, data: { code } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/export/:eventId
exports.exportAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ event: req.params.eventId }).populate('student', 'name email').populate('event', 'title date');
    let csv = 'Student Name,Email,Event,Status,Marked At,Code Used\n';
    attendance.forEach((a) => { csv += `"${a.student?.name}","${a.student?.email}","${a.event?.title}","${a.status}","${a.markedAt}","${a.codeUsed}"\n`; });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${req.params.eventId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
