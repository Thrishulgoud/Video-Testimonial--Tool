const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Get video comments
router.get('/:videoId/comments', commentController.getComments);

// Add a comment
router.post('/:videoId/comments', auth, commentController.addComment);

// Delete a comment
router.delete('/:videoId/comments/:commentId', auth, commentController.deleteComment);

module.exports = router;