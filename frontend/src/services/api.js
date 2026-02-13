/**
 * API Configuration
 * =================
 * Base configuration for API calls using Axios.
 * Sets up default headers, base URL, and interceptors.
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5001',  // Flask backend URL
  timeout: 10000,                    // 10 second timeout
  withCredentials: true,             // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token, etc.)
api.interceptors.request.use(
  (config) => {
    // You can add authorization headers here if using JWT
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.error('Unauthorized access');
          // Optionally redirect to login
          // window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Forbidden access');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('API error:', error.response.status);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
    } else {
      // Error setting up request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
