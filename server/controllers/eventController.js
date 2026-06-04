const { supabaseAdmin } = require('../config/supabase');
const { logActivity } = require('../utils/activityLog');

// Upload image buffer to Supabase Storage
const uploadPoster = async (file) => {
  if (!file) return null;
  const ext = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('event-posters')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from('event-posters').getPublicUrl(fileName);
  return data.publicUrl;
};

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { search, category, date, status, page = 1, limit = 12 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabaseAdmin
      .from('events')
      .select('*, creator:profiles!created_by(name, email)', { count: 'exact' })
      .order('date', { ascending: true })
      .range(from, to);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category && category !== 'all') query = query.eq('category', category);
    if (status && status !== 'all') query = query.eq('status', status);
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query = query.gte('date', d.toISOString()).lt('date', next.toISOString());
    }

    const { data: events, count, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: {
        events: events.map(normalizeEvent),
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

// GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select('*, creator:profiles!created_by(name, email)')
      .eq('id', req.params.id)
      .single();

    if (error || !event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: { event: normalizeEvent(event) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'general',
      date: req.body.date,
      registration_deadline: req.body.registrationDeadline || req.body.registration_deadline || null,
      venue: req.body.venue,
      total_seats: parseInt(req.body.totalSeats || req.body.total_seats || 100),
      remaining_seats: parseInt(req.body.totalSeats || req.body.total_seats || 100),
      status: req.body.status || 'upcoming',
      is_team_event: req.body.isTeamEvent === 'true' || req.body.is_team_event === true,
      team_size_limit: parseInt(req.body.teamSizeLimit || req.body.team_size_limit || 4),
      created_by: req.user.id,
    };

    if (req.file) {
      eventData.poster_image = await uploadPoster(req.file);
    }

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert(eventData)
      .select('*, creator:profiles!created_by(name, email)')
      .single();

    if (error) throw error;

    await logActivity(req.user.id, 'Created event', 'event', event.id, event.title);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event: normalizeEvent(event) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      date: req.body.date,
      registration_deadline: req.body.registrationDeadline || req.body.registration_deadline,
      venue: req.body.venue,
      total_seats: req.body.totalSeats ? parseInt(req.body.totalSeats) : undefined,
      status: req.body.status,
      is_team_event: req.body.isTeamEvent !== undefined ? req.body.isTeamEvent === 'true' || req.body.isTeamEvent === true : undefined,
      team_size_limit: req.body.teamSizeLimit ? parseInt(req.body.teamSizeLimit) : undefined,
    };

    // Remove undefined keys
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    if (req.file) {
      updateData.poster_image = await uploadPoster(req.file);
    }

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .update(updateData)
      .eq('id', req.params.id)
      .select('*, creator:profiles!created_by(name, email)')
      .single();

    if (error || !event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await logActivity(req.user.id, 'Updated event', 'event', event.id, event.title);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event: normalizeEvent(event) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('id, title')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const { error } = await supabaseAdmin.from('events').delete().eq('id', req.params.id);
    if (error) throw error;

    await logActivity(req.user.id, 'Deleted event', 'event', event.id, event.title);

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Normalize snake_case DB columns to camelCase for frontend compatibility
function normalizeEvent(event) {
  if (!event) return null;
  return {
    ...event,
    _id: event.id,
    registrationDeadline: event.registration_deadline,
    totalSeats: event.total_seats,
    remainingSeats: event.remaining_seats,
    isTeamEvent: event.is_team_event,
    teamSizeLimit: event.team_size_limit,
    posterImage: event.poster_image,
    createdBy: event.creator || event.created_by,
    createdAt: event.created_at,
  };
}
