/**
 * Project Page Component
 * ======================
 * Displays user's projects and allows creating/joining projects.
 * Shows project details including members and hardware checkouts.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProjects, createProject, joinProject, addMember, removeMember } from '../services/projectService';

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

  // Track which project ID was just copied (shows "Copied!" feedback)
  const [copiedId, setCopiedId] = useState(null);

  // Manage panel: which project is open, invite input, per-action errors
  const [managingProjectId, setManagingProjectId] = useState(null);
  const [inviteUsername, setInviteUsername] = useState('');
  const [manageError, setManageError] = useState('');
  const [manageLoading, setManageLoading] = useState(false);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const openManage = (projectId) => {
    setManagingProjectId(projectId);
    setInviteUsername('');
    setManageError('');
  };

  const closeManage = () => {
    setManagingProjectId(null);
    setInviteUsername('');
    setManageError('');
  };

  const handleAddMember = async (projectId) => {
    if (!inviteUsername.trim()) {
      setManageError('Please enter a username');
      return;
    }
    setManageLoading(true);
    setManageError('');
    const response = await addMember(projectId, inviteUsername.trim());
    setManageLoading(false);
    if (response.success) {
      setInviteUsername('');
      loadProjects();
    } else {
      setManageError(response.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (projectId, memberUsername) => {
    if (!window.confirm(`Remove "${memberUsername}" from this project?`)) return;
    setManageLoading(true);
    setManageError('');
    const response = await removeMember(projectId, memberUsername);
    setManageLoading(false);
    if (response.success) {
      loadProjects();
    } else {
      setManageError(response.error || 'Failed to remove member');
    }
  };

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

                <div className="project-id-row">
                  <span className="project-id-label">Project ID:</span>
                  <code className="project-id">{project.id}</code>
                  <button
                    className={`copy-btn ${copiedId === project.id ? 'copied' : ''}`}
                    title="Copy ID"
                    onClick={() => handleCopyId(project.id)}
                  >
                    {copiedId === project.id ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Hardware Checkouts */}
                <div className="checkouts-section">
                  <h4 className="checkouts-title">Hardware In Use</h4>
                  {project.hardware_checkouts && project.hardware_checkouts.length > 0 ? (
                    <ul className="checkouts-list">
                      {project.hardware_checkouts.map((item, idx) => (
                        <li key={idx} className="checkout-item">
                          <span className="checkout-hw">{item.hw_name}</span>
                          <span className="checkout-qty">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-checkouts">No hardware checked out</p>
                  )}
                </div>

                <div className="project-meta">
                  <span className="role">{project.role === 'owner' ? '👑 Owner' : '👤 Member'}</span>
                  <span className="members-count">{project.members?.length || 1} member(s)</span>
                  {project.role === 'owner' && (
                    <button
                      className="manage-btn"
                      onClick={() => managingProjectId === project.id ? closeManage() : openManage(project.id)}
                    >
                      {managingProjectId === project.id ? 'Close' : '⚙ Manage'}
                    </button>
                  )}
                </div>

                {/* Manage Panel — visible to owner only */}
                {managingProjectId === project.id && (
                  <div className="manage-panel">
                    {manageError && <div className="manage-error">{manageError}</div>}

                    {/* Member list */}
                    <div className="manage-section">
                      <h4 className="manage-title">Members</h4>
                      <ul className="member-list">
                        {(project.members || []).map((member) => (
                          <li key={member} className="member-item">
                            <span className="member-name">
                              {member}
                              {member === username && <span className="you-tag"> (you)</span>}
                              {member === project.members[0] && project.role === 'owner' && member === username
                                ? null
                                : project.owner === member
                                  ? <span className="owner-tag"> 👑</span>
                                  : null}
                            </span>
                            {member !== username && (
                              <button
                                className="kick-btn"
                                disabled={manageLoading}
                                onClick={() => handleRemoveMember(project.id, member)}
                                title={`Remove ${member}`}
                              >
                                Remove
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Invite new member */}
                    <div className="manage-section">
                      <h4 className="manage-title">Invite Member</h4>
                      <div className="invite-row">
                        <input
                          type="text"
                          className="invite-input"
                          placeholder="Enter username"
                          value={inviteUsername}
                          onChange={(e) => setInviteUsername(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddMember(project.id)}
                          disabled={manageLoading}
                        />
                        <button
                          className="invite-btn"
                          disabled={manageLoading}
                          onClick={() => handleAddMember(project.id)}
                        >
                          {manageLoading ? '...' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
          margin-bottom: 0.75rem;
        }

        .project-id-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f5f5f5;
          border-radius: 6px;
          padding: 0.4rem 0.6rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .project-id-label {
          font-size: 0.78rem;
          color: #888;
          white-space: nowrap;
        }

        .project-id {
          font-family: monospace;
          font-size: 0.78rem;
          color: #444;
          word-break: break-all;
          flex: 1;
        }

        .copy-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          white-space: nowrap;
        }

        .copy-btn:hover {
          background: #5568d3;
        }

        .copy-btn.copied {
          background: #4caf50;
          cursor: default;
        }

        .project-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .role {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #e7eafc;
          color: #667eea;
          border-radius: 15px;
          font-size: 0.9rem;
        }

        .members-count {
          font-size: 0.85rem;
          color: #888;
        }

        .checkouts-section {
          margin-bottom: 0.75rem;
          border-top: 1px solid #eee;
          padding-top: 0.75rem;
        }

        .checkouts-title {
          font-size: 0.85rem;
          color: #555;
          font-weight: 600;
          margin-bottom: 0.4rem;
        }

        .checkouts-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .checkout-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f0f4ff;
          border-radius: 5px;
          padding: 0.3rem 0.6rem;
          font-size: 0.88rem;
        }

        .checkout-hw {
          color: #333;
          font-weight: 500;
        }

        .checkout-qty {
          color: #667eea;
          font-weight: 600;
        }

        .no-checkouts {
          font-size: 0.82rem;
          color: #aaa;
          margin: 0;
        }

        .manage-btn {
          background: none;
          border: 1px solid #667eea;
          color: #667eea;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          margin-left: auto;
          transition: all 0.2s;
        }

        .manage-btn:hover {
          background: #667eea;
          color: white;
        }

        .manage-panel {
          margin-top: 0.75rem;
          border-top: 2px solid #667eea;
          padding-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .manage-error {
          background: #fee;
          color: #c33;
          padding: 0.5rem 0.75rem;
          border-radius: 5px;
          font-size: 0.85rem;
        }

        .manage-section { display: flex; flex-direction: column; gap: 0.4rem; }

        .manage-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0;
        }

        .member-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .member-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f5f5f5;
          padding: 0.35rem 0.6rem;
          border-radius: 5px;
        }

        .member-name { font-size: 0.88rem; color: #333; }

        .you-tag { color: #667eea; font-size: 0.78rem; }
        .owner-tag { font-size: 0.78rem; }

        .kick-btn {
          background: none;
          border: 1px solid #e53935;
          color: #e53935;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .kick-btn:hover:not(:disabled) {
          background: #e53935;
          color: white;
        }

        .kick-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .invite-row {
          display: flex;
          gap: 0.5rem;
        }

        .invite-input {
          flex: 1;
          padding: 0.4rem 0.6rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 0.88rem;
        }

        .invite-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .invite-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.4rem 0.9rem;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.88rem;
          font-weight: 600;
          transition: background 0.2s;
        }

        .invite-btn:hover:not(:disabled) { background: #5568d3; }
        .invite-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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
