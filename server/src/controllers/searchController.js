const Video = require('../models/Video');

const getVideos = async (req, res) => {
  try {
    const {
      search,
      category,
      sort = 'recent',
      page = 1,
      limit = 12,
      userId
    } = req.query;

    const query = {};
    
    // Search by title and description
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by user (for profile / my videos)
    if (userId) {
      query.user = userId;
    }

    // Sort options
    const sortOptions = {
      recent: { createdAt: -1 },
      popular: { views: -1 },
      trending: { views: -1, createdAt: -1 }
    };

    const videos = await Video.find(query)
      .sort(sortOptions[sort])
      .populate('user', 'username avatar')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Video.countDocuments(query);

    res.json({
      videos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalVideos: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrendingVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ views: -1, createdAt: -1 })
      .limit(10)
      .populate('user', 'username avatar');

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const videos = await Video.find({ category })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .limit(20);

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSuggestedVideos = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const suggestedVideos = await Video.find({
      _id: { $ne: videoId },
      $or: [
        { category: video.category },
        { user: video.user }
      ]
    })
      .sort({ views: -1 })
      .populate('user', 'username avatar')
      .limit(10);

    res.json(suggestedVideos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVideos,
  getTrendingVideos,
  getVideosByCategory,
  getSuggestedVideos
};