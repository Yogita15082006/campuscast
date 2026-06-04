const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Team = require('../models/Team');
const Feedback = require('../models/Feedback');
const ActivityLog = require('../models/ActivityLog');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    const totalPresent = await Attendance.countDocuments({ status: 'present' });
    const attendanceRate = totalRegistrations > 0 ? ((totalPresent / totalRegistrations) * 100).toFixed(1) : 0;
    const recentActivity = await ActivityLog.find().populate('admin', 'name').sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: { totalEvents, totalRegistrations, totalTeams, totalAttendance, attendanceRate: parseFloat(attendanceRate), recentActivity } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRegistrationAnalytics = async (req, res) => {
  try {
    const events = await Event.find().select('title');
    const data = [];
    for (const event of events) {
      const count = await Registration.countDocuments({ event: event._id });
      data.push({ eventTitle: event.title, registrations: count });
    }
    const total = await Registration.countDocuments();
    res.json({ success: true, data: { chartData: data, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const events = await Event.find().select('title');
    const data = [];
    let totalPresent = 0, totalRegistered = 0;
    for (const event of events) {
      const registered = await Registration.countDocuments({ event: event._id });
      const present = await Attendance.countDocuments({ event: event._id, status: 'present' });
      totalPresent += present;
      totalRegistered += registered;
      data.push({ eventTitle: event.title, registered, present, absent: registered - present, percentage: registered > 0 ? ((present / registered) * 100).toFixed(1) : 0 });
    }
    res.json({ success: true, data: { chartData: data, totalPresent, totalAbsent: totalRegistered - totalPresent } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTeamAnalytics = async (req, res) => {
  try {
    const teams = await Team.find();
    const totalTeams = teams.length;
    const avgSize = totalTeams > 0 ? (teams.reduce((s, t) => s + t.members.length, 0) / totalTeams).toFixed(1) : 0;
    res.json({ success: true, data: { totalTeams, averageSize: parseFloat(avgSize) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeedbackAnalytics = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    const total = feedbacks.length;
    const avg = total > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / total).toFixed(1) : 0;
    const distribution = [0, 0, 0, 0, 0];
    feedbacks.forEach((f) => { distribution[f.rating - 1]++; });
    res.json({ success: true, data: { averageRating: parseFloat(avg), total, distribution } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
