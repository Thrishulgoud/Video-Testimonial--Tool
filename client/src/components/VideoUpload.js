import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  LinearProgress,
  Alert
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { videos } from '../utils/api';
import api from '../utils/api';

const categories = [
  'Education',
  'Entertainment',
  'Gaming',
  'Music',
  'Tech',
  'Sports',
  'Other'
];

const VideoUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [saveToDrive, setSaveToDrive] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid video file');
      setFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!file || !title || !description || !category) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);

      const response = await videos.upload(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(progress);
        }
      });

      // If user requested saving to Drive, upload to server drive endpoint
      if (saveToDrive) {
        const driveForm = new FormData();
        driveForm.append('file', file, file.name);
        try {
          // use axios instance so Authorization header is included
          await api.post('/drive/upload', driveForm, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (driveErr) {
          console.error('Drive upload failed:', driveErr);
          // show a user-friendly message but do not block main flow
          setError(driveErr.response?.data?.message || 'Failed to save to Google Drive');
        }
      }

      navigate(`/watch/${response.data.videoId}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Upload Video
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            border: '2px dashed grey',
            borderRadius: 1,
            p: 3,
            mb: 2,
            textAlign: 'center'
          }}
        >
          <input
            accept="video/*"
            style={{ display: 'none' }}
            id="video-file"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="video-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
              disabled={uploading}
            >
              Select Video
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {file.name}
            </Typography>
          )}
        </Box>

        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          disabled={uploading}
        />

        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          disabled={uploading}
        />

        <TextField
          fullWidth
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          margin="normal"
          disabled={uploading}
        >
          {categories.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ mb: 2 }}>
          <label>
            <input type="checkbox" checked={saveToDrive} onChange={(e) => setSaveToDrive(e.target.checked)} /> Save a copy to Google Drive
          </label>
        </Box>

        {uploading && (
          <Box sx={{ my: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Uploading: {progress}%
            </Typography>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{ mt: 2 }}
          disabled={uploading || !file}
        >
          Upload Video
        </Button>
      </Box>
    </Paper>
  );
};

export default VideoUpload;