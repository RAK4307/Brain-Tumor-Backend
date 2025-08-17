const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    image: { // Storing the image as a Base64 string
        type: String,
        required: true,
    },
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

const Analysis = mongoose.model('Analysis', AnalysisSchema);

module.exports = Analysis;