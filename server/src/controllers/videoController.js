const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Video = require('../models/Video');
const { uploadToLocal } = require('../services/storage');

const uploadVideo = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    // Log request body and file for debugging
    console.log('Request body:', req.body);
    console.log('File details:', req.file);

    // Validate required fields
    const { title, description, category } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const videoId = uuidv4();
    const tempPath = req.file.path;

    // Upload video to local storage
    const originalKey = `${videoId}${path.extname(req.file.originalname)}`;
    const videoUrl = await uploadToLocal(req.file, originalKey);
    const thumbnailUrl = '/uploads/default-thumbnail.jpg'; // Default thumbnail for now

    // Create video document
    const video = new Video({
      title,
      description,
      category,
      user: req.user._id,
      videoUrl,
      thumbnailUrl,
      duration: 0, // We'll add proper duration later
      status: 'ready'
    });

    await video.save();

    res.status(201).json({
      message: 'Video upload started',
      videoId: video._id,
      status: 'processing'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processVideo = async (videoId, tempPath) => {
  try {
    const video = await Video.findById(videoId);
    if (!video) throw new Error('Video not found');

    // Generate thumbnail
    const thumbnailUrl = await VideoProcessor.generateThumbnail(tempPath);
    video.thumbnailUrl = thumbnailUrl;

    // Process video
    const processedUrl = await VideoProcessor.processVideo(tempPath, videoId);
    video.videoUrl = processedUrl;

    // Get video duration
    const duration = await VideoProcessor.getDuration(tempPath);
    video.duration = duration;

    // Update video status
    video.status = 'ready';
    await video.save();

    // Cleanup
    fs.unlinkSync(tempPath);
  } catch (error) {
    console.error('Video processing error:', error);
    await Video.findByIdAndUpdate(videoId, { status: 'failed' });
  }
};

const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVideo = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'category'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const video = await Video.findOne({ _id: req.params.id, user: req.user._id });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    updates.forEach(update => video[update] = req.body[update]);
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, user: req.user._id });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    try {
      // Remove stored file if it exists (videoUrl is like '/uploads/filename')
      if (video.videoUrl) {
        const { deleteFromLocal } = require('../services/storage');
        try {
          await deleteFromLocal(video.videoUrl);
        } catch (err) {
          // Log and continue; failure to delete file shouldn't block DB deletion
          console.error('Failed to delete local file:', err.message || err);
        }
      }

      // Use deleteOne() (remove() may not exist on modern mongoose documents)
      await video.deleteOne();
      res.json({ message: 'Video deleted successfully' });
    } catch (err) {
      console.error('Error during video deletion:', err);
      return res.status(500).json({ message: 'Failed to delete video' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadVideo,
  getVideo,
  updateVideo,
  deleteVideo
};