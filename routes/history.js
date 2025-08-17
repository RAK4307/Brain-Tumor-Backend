const express = require('express');
const authMiddleware = require('../middleware/auth');
const Analysis = require('../models/Analysis');

const router = express.Router();

// @route   GET /history
// @desc    Get all analysis history for the logged-in user
// @desc    Supports pagination with 'page' and 'limit' query params
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 9; // Default to 9 for a 3-col grid
        const skip = (page - 1) * limit;

        const totalRecords = await Analysis.countDocuments({ user: req.user.id });
        const totalPages = Math.ceil(totalRecords / limit);

        const history = await Analysis.find({ user: req.user.id })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        // Set headers to prevent caching on this endpoint
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json({
            history,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /history
// @desc    Save a new analysis result
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { image, result } = req.body;

        // Add more specific validation
        if (!image || !result || typeof result.prediction === 'undefined' || typeof result.confidence === 'undefined') {
            return res.status(400).json({ message: 'Image, prediction, and confidence are required.' });
        }

        const newAnalysis = new Analysis({
            user: req.user.id,
            image: image,
            prediction: result.prediction,
            confidence: result.confidence,
        });

        await newAnalysis.save();
        res.status(201).json(newAnalysis);
    } catch (error) {
        console.error('Error saving analysis:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /history
// @desc    Delete all analysis history for the logged-in user
// @access  Private
router.delete('/', authMiddleware, async (req, res) => {
    try {
        // Find and delete all analysis records for the current user
        await Analysis.deleteMany({ user: req.user.id });
        res.json({ message: 'History cleared successfully.' });
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /history/:id
// @desc    Delete a single analysis history item
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const analysis = await Analysis.findById(req.params.id);

        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found.' });
        }

        // Ensure the user owns the analysis record
        if (analysis.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this item.' });
        }

        await Analysis.findByIdAndDelete(req.params.id);

        res.json({ message: 'Analysis deleted successfully.' });
    } catch (error) {
        console.error('Error deleting analysis item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;