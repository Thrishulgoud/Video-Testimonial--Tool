const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Get videos with search, filters, and pagination
router.get('/videos', searchController.getVideos);

// Get trending videos
router.get('/trending', searchController.getTrendingVideos);

// Get videos by category
router.get('/category/:category', searchController.getVideosByCategory);

// Get suggested videos
router.get('/suggested/:videoId', searchController.getSuggestedVideos);

module.exports = router;