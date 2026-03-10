import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const SubscribeButton = ({ channelId, initialIsSubscribed = false }) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSubscribed(initialIsSubscribed);
  }, [initialIsSubscribed]);

  const handleSubscribe = async () => {
    if (!user) {
      // Redirect to login or show login dialog
      return;
    }

    try {
      setLoading(true);
      if (isSubscribed) {
        await api.post(`/subscriptions/${channelId}/unsubscribe`);
      } else {
        await api.post(`/subscriptions/${channelId}/subscribe`);
      }
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error('Error updating subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user._id === channelId) {
    return null;
  }

  return (
    <Button
      variant={isSubscribed ? "outlined" : "contained"}
      color={isSubscribed ? "error" : "primary"}
      onClick={handleSubscribe}
      disabled={loading}
    >
      {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
    </Button>
  );
};

export default SubscribeButton;