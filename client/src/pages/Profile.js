import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Button,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import VideoCard from '../components/VideoCard';
import { videos } from '../utils/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [tab, setTab] = useState(0);
  const [userVideos, setUserVideos] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: ''
  });
  const [driveStatus, setDriveStatus] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        if (user) {
          setFormData({
            username: user.username,
            email: user.email,
            avatar: user.avatar || ''
          });
          await fetchUserVideos();
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [user]);

  useEffect(() => {
    const checkDrive = () => {
      if (user && user.driveTokens) setDriveStatus(true);
      else setDriveStatus(false);
    };
    checkDrive();
  }, [user]);

  const fetchUserVideos = async () => {
    try {
      const response = await videos.getVideos({ userId: user._id });
      // API returns { videos, currentPage, totalPages, ... }
      setUserVideos(response.data.videos || response.data || []);
    } catch (error) {
      console.error('Error fetching user videos:', error);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      console.log(`Deleting video ${videoId}`);
      setDeletingIds((prev) => [...prev, videoId]);
      const response = await videos.deleteVideo(videoId);
      console.log('Delete response:', response?.data);
      setUserVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to delete video';
      // show a visible error to the user
      alert(msg);
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== videoId));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setEditOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConnectDrive = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/drive/connect`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Google consent
      }
    } catch (error) {
      console.error('Error connecting drive:', error);
      alert(error.message || 'Failed to initiate Google Drive connect');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Please login to view profile</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={user.avatar}
              alt={user.username}
              sx={{ width: 100, height: 100 }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h5">{user.username}</Typography>
            <Typography color="textSecondary">{user.email}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {user.subscribers?.length || 0} Subscribers
            </Typography>
          </Grid>
          <Grid item>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={() => setEditOpen(true)}
            >
              Edit Profile
            </Button>
            <Box sx={{ mt: 1 }}>
              {driveStatus ? (
                <Button variant="contained" disabled>Google Drive Connected</Button>
              ) : (
                <Button variant="contained" onClick={handleConnectDrive}>Connect Google Drive</Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Videos" />
        <Tab label="Liked Videos" />
        <Tab label="Subscriptions" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          {userVideos.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
              <VideoCard video={video} />
              <Button
                variant="outlined"
                color="error"
                sx={{ mt: 1 }}
                onClick={() => handleDeleteVideo(video._id)}
                disabled={deletingIds.includes(video._id)}
              >
                {deletingIds.includes(video._id) ? 'Deleting...' : 'Delete'}
              </Button>
            </Grid>
          ))}
          {userVideos.length === 0 && (
            <Grid item xs={12}>
              <Typography align="center">No videos uploaded yet</Typography>
            </Grid>
          )}
        </Grid>
      )}

      {tab === 1 && (
        <Typography align="center">Liked videos will appear here</Typography>
      )}

      {tab === 2 && (
        <Typography align="center">Subscriptions will appear here</Typography>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Avatar URL"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;