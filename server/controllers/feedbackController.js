const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

exports.submitFeedback = async (req, res) => {
  try {
    const { eventId, rating, comment, suggestions } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (new Date() < new Date(event.date)) return res.status(400).json({ success: false, message: 'Cannot submit feedback before event date' });
    const reg = await Registration.findOne({ student: req.user._id, event: eventId });
    if (!reg) return res.status(400).json({ success: false, message: 'You must be registered to give feedback' });
    const existing = await Feedback.findOne({ student: req.user._id, event: eventId });
    if (existing) return res.status(400).json({ success: false, message: 'Feedback already submitted' });
    const feedback = await Feedback.create({ student: req.user._id, event: eventId, rating, comment, suggestions });
    res.status(201).json({ success: true, message: 'Feedback submitted', data: { feedback } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEventFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId }).populate('student', 'name').sort({ createdAt: -1 });
    const avg = feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : 0;
    res.json({ success: true, data: { feedbacks, averageRating: parseFloat(avg), total: feedbacks.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ student: req.user._id }).populate('event', 'title date').sort({ createdAt: -1 });
    res.json({ success: true, data: { feedbacks } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
