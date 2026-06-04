const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.log('Email transporter not configured:', error.message);
  } else {
    console.log('Email transporter ready');
  }
});

module.exports = transporter;
