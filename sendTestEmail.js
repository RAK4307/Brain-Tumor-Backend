const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTestEmail() {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    let info = await transporter.sendMail({
      from: `Brain Tumor Detection <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: 'Test Email from Nodemailer',
      text: 'This is a test email to verify Nodemailer setup.',
      html: '<b>This is a test email to verify Nodemailer setup.</b>',
    });
    console.log('Test email sent:', info.messageId);
  } catch (err) {
    console.error('Error sending test email:', err);
  }
}

sendTestEmail();
