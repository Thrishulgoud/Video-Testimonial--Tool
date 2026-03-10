import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import {
  Box,
  IconButton,
  LinearProgress,
  Typography,
  Grid,
  Avatar,
  Button,
  Paper
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Share,
  ThumbUpOutlined,
  ThumbDownOutlined
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SubscribeButton from './SubscribeButton';
import Comments from './Comments';

const VideoPlayer = ({ video, onLike, onDislike }) => {
  const { user } = useAuth();
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const handleProgress = (state) => {
    setProgress(state.played * 100);
  };

  const isLiked = user && video.likes.includes(user._id);
  const isDisliked = user && video.dislikes.includes(user._id);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
        <ReactPlayer
          url={video.videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          playing={playing}
          controls
          onProgress={handleProgress}
        />
      </Box>

      <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />

      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          {video.title}
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar src={video.user.avatar} alt={video.user.username} />
          </Grid>
          <Grid item xs>
            <Typography variant="subtitle1">
              {video.user.username}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {video.views} views • {formatDate(video.createdAt)}
            </Typography>
          </Grid>
          <Grid item>
            <SubscribeButton
              channelId={video.user._id}
              initialIsSubscribed={video.user.isSubscribed}
            />
          </Grid>
          <Grid item>
            <IconButton onClick={() => onLike(video._id)}>
              {isLiked ? <ThumbUp /> : <ThumbUpOutlined />}
            </IconButton>
            <IconButton onClick={() => onDislike(video._id)}>
              {isDisliked ? <ThumbDown /> : <ThumbDownOutlined />}
            </IconButton>
            <IconButton>
              <Share />
            </IconButton>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            {video.description}
          </Typography>
        </Box>

        <Comments videoId={video._id} />
      </Paper>
    </Box>
  );
};

export default VideoPlayer;