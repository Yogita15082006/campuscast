const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');
const { generateCertificatePDF } = require('../utils/certificate');
const { logActivity } = require('../utils/activityLog');
const path = require('path');

// POST /api/certificates/generate/:eventId/:studentId
exports.generateCertificate = async (req, res) => {
  try {
    const { eventId, studentId } = req.params;
    const attendance = await Attendance.findOne({ student: studentId, event: eventId, status: 'present' });
    if (!attendance) return res.status(400).json({ success: false, message: 'Student did not attend this event' });
    const existing = await Certificate.findOne({ student: studentId, event: eventId });
    if (existing) return res.status(400).json({ success: false, message: 'Certificate already generated. Use regenerate.' });
    const student = await User.findById(studentId);
    const event = await Event.findById(eventId).populate('createdBy', 'name');
    const cert = await Certificate.create({ student: studentId, event: eventId });
    const { fileName } = await generateCertificatePDF(student.name, event.title, event.date, event.createdBy?.name || 'CampusCast', cert.certificateId);
    cert.downloadUrl = `/certificates/${fileName}`;
    await cert.save();
    await logActivity(req.user._id, 'Generated certificate', 'certificate', cert._id, `${student.name} - ${event.title}`);
    res.status(201).json({ success: true, message: 'Certificate generated', data: { certificate: cert } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/certificates/regenerate/:certId
exports.regenerateCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.certId);
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    const student = await User.findById(cert.student);
    const event = await Event.findById(cert.event).populate('createdBy', 'name');
    const { fileName } = await generateCertificatePDF(student.name, event.title, event.date, event.createdBy?.name || 'CampusCast', cert.certificateId);
    cert.downloadUrl = `/certificates/${fileName}`;
    cert.generatedAt = new Date();
    await cert.save();
    res.json({ success: true, message: 'Certificate regenerated', data: { certificate: cert } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/certificates/my
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ student: req.user._id }).populate('event', 'title date venue').sort({ generatedAt: -1 });
    res.json({ success: true, data: { certificates: certs } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/certificates/verify/:certificateId
exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId }).populate('student', 'name email').populate('event', 'title date venue');
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found or invalid' });
    res.json({ success: true, data: { certificate: cert, verified: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/certificates/download/:certId
exports.downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.certId);
    if (!cert || !cert.downloadUrl) return res.status(404).json({ success: false, message: 'Certificate not available' });
    const filePath = path.join(__dirname, '..', cert.downloadUrl);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
