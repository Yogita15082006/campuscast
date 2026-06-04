const transporter = require('../config/email');

const sendRegistrationEmail = async (studentEmail, studentName, eventName, eventDate, venue) => {
  const mailOptions = {
    from: `"CampusCast" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `✅ Registration Confirmed - ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0; opacity: 0.9; }
          .content { padding: 30px; }
          .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: 600; color: #555; width: 120px; }
          .detail-value { color: #333; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 13px; }
          .badge { display: inline-block; background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Registration Confirmed!</h1>
            <p>CampusCast Event Portal</p>
          </div>
          <div class="content">
            <p>Hi <strong>${studentName}</strong>,</p>
            <p>You have successfully registered for the following event:</p>
            <div style="margin: 20px 0;">
              <div class="detail-row"><span class="detail-label">📌 Event:</span><span class="detail-value">${eventName}</span></div>
              <div class="detail-row"><span class="detail-label">📅 Date:</span><span class="detail-value">${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
              <div class="detail-row"><span class="detail-label">📍 Venue:</span><span class="detail-value">${venue}</span></div>
            </div>
            <p>Please arrive on time and look for the attendance code at the venue to mark your presence.</p>
            <p style="margin-top: 20px; color: #888;">See you there! 🚀</p>
          </div>
          <div class="footer">
            <p>This is an automated message from CampusCast. Do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

const sendReminderEmail = async (studentEmail, studentName, eventName, eventDate, venue) => {
  const mailOptions = {
    from: `"CampusCast" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `⏰ Reminder: ${eventName} is Tomorrow!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Event Reminder</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${studentName}</strong>,</p>
            <p>This is a friendly reminder that <strong>${eventName}</strong> is happening tomorrow!</p>
            <p>📅 <strong>${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
            <p>📍 <strong>${venue}</strong></p>
            <p>Don't forget to attend and mark your presence using the attendance code provided at the venue.</p>
          </div>
          <div class="footer">
            <p>CampusCast - Your Campus Event Portal</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Reminder email failed:', error.message);
  }
};

module.exports = { sendRegistrationEmail, sendReminderEmail };
