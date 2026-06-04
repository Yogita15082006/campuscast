const { supabaseAdmin } = require('../config/supabase');
const { logActivity } = require('../utils/activityLog');

exports.createAnnouncement = async (req, res) => {
  try {
    const { message, eventId, priority } = req.body;

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        message,
        event_id: eventId || null,
        created_by: req.user.id,
        priority: priority || 'medium',
      })
      .select(`
        *,
        creator:profiles!created_by(id, name),
        event:events(id, title)
      `)
      .single();

    if (error) throw error;

    const io = req.app.get('io');
    if (io) {
      io.emit('live_announcement', {
        message: announcement.message,
        eventId: announcement.event?.id,
        eventTitle: announcement.event?.title,
        priority: announcement.priority,
        timestamp: announcement.created_at,
        sender: announcement.creator?.name,
      });
    }

    await logActivity(req.user.id, 'Sent announcement', 'announcement', announcement.id, message.substring(0, 100));

    res.status(201).json({
      success: true,
      message: 'Announcement sent',
      data: { announcement: normalizeAnnouncement(announcement) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { eventId, page = 1, limit = 20 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabaseAdmin
      .from('announcements')
      .select(`
        *,
        creator:profiles!created_by(id, name),
        event:events(id, title)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (eventId) query = query.eq('event_id', eventId);

    const { data: announcements, count, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: {
        announcements: announcements.map(normalizeAnnouncement),
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function normalizeAnnouncement(a) {
  if (!a) return null;
  return {
    ...a,
    _id: a.id,
    createdBy: a.creator ? { ...a.creator, _id: a.creator.id } : a.created_by,
    event: a.event ? { ...a.event, _id: a.event.id } : a.event_id,
    createdAt: a.created_at,
  };
}
