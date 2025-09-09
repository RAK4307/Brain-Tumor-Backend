const express = require('express');
const router = express.Router();

// In-memory store for OTPs (use DB for production)
const otpStore = {};

// POST /api/verify-otp
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }
  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ message: 'No OTP found for this email.' });
  }
  if (record.otp !== otp) {
    return res.status(401).json({ message: 'Invalid OTP.' });
  }
  if (Date.now() > record.expires) {
    return res.status(410).json({ message: 'OTP expired.' });
  }
  // OTP is valid
  delete otpStore[email]; // Remove OTP after successful verification
  res.json({ message: 'OTP verified successfully.' });
});

module.exports = { otpStore, verifyOtpRouter: router };
