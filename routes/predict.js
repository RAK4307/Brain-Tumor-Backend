const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Multer setup for file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// The actual prediction endpoint
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    // --- YOUR AI MODEL LOGIC GOES HERE ---
    // For now, we'll return a dummy response.
    // In a real application, you would call your Python service from here.

    console.log(`User ${req.user.id} is making a prediction.`);
    console.log("Received file:", req.file.originalname);

    // Dummy prediction logic
    const predictions = ["Glioma Tumor", "Meningioma Tumor", "No Tumor", "Pituitary Tumor"];
    const prediction = predictions[Math.floor(Math.random() * predictions.length)];
    const confidence = Math.random() * (0.99 - 0.85) + 0.85; // Random confidence between 85% and 99%

    res.json({
        prediction: prediction,
        confidence: confidence
    });
});

module.exports = router;

