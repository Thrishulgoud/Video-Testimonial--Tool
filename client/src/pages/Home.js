import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Container } from '@mui/material';
import VideoCard from '../components/VideoCard';
import { videos } from '../utils/api';

const Home = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await videos.getVideos({});
      setAllVideos(response.data.videos);
      setLoading(false);
    } catch (err) {
      setError('Failed to load videos');
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

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {allVideos.map((video) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
            <VideoCard video={video} />
          </Grid>
        ))}
        {allVideos.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center">No videos available</Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Home;