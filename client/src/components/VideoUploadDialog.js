import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  TextField,
  Tab,
  Tabs,
  Input,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  Stop as StopIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { videos } from '../utils/api';

const VideoUploadDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const categories = [
    'Education',
    'Entertainment',
    'Gaming',
    'Music',
    'Tech',
    'Sports',
    'Other'
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        streamRef.current.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setRecordedBlob(null);
    setPreviewUrl('');
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setTabValue(0);
    setIsOpen(false);
  };

  const uploadVideo = async () => {
    try {
      // Validate required fields
      if (!recordedBlob && !selectedFile) {
        throw new Error('Please record a video or select a file to upload');
      }

      if (!title.trim()) {
        throw new Error('Please enter a title for your video');
      }

      if (!description.trim()) {
        throw new Error('Please enter a description for your video');
      }

      if (!category) {
        throw new Error('Please select a category for your video');
      }

      // Create FormData
      const formData = new FormData();
      
      // Add video file
      if (recordedBlob) {
        formData.append('video', recordedBlob, 'recorded-video.webm');
      } else if (selectedFile) {
        formData.append('video', selectedFile);
      }

      // Add metadata
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);

      // Log FormData contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await videos.upload(formData);
      handleClose();
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert(error.response?.data?.message || 'Failed to upload video. Please try again.');
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<VideocamIcon />}
        onClick={() => setIsOpen(true)}
      >
        Upload Video
      </Button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Upload Video
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              if (isRecording) {
                stopRecording();
              }
              setTabValue(newValue);
              setPreviewUrl('');
              setRecordedBlob(null);
              setSelectedFile(null);
            }}
            sx={{ mb: 2 }}
          >
            <Tab label="Record" />
            <Tab label="Upload File" />
          </Tabs>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              margin="normal"
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {tabValue === 0 && (
            <Box sx={{ position: 'relative', minHeight: 400 }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                style={{
                  width: '100%',
                  height: '400px',
                  backgroundColor: '#000',
                  display: !previewUrl ? 'block' : 'none'
                }}
              />
              {previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  style={{ width: '100%', height: '400px' }}
                />
              )}
              {!isRecording && !previewUrl && (
                <Typography
                  variant="body1"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff'
                  }}
                >
                  Click Record to start
                </Typography>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ position: 'relative', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                sx={{ mb: 2 }}
              />
              {previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  style={{ width: '100%', height: '400px' }}
                />
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {tabValue === 0 && (
            <>
              {!isRecording && !previewUrl && (
                <Button
                  onClick={startRecording}
                  variant="contained"
                  color="primary"
                  startIcon={<VideocamIcon />}
                >
                  Record
                </Button>
              )}
              {isRecording && (
                <Button
                  onClick={stopRecording}
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                >
                  Stop
                </Button>
              )}
            </>
          )}
          {(previewUrl || selectedFile) && (
            <Button
              onClick={uploadVideo}
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              disabled={!title.trim()}
            >
              Upload
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VideoUploadDialog;