// server/utils/sendEmail.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Use STARTTLS, which is standard for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

const sendEmail = async (to, subject, text, html, attachments = []) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Set the "from" field using EMAIL_USER
    to,
    subject,
    text,
    html,
    attachments, // Include attachments if provided
  };

  try {
    console.log(
      `Attempting to send email to ${to} with subject "${subject}"...`
    );
    console.log('Attachments:', attachments);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully with attachments');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};

module.exports = sendEmail;
