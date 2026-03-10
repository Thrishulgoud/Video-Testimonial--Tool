import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  Box,
  Link
} from '@mui/material';

const VideoCard = ({ video }) => {
  // safe references
  const v = video || {};
  const user = v.user || {};

  const formatViews = (views) => {
    if (views == null || isNaN(Number(views))) return 0;
    const n = Number(views);
    if (n >= 1000000) {
      return `${(n / 1000000).toFixed(1)}M`;
    }
    if (n >= 1000) {
      return `${(n / 1000).toFixed(1)}K`;
    }
    return n;
  };

  const formatDuration = (seconds) => {
    if (seconds == null || isNaN(Number(seconds))) return '';
    const s = Number(seconds);
    const minutes = Math.floor(s / 60);
    const remainingSeconds = s % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const videoDate = new Date(date);
    if (isNaN(videoDate.getTime())) return '';
    const diffTime = Math.abs(now - videoDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <Card sx={{ maxWidth: 345, height: '100%' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="video"
          src={v.videoUrl ? `http://localhost:5001${v.videoUrl}` : undefined}
          poster={v.thumbnailUrl || '/uploads/default-thumbnail.jpg'}
          controls
          sx={{
            height: 200,
            textDecoration: 'none',
            display: 'block'
          }}
          title={v.title || 'Video'}
        />
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '2px 4px',
            borderRadius: 1
          }}
        >
          {formatDuration(v.duration)}
        </Typography>
      </Box>
      <CardContent>
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Avatar
            src={user.avatar || '/uploads/default-avatar.png'}
            alt={user.username || ''}
            sx={{ width: 40, height: 40, mr: 1 }}
          />
          <Box>
            <Link
              component={RouterLink}
              to={`/watch/${v._id || ''}`}
              color="inherit"
              underline="none"
            >
              <Typography
                gutterBottom
                variant="subtitle1"
                component="div"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.2em',
                  height: '2.4em'
                }}
              >
                {v.title || 'Untitled'}
              </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary">
              {user.username || 'Unknown'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatViews(v.views)} views • {formatDate(v.createdAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VideoCard;