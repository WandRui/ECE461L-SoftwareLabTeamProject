/**
 * Application Constants
 * =====================
 * Centralized constants used throughout the application.
 */

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const API_TIMEOUT = 10000; // 10 seconds

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  PORTAL: '/portal',
  PROJECTS: '/projects',
  HARDWARE: '/hardware',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Failed to connect to server. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_CREDENTIALS: 'Invalid username or password.',
  REQUIRED_FIELDS: 'Please fill in all required fields.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  PROJECT_CREATED: 'Project created successfully!',
  PROJECT_JOINED: 'Successfully joined project!',
  HARDWARE_CHECKED_OUT: 'Hardware checked out successfully!',
  HARDWARE_CHECKED_IN: 'Hardware returned successfully!',
};

// Validation Rules
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
  },
  PROJECT_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  HARDWARE_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  QUANTITY: {
    MIN: 1,
    MAX: 10000,
  },
};

// UI Constants
export const UI = {
  DEBOUNCE_DELAY: 300, // milliseconds
  TOAST_DURATION: 3000, // milliseconds
  POLLING_INTERVAL: 30000, // 30 seconds for real-time updates
};

// Hardware Categories (for future use)
export const HARDWARE_CATEGORIES = {
  MICROCONTROLLER: 'Microcontroller',
  SENSOR: 'Sensor',
  ACTUATOR: 'Actuator',
  COMMUNICATION: 'Communication',
  POWER: 'Power',
  TOOL: 'Tool',
  OTHER: 'Other',
};

// Project Status (for future use)
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  COMPLETED: 'completed',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USERNAME: 'username',
  USER_ROLE: 'user_role',
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// Colors (for consistency across components)
export const COLORS = {
  PRIMARY: '#667eea',
  PRIMARY_DARK: '#5568d3',
  SECONDARY: '#764ba2',
  SUCCESS: '#4caf50',
  ERROR: '#f44336',
  WARNING: '#ff9800',
  INFO: '#2196f3',
  BACKGROUND: '#f5f5f5',
  TEXT: '#333333',
  TEXT_SECONDARY: '#666666',
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  ROUTES,
  USER_ROLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
  UI,
  HARDWARE_CATEGORIES,
  PROJECT_STATUS,
  STORAGE_KEYS,
  HTTP_STATUS,
  COLORS,
};
