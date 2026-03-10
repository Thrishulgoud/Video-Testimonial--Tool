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
} from '@mui/material';

import {
  Videocam as VideocamIcon,
  Stop as StopIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import { videos } from '../utils/api';
import api from '../utils/api';

const VideoRecorder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // START RECORDING
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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));

        streamRef.current.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error('Camera access error:', error);
      alert('Could not access camera.');
    }
  };

  // STOP RECORDING
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // UPLOAD VIDEO
  const uploadVideo = async () => {
    if (!recordedBlob) {
      alert('Please record a video first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('video', recordedBlob, 'recorded-video.webm');
      formData.append('title', 'Recorded Testimonial');
      formData.append('description', 'Recorded using webcam');

      // Upload to main backend video API
      await videos.uploadVideo(formData);

      // Upload the same file to Google Drive
      const driveForm = new FormData();
      driveForm.append('file', recordedBlob, 'recorded-video.webm');

      await api.post('/drive/upload', driveForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Video uploaded and saved to Google Drive!');

      handleClose();

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  // CLOSE DIALOG
  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setRecordedBlob(null);
    setPreviewUrl('');
    setIsRecording(false);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<VideocamIcon />}
        onClick={() => setIsOpen(true)}
      >
        Record Video
      </Button>

      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>

        <DialogTitle>
          Record Video
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>

          <Box sx={{ position: 'relative', minHeight: 400 }}>

            <video
              ref={videoRef}
              autoPlay
              muted
              style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#000',
                display: !previewUrl ? 'block' : 'none',
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
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#fff',
                }}
              >
                Click Record to start
              </Typography>
            )}

          </Box>

        </DialogContent>

        <DialogActions>

          {!isRecording && !previewUrl && (
            <Button
              variant="contained"
              startIcon={<VideocamIcon />}
              onClick={startRecording}
            >
              Record
            </Button>
          )}

          {isRecording && (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopRecording}
            >
              Stop
            </Button>
          )}

          {previewUrl && (
            <>
              <Button
                variant="outlined"
                startIcon={<VideocamIcon />}
                onClick={startRecording}
              >
                Record Again
              </Button>

              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={uploadVideo}
              >
                Upload
              </Button>
            </>
          )}

        </DialogActions>

      </Dialog>
    </>
  );
};

export default VideoRecorder;