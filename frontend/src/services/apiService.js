// src/services/apiService.js
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include access token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: () => apiClient.get('/user/userLogin'),
  getUserDetails: () => apiClient.get('/user/userDetails'),
};

// Post APIs
export const postAPI = {
  createPost: (postData) => apiClient.post('/post/createPost', postData),
  getHomePosts: () => apiClient.get('/post/getHomePosts'),
  likePost: (postId) => apiClient.post('/post/like', { postId }),
  getUserPosts: () => apiClient.get('/user/myBlogs'),
  getLikedPosts: () => apiClient.get('/user/myLikedPosts'),
};

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data || 'An error occurred';
  } else if (error.request) {
    return 'Network error - please try again';
  } else {
    return 'An unexpected error occurred';
  }
};

export default apiClient;