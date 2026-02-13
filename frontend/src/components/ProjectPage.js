/**
 * Project Page Component
 * ======================
 * Displays user's projects and allows creating/joining projects.
 * Shows project details including members and hardware checkouts.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProjects, createProject, joinProject } from '../services/projectService';

function ProjectPage({ username, onLogout }) {
  const navigate = useNavigate();
  
  // State management
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  
  // Form state
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectIdToJoin, setProjectIdToJoin] = useState('');

  // Load user's projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  /**
   * Load user's projects from API
   */
  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await getUserProjects();
      if (response.success) {
        setProjects(response.projects || []);
      } else {
        setError(response.error || 'Failed to load projects');
      }
    } catch (err) {
      setError('An error occurred while loading projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle creating a new project
   */
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');

    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      const response = await createProject(projectName, projectDescription);
      if (response.success) {
        setShowCreateForm(false);
        setProjectName('');
        setProjectDescription('');
        loadProjects(); // Reload projects list
      } else {
        setError(response.error || 'Failed to create project');
      }
    } catch (err) {
      setError('An error occurred while creating project');
      console.error('Error creating project:', err);
    }
  };

  /**
   * Handle joining an existing project
   */
  const handleJoinProject = async (e) => {
    e.preventDefault();
    setError('');

    if (!projectIdToJoin.trim()) {
      setError('Project ID is required');
      return;
    }

    try {
      const response = await joinProject(projectIdToJoin);
      if (response.success) {
        setShowJoinForm(false);
        setProjectIdToJoin('');
        loadProjects(); // Reload projects list
      } else {
        setError(response.error || 'Failed to join project');
      }
    } catch (err) {
      setError('An error occurred while joining project');
      console.error('Error joining project:', err);
    }
  };

  return (
    <div className="project-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/portal')} className="back-btn">← Back</button>
          <h1>My Projects</h1>
        </div>
        <div className="user-info">
          <span>{username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="page-content">
        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="primary-btn">
            + Create Project
          </button>
          <button onClick={() => setShowJoinForm(!showJoinForm)} className="secondary-btn">
            Join Project
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Create Project Form */}
        {showCreateForm && (
          <div className="form-container">
            <h3>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
              <textarea
                placeholder="Project Description (optional)"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows="3"
              />
              <div className="form-buttons">
                <button type="submit" className="primary-btn">Create</button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Join Project Form */}
        {showJoinForm && (
          <div className="form-container">
            <h3>Join Existing Project</h3>
            <form onSubmit={handleJoinProject}>
              <input
                type="text"
                placeholder="Project ID"
                value={projectIdToJoin}
                onChange={(e) => setProjectIdToJoin(e.target.value)}
                required
              />
              <div className="form-buttons">
                <button type="submit" className="primary-btn">Join</button>
                <button type="button" onClick={() => setShowJoinForm(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any projects yet.</p>
            <p>Create a new project or join an existing one to get started.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.name}</h3>
                <p className="description">{project.description || 'No description'}</p>
                <div className="project-meta">
                  <span className="role">{project.role === 'owner' ? '👑 Owner' : '👤 Member'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Inline Styles */}
      <style jsx>{`
        .project-page {
          min-height: 100vh;
          background: #f5f5f5;
        }

        .page-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
        }

        .page-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .primary-btn, .secondary-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .primary-btn {
          background: #667eea;
          color: white;
        }

        .primary-btn:hover {
          background: #5568d3;
        }

        .secondary-btn {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .form-container {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .form-container input, .form-container textarea {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
        }

        .form-buttons {
          display: flex;
          gap: 1rem;
        }

        .cancel-btn {
          background: #ddd;
          color: #333;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          cursor: pointer;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .project-card {
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .project-card h3 {
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .description {
          color: #666;
          margin-bottom: 1rem;
        }

        .role {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #e7eafc;
          color: #667eea;
          border-radius: 15px;
          font-size: 0.9rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 1rem;
          border-radius: 5px;
          margin-bottom: 1rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}

export default ProjectPage;
