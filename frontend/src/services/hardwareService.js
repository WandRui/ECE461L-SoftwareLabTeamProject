/**
 * Hardware Service
 * ================
 * Handles all hardware-related API calls:
 * - Get all hardware sets
 * - Get hardware availability
 * - Check out hardware
 * - Check in hardware
 * - Create hardware set (admin)
 */

import api from './api';

/**
 * Get all hardware sets with availability
 * @returns {Promise<Object>} Response with array of hardware sets
 */
export const getHardwareSets = async () => {
  try {
    const response = await api.get('/get_hardware_sets');
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
 * Get availability for a specific hardware set
 * @param {string} hwName - Hardware set name
 * @returns {Promise<Object>} Response with availability details
 */
export const getHardwareAvailability = async (hwName) => {
  try {
    const response = await api.get(`/get_hardware_availability/${hwName}`);
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
 * Check out hardware for a project
 * @param {string} projectId - Project ID
 * @param {string} hwName - Hardware set name
 * @param {number} quantity - Number of units to check out
 * @returns {Promise<Object>} Response with checkout details
 */
export const checkOutHardware = async (projectId, hwName, quantity) => {
  try {
    const response = await api.post('/check_out', {
      project_id: projectId,
      hw_name: hwName,
      quantity: parseInt(quantity),
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
 * Check in hardware from a project
 * @param {string} projectId - Project ID
 * @param {string} hwName - Hardware set name
 * @param {number} quantity - Number of units to return
 * @returns {Promise<Object>} Response with check-in confirmation
 */
export const checkInHardware = async (projectId, hwName, quantity) => {
  try {
    const response = await api.post('/check_in', {
      project_id: projectId,
      hw_name: hwName,
      quantity: parseInt(quantity),
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
 * Create a new hardware set (admin only)
 * @param {string} hwName - Hardware set name
 * @param {number} totalCapacity - Total number of units
 * @param {string} description - Hardware description (optional)
 * @returns {Promise<Object>} Response with created hardware details
 */
export const createHardwareSet = async (hwName, totalCapacity, description = '') => {
  try {
    const response = await api.post('/create_hardware_set', {
      hw_name: hwName,
      total_capacity: parseInt(totalCapacity),
      description,
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
 * Get hardware checkout history for a project (future implementation)
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Response with checkout history
 */
export const getProjectCheckouts = async (projectId) => {
  // TODO: Implement in backend
  try {
    const response = await api.get(`/project_checkouts/${projectId}`);
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
