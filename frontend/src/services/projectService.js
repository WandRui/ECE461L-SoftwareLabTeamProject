/**
 * Project Service
 * ===============
 * Handles all project-related API calls:
 * - Get user's projects
 * - Create new project
 * - Join existing project
 * - Get project details
 */

import api from './api';

/**
 * Get list of projects for the current user
 * @returns {Promise<Object>} Response with array of projects
 */
export const getUserProjects = async () => {
  try {
    const response = await api.get('/get_user_projects_list');
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
 * Create a new project
 * @param {string} name - Project name
 * @param {string} description - Project description (optional)
 * @returns {Promise<Object>} Response with created project details
 */
export const createProject = async (name, description = '') => {
  try {
    const response = await api.post('/create_project', {
      name,
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
 * Join an existing project
 * @param {string} projectId - ID of project to join
 * @returns {Promise<Object>} Response with project details
 */
export const joinProject = async (projectId) => {
  try {
    const response = await api.post('/join_project', {
      project_id: projectId,
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
 * Get detailed information about a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Response with project details
 */
export const getProjectDetails = async (projectId) => {
  try {
    const response = await api.get(`/get_project_details/${projectId}`);
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
 * Add a member to a project (owner only)
 * @param {string} projectId - Project ID
 * @param {string} username - Username to add
 * @returns {Promise<Object>} Response with success status
 */
export const addMember = async (projectId, username) => {
  try {
    const response = await api.post('/add_member', { project_id: projectId, username });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, error: 'Failed to connect to server' };
  }
};

/**
 * Remove a member from a project (owner only)
 * @param {string} projectId - Project ID
 * @param {string} username - Username to remove
 * @returns {Promise<Object>} Response with success status
 */
export const removeMember = async (projectId, username) => {
  try {
    const response = await api.post('/remove_member', { project_id: projectId, username });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, error: 'Failed to connect to server' };
  }
};

/**
 * Leave a project (future implementation)
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Response with success status
 */
export const leaveProject = async (projectId) => {
  // TODO: Implement leave project endpoint in backend
  try {
    const response = await api.post('/leave_project', {
      project_id: projectId,
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
