const Announcement = require('../models/Announcement');
const { logActivity } = require('../utils/activityLog');

exports.createAnnouncement = async (req, res) => {
  try {
    const { message, eventId, priority } = req.body;
    const announcement = await Announcement.create({
      message, event: eventId || null, createdBy: req.user._id, priority: priority || 'medium',
    });
    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name').populate('event', 'title');
    const io = req.app.get('io');
    if (io) {
      io.emit('live_announcement', {
        message: populated.message, eventId: populated.event?._id, eventTitle: populated.event?.title,
        priority: populated.priority, timestamp: populated.createdAt, sender: populated.createdBy?.name,
      });
    }
    await logActivity(req.user._id, 'Sent announcement', 'announcement', announcement._id, message.substring(0, 100));
    res.status(201).json({ success: true, message: 'Announcement sent', data: { announcement: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { eventId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (eventId) query.event = eventId;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query).populate('createdBy', 'name').populate('event', 'title').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ success: true, data: { announcements, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
