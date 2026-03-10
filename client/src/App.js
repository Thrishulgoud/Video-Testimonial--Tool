import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import theme from './utils/theme';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';
import Home from './pages/Home';
import VideosPage from './pages/VideosPage';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

const Watch = () => <div>Watch Page</div>;

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
            <Container>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/upload" element={<VideoUpload />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/watch/:id" element={<Watch />} />
                <Route path="/search" element={<SearchResults />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;