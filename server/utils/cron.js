const cron = require('node-cron');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { sendReminderEmail } = require('./email');

const startCronJobs = () => {
  // Run every day at 9:00 AM to send reminders for events happening tomorrow
  cron.schedule('0 9 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const upcomingEvents = await Event.find({
        date: { $gte: tomorrow, $lt: dayAfter },
        status: 'upcoming',
      });

      for (const event of upcomingEvents) {
        const registrations = await Registration.find({ event: event._id, status: 'registered' }).populate('student');

        for (const reg of registrations) {
          if (reg.student && reg.student.email) {
            await sendReminderEmail(
              reg.student.email,
              reg.student.name,
              event.title,
              event.date,
              event.venue
            );
          }
        }
      }

      console.log(`[CRON] Reminder emails sent for ${upcomingEvents.length} events`);
    } catch (error) {
      console.error('[CRON] Reminder email error:', error.message);
    }
  });

  console.log('Cron jobs started');
};

module.exports = { startCronJobs };
