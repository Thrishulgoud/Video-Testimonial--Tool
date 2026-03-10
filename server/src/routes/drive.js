const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const config = require('../config/config');
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  config.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Get auth URL (includes signed state to associate with user)
router.get('/connect', auth, async (req, res) => {
  try {
    const state = jwt.sign({ userId: req.user._id }, config.JWT_SECRET, { expiresIn: '10m' });
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state
    });
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// OAuth callback: exchange code, verify state, save tokens to user, then redirect to frontend
router.get('/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const stateToken = req.query.state;
    if (!stateToken) return res.status(400).json({ message: 'Missing state' });

    let payload;
    try {
      payload = jwt.verify(stateToken, config.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid state token' });
    }

    const { tokens } = await oauth2Client.getToken(code);

    const user = await User.findById(payload.userId);
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Save tokens to user
    user.driveTokens = tokens;
    await user.save();

    const frontend = config.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontend}/?drive=connected`);
  } catch (error) {
    console.error('Drive callback error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload endpoint
const upload = multer({ dest: '/tmp/uploads' });
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.user.driveTokens) return res.status(400).json({ message: 'Google Drive not connected' });

    const oauthClient = new google.auth.OAuth2(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      config.GOOGLE_REDIRECT_URI
    );
    oauthClient.setCredentials(req.user.driveTokens);

    const drive = google.drive({ version: 'v3', auth: oauthClient });

    const fileMetadata = {
      name: req.file.originalname
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, webViewLink'
    });

    // cleanup
    try { fs.unlinkSync(req.file.path); } catch (e) { /* noop */ }

    res.json({ driveFileId: response.data.id, link: response.data.webViewLink });
  } catch (error) {
    console.error('Drive upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
