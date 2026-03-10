import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  checkAuth: () => api.get('/auth/check')
};

export const videos = {
  upload: (formData) => api.post('/videos/upload', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      // Remove default Content-Type header for FormData
      ...(formData instanceof FormData && { 'Content-Type': undefined })
    }
  }),
  getVideo: (id) => api.get(`/videos/${id}`),
  updateVideo: (id, data) => api.patch(`/videos/${id}`, data),
  deleteVideo: (id) => api.delete(`/videos/${id}`),
  getVideos: (params) => api.get('/search/videos', { params }),
  getTrending: () => api.get('/search/trending'),
  getByCategory: (category) => api.get(`/search/category/${category}`),
  getSuggested: (videoId) => api.get(`/search/suggested/${videoId}`),
  getComments: (videoId) => api.get(`/videos/${videoId}/comments`),
  addComment: (videoId, data) => api.post(`/videos/${videoId}/comments`, data),
  deleteComment: (videoId, commentId) => api.delete(`/videos/${videoId}/comments/${commentId}`)
};

export const subscriptions = {
  subscribe: (channelId) => api.post(`/subscriptions/${channelId}/subscribe`),
  unsubscribe: (channelId) => api.post(`/subscriptions/${channelId}/unsubscribe`),
  getSubscriptions: () => api.get('/subscriptions/subscriptions'),
  getSubscribers: (userId) => api.get(`/subscriptions/${userId}/subscribers`)
};

export default api;