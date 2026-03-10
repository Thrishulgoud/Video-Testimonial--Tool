import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { videos } from '../utils/api';

const VideosPage = () => {
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await videos.getVideos({});
      setUserVideos(response.data.videos);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading videos...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Videos
      </Typography>

      <Grid container spacing={3}>
        {userVideos.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video._id}>
            <Card>
              <Box sx={{ width: '100%', position: 'relative', pt: '56.25%' }}>
                <Box
                  component="video"
                  src={`http://localhost:5001${video.videoUrl}`}
                  controls
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {video.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {video.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Avatar
                    src={video.user?.avatar}
                    alt={video.user?.username}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {video.user?.username}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {userVideos.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center">No videos found</Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default VideosPage;