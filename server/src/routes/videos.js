const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const videoController = require('../controllers/videoController');
const auth = require('../middleware/auth');

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: '/tmp',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/ogg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, AVI, WebM, and OGG files are allowed.'));
    }
  }
});

const { validateVideoUpload } = require('../middleware/videoValidation');

// Upload video route
router.post('/upload', 
  auth,
  upload.single('video'),
  videoController.uploadVideo
);

// Get video by ID
router.get('/:id', videoController.getVideo);

// Update video
router.patch('/:id', auth, videoController.updateVideo);

// Delete video
router.delete('/:id', auth, videoController.deleteVideo);

module.exports = router;