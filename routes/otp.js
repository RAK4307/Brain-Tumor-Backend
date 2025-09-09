const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const User = require('../models/User');

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/send-otp
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^([\w-.]+)@([\w-]+)\.([\w]{2,})$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'No account found with this email.' });
  }

  const otp = generateOTP();

  // Store OTP for verification (valid for 10 minutes)
  const { otpStore } = require('./verifyOtp');
  otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };

  // Configure your mail transporter (use environment variables for real projects)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // Professional email content
  const mailOptions = {
    from: 'Brain Tumor Detection <no-reply@btd.com>',
    to: email,
    subject: 'Your OTP for Password Reset',
    html: `<div style="font-family:Arial,sans-serif;">
      <h2 style="color:#2563eb;">Brain Tumor Detection</h2>
      <p>Dear User,</p>
      <p>Your One-Time Password (OTP) for password reset is:</p>
      <div style="font-size:2rem;font-weight:bold;color:#1e40af;margin:1rem 0;">${otp}</div>
      <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
      <p>If you did not request this, please ignore this email.</p>
      <br>
      <p>Best regards,<br>Brain Tumor Detection Team</p>
    </div>`
  };

  try {
    await transporter.sendMail(mailOptions);
    // TODO: Save OTP to DB or cache for verification
    res.json({ message: 'OTP sent successfully.', otp }); // Remove otp in production
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP.', error: error.message });
  }
});

module.exports = router;
