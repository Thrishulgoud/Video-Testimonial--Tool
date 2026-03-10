const Video = require('../models/Video');

const addComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.comments.push({
      user: userId,
      text
    });

    await video.save();

    // Populate the user info for the new comment
    const populatedVideo = await Video.findById(videoId)
      .populate('comments.user', 'username avatar');

    const newComment = populatedVideo.comments[populatedVideo.comments.length - 1];

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const comment = video.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment owner or video owner
    if (comment.user.toString() !== userId.toString() && 
        video.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await video.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { sort = 'recent' } = req.query;

    const video = await Video.findById(videoId)
      .populate('comments.user', 'username avatar');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Sort comments
    if (sort === 'recent') {
      video.comments.sort((a, b) => b.createdAt - a.createdAt);
    }

    res.json(video.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  deleteComment,
  getComments
};