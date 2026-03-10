const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

// Subscribe to a channel
router.post('/:channelId/subscribe', auth, subscriptionController.subscribeToUser);

// Unsubscribe from a channel
router.post('/:channelId/unsubscribe', auth, subscriptionController.unsubscribeFromUser);

// Get user's subscriptions
router.get('/subscriptions', auth, subscriptionController.getSubscriptions);

// Get user's subscribers
router.get('/:userId/subscribers', subscriptionController.getSubscribers);

module.exports = router;