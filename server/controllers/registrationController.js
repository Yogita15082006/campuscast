const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { sendRegistrationEmail } = require('../utils/email');
const { logActivity } = require('../utils/activityLog');

// POST /api/registrations/:eventId
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    // Check seats
    if (event.remainingSeats <= 0) {
      return res.status(400).json({ success: false, message: 'No seats available' });
    }

    // Check duplicate
    const existing = await Registration.findOne({ student: studentId, event: eventId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    // Create registration and atomically decrement seats
    const registration = await Registration.create({ student: studentId, event: eventId });
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { remainingSeats: -1 } },
      { new: true }
    );

    // Send email
    sendRegistrationEmail(
      req.user.email,
      req.user.name,
      event.title,
      event.date,
      event.venue
    );

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('seat_updated', {
        eventId: event._id,
        remainingSeats: updatedEvent.remainingSeats,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event',
      data: { registration, remainingSeats: updatedEvent.remainingSeats },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrations/my
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate('event')
      .populate('team')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { registrations } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrations/event/:eventId
exports.getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email')
      .populate('team', 'teamName teamCode')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { registrations } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/registrations/:id (cancel)
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Registration.findByIdAndDelete(req.params.id);
    const updatedEvent = await Event.findByIdAndUpdate(
      registration.event,
      { $inc: { remainingSeats: 1 } },
      { new: true }
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('seat_updated', {
        eventId: registration.event,
        remainingSeats: updatedEvent.remainingSeats,
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
    const registration = await Registration.findOne({
      student: req.user._id,
      event: req.params.eventId,
    });
    res.json({ success: true, data: { isRegistered: !!registration, registration } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrations/export/:eventId (CSV)
exports.exportRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email')
      .populate('event', 'title date venue');

    let csv = 'Student Name,Email,Event,Date,Status,Registered At\n';
    registrations.forEach((r) => {
      csv += `"${r.student?.name}","${r.student?.email}","${r.event?.title}","${r.event?.date}","${r.status}","${r.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=registrations-${req.params.eventId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
