const User = require('../models/User');

const subscribeToUser = async (req, res) => {
  try {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    // Can't subscribe to yourself
    if (channelId === subscriberId.toString()) {
      return res.status(400).json({ message: "You can't subscribe to yourself" });
    }

    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if already subscribed
    const isSubscribed = channel.subscribers.includes(subscriberId);
    if (isSubscribed) {
      return res.status(400).json({ message: 'Already subscribed to this channel' });
    }

    // Add subscriber to channel
    channel.subscribers.push(subscriberId);
    await channel.save();

    // Add channel to user's subscriptions
    const subscriber = await User.findById(subscriberId);
    subscriber.subscribedTo.push(channelId);
    await subscriber.save();

    res.json({ message: 'Successfully subscribed to channel' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unsubscribeFromUser = async (req, res) => {
  try {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Remove subscriber from channel
    channel.subscribers = channel.subscribers.filter(
      id => id.toString() !== subscriberId.toString()
    );
    await channel.save();

    // Remove channel from user's subscriptions
    const subscriber = await User.findById(subscriberId);
    subscriber.subscribedTo = subscriber.subscribedTo.filter(
      id => id.toString() !== channelId.toString()
    );
    await subscriber.save();

    res.json({ message: 'Successfully unsubscribed from channel' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubscriptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('subscribedTo', 'username avatar');
    
    res.json(user.subscribedTo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('subscribers', 'username avatar');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  subscribeToUser,
  unsubscribeFromUser,
  getSubscriptions,
  getSubscribers
};