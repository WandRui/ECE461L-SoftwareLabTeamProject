/**
 * Authentication Service
 * ======================
 * Handles all authentication-related API calls:
 * - User registration
 * - User login
 * - User logout
 */

import api from './api';

/**
 * Register a new user
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response with success status and message
 */
export const register = async (username, password) => {
  try {
    const response = await api.post('/register', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: 'Failed to connect to server',
    };
  }
};

/**
 * Login user
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response with success status, user info, and projects
 */
export const login = async (username, password) => {
  try {
    const response = await api.post('/login', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: 'Failed to connect to server',
    };
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Response with success status
 */
export const logout = async () => {
  try {
    const response = await api.post('/logout');
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: 'Failed to connect to server',
    };
  }
};

/**
 * Check if user is authenticated
 * This is a client-side check only
 * @returns {boolean} True if user appears to be authenticated
 */
export const isAuthenticated = () => {
  // Check localStorage for username
  // In production, you should verify with the server
  return localStorage.getItem('username') !== null;
};

/**
 * Get current username from localStorage
 * @returns {string|null} Username or null if not logged in
 */
export const getCurrentUsername = () => {
  return localStorage.getItem('username');
};
