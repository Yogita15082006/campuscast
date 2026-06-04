const cron = require('node-cron');
const { supabaseAdmin } = require('../config/supabase');
const { sendReminderEmail } = require('./email');

const startCronJobs = () => {
  // Run every day at 9:00 AM — send reminders for events happening tomorrow
  cron.schedule('0 9 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      // Fetch upcoming events happening tomorrow
      const { data: upcomingEvents, error: evtError } = await supabaseAdmin
        .from('events')
        .select('id, title, date, venue')
        .eq('status', 'upcoming')
        .gte('date', tomorrow.toISOString())
        .lt('date', dayAfter.toISOString());

      if (evtError) throw evtError;

      for (const event of upcomingEvents || []) {
        // Fetch registrations with student profile
        const { data: registrations } = await supabaseAdmin
          .from('registrations')
          .select('id, status, student:profiles!student_id(name, email)')
          .eq('event_id', event.id)
          .eq('status', 'registered');

        for (const reg of registrations || []) {
          if (reg.student?.email) {
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

      console.log(`[CRON] Reminder emails sent for ${(upcomingEvents || []).length} events`);
    } catch (error) {
      console.error('[CRON] Reminder email error:', error.message);
    }
  });

  console.log('Cron jobs started');
};

module.exports = { startCronJobs };
