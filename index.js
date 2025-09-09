require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- Import Routes ---
const authRoutes = require('./routes/auth');
const predictRoutes = require('./routes/predict');
const chatbotRoutes = require('./routes/chatbot');
const historyRoutes = require('./routes/history');
const otpRoutes = require('./routes/otp');
const { otpStore, verifyOtpRouter } = require('./routes/verifyOtp');
const resetPasswordRouter = require('./routes/resetPassword');

const app = express();

// --- Middleware ---
// Enable CORS for your React frontend
app.use(cors({ origin: 'http://localhost:3000' })); 

app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
// The frontend expects these routes at the root level
app.use('/', authRoutes); // for /login, /signup
app.use('/predict', predictRoutes);
app.use('/chatbot', chatbotRoutes);
app.use('/history', historyRoutes);
app.use('/api', otpRoutes);
app.use('/api', verifyOtpRouter);
app.use('/api', resetPasswordRouter);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// In your send-otp route, after generating the OTP:
// otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };