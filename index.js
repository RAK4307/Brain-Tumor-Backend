require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- Import Routes ---
const authRoutes = require('./routes/auth');
const predictRoutes = require('./routes/predict');
const chatbotRoutes = require('./routes/chatbot');
const historyRoutes = require('./routes/history');

const app = express();

// --- Middleware ---
// Enable CORS. For production, you should restrict this to your frontend's domain.
// We'll use an environment variable for the client's origin URL for flexibility.
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
};
app.use(cors(corsOptions));

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

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));