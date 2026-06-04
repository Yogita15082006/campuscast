const { supabaseAdmin } = require('../config/supabase');

exports.submitFeedback = async (req, res) => {
  try {
    const { eventId, rating, comment, suggestions } = req.body;

    // Check event exists
    const { data: event, error: evtError } = await supabaseAdmin
      .from('events')
      .select('id, date')
      .eq('id', eventId)
      .single();

    if (evtError || !event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (new Date() < new Date(event.date)) {
      return res.status(400).json({ success: false, message: 'Cannot submit feedback before event date' });
    }

    // Check registered
    const { data: reg } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('student_id', req.user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (!reg) {
      return res.status(400).json({ success: false, message: 'You must be registered to give feedback' });
    }

    // Check duplicate
    const { data: existing } = await supabaseAdmin
      .from('feedback')
      .select('id')
      .eq('student_id', req.user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted' });
    }

    const { data: feedback, error } = await supabaseAdmin
      .from('feedback')
      .insert({
        student_id: req.user.id,
        event_id: eventId,
        rating: parseInt(rating),
        comment: comment || null,
        suggestions: suggestions || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Feedback submitted',
      data: { feedback: normalizeFeedback(feedback) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEventFeedback = async (req, res) => {
  try {
    const { data: feedbacks, error } = await supabaseAdmin
      .from('feedback')
      .select('*, student:profiles!student_id(id, name)')
      .eq('event_id', req.params.eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const avg = feedbacks.length > 0
      ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        feedbacks: feedbacks.map(normalizeFeedback),
        averageRating: parseFloat(avg),
        total: feedbacks.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const { data: feedbacks, error } = await supabaseAdmin
      .from('feedback')
      .select('*, event:events(id, title, date)')
      .eq('student_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: { feedbacks: feedbacks.map(normalizeFeedback) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function normalizeFeedback(f) {
  if (!f) return null;
  return {
    ...f,
    _id: f.id,
    student: f.student ? { ...f.student, _id: f.student.id } : f.student_id,
    event: f.event ? { ...f.event, _id: f.event.id } : f.event_id,
    createdAt: f.created_at,
  };
}
