/**
 * Admin Page Component
 * ====================
 * Displays all users and their hardware checkout status.
 * Accessible by admin users only.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AdminPage({ username, onLogout }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [canSeePasswords, setCanSeePasswords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/all_users');
      if (response.data.success) {
        setUsers(response.data.users);
        setCanSeePasswords(response.data.show_passwords || false);
      } else {
        setError(response.data.error || 'Failed to load users');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load users';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Compute global hardware usage summary across all users/projects
  const hardwareSummary = {};
  users.forEach((user) => {
    user.projects.forEach((project) => {
      project.hardware_checkouts.forEach((item) => {
        hardwareSummary[item.hw_name] = (hardwareSummary[item.hw_name] || 0) + item.quantity;
      });
    });
  });

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalCheckouts = Object.values(hardwareSummary).reduce((a, b) => a + b, 0);

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/portal')} className="back-btn">← Back</button>
          <h1>Admin Panel</h1>
        </div>
        <div className="header-right">
          <span className="username-label">{username} (Admin)</span>
          <button onClick={async () => { onLogout(); navigate('/login'); }} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="page-content">
        {error && <div className="error-message">{error}</div>}

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-value">{users.length}</div>
            <div className="summary-label">Total Users</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">
              {users.reduce((sum, u) => sum + u.projects.length, 0)}
            </div>
            <div className="summary-label">Total Projects</div>
          </div>
          <div className="summary-card highlight">
            <div className="summary-value">{totalCheckouts}</div>
            <div className="summary-label">Units Checked Out</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{Object.keys(hardwareSummary).length}</div>
            <div className="summary-label">Hardware Types In Use</div>
          </div>
        </div>

        {/* Hardware Usage Overview */}
        {Object.keys(hardwareSummary).length > 0 && (
          <div className="section">
            <h2 className="section-title">Hardware Usage Overview</h2>
            <div className="hw-overview">
              {Object.entries(hardwareSummary).map(([name, qty]) => (
                <div key={name} className="hw-overview-item">
                  <span className="hw-overview-name">{name}</span>
                  <span className="hw-overview-qty">{qty} units checked out</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">All Users</h2>
            <input
              className="search-input"
              type="text"
              placeholder="Search username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {canSeePasswords && (
              <button
                className={`pw-toggle-btn ${showPasswords ? 'active' : ''}`}
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? '🔒 Hide Passwords' : '🔑 Show Passwords'}
              </button>
            )}
            <button className="refresh-btn" onClick={loadUsers}>↻ Refresh</button>
          </div>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="users-list">
              {filteredUsers.map((user) => {
                const allCheckouts = user.projects.flatMap((p) =>
                  p.hardware_checkouts.map((c) => ({ ...c, projectName: p.name }))
                );
                return (
                  <div key={user.username} className="user-card">
                    <div className="user-header">
                      <div className="user-title">
                        <span className="user-name">{user.username}</span>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'superadmin' ? '🛡️ Superadmin'
                            : user.role === 'admin' ? '⚙️ Admin'
                            : '👤 User'}
                        </span>
                        {showPasswords && canSeePasswords && (
                          <span className="pw-display">
                            🔑 <code>{user.password}</code>
                          </span>
                        )}
                      </div>
                      <div className="user-stats">
                        <span>{user.projects.length} project(s)</span>
                        <span className={allCheckouts.length > 0 ? 'active-checkouts' : 'no-checkouts'}>
                          {allCheckouts.length > 0
                            ? `${allCheckouts.reduce((s, c) => s + c.quantity, 0)} units in use`
                            : 'No hardware checked out'}
                        </span>
                      </div>
                    </div>

                    {user.projects.length > 0 && (
                      <div className="user-projects">
                        {user.projects.map((project) => (
                          <div key={project.id} className="user-project-row">
                            <div className="project-info">
                              <span className="project-name">{project.name}</span>
                              <span className={`project-role ${project.role}`}>
                                {project.role === 'owner' ? '👑' : '👤'} {project.role}
                              </span>
                            </div>
                            {project.hardware_checkouts.length > 0 ? (
                              <div className="project-checkouts">
                                {project.hardware_checkouts.map((item, idx) => (
                                  <span key={idx} className="checkout-tag">
                                    {item.hw_name} × {item.quantity}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="no-hw">No hardware</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="empty-state">No users found.</div>
              )}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .admin-page { min-height: 100vh; background: #f5f5f5; }

        .page-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-left { display: flex; align-items: center; gap: 1rem; }
        .header-right { display: flex; align-items: center; gap: 1rem; }
        .back-btn, .logout-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
        }
        .username-label { font-size: 0.95rem; opacity: 0.9; }

        .page-content { max-width: 1100px; margin: 0 auto; padding: 2rem; }

        .error-message {
          background: #fee; color: #c33; padding: 1rem;
          border-radius: 5px; margin-bottom: 1rem;
        }

        /* Summary */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .summary-card {
          background: white;
          border-radius: 10px;
          padding: 1.25rem 1rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .summary-card.highlight { border: 2px solid #667eea; }
        .summary-value { font-size: 2rem; font-weight: 700; color: #667eea; }
        .summary-label { font-size: 0.8rem; color: #888; margin-top: 0.25rem; }

        /* Sections */
        .section { margin-bottom: 2rem; }
        .section-header {
          display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;
        }
        .section-title { font-size: 1.2rem; color: #333; margin: 0; }
        .search-input {
          padding: 0.5rem 0.75rem; border: 1px solid #ddd;
          border-radius: 5px; font-size: 0.9rem; flex: 1; min-width: 150px;
        }
        .refresh-btn {
          background: #667eea; color: white; border: none;
          padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; font-size: 0.9rem;
        }

        /* Hardware overview */
        .hw-overview {
          display: flex; flex-wrap: wrap; gap: 0.75rem;
          background: white; padding: 1rem; border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .hw-overview-item {
          display: flex; flex-direction: column; align-items: center;
          background: #f0f4ff; border-radius: 8px; padding: 0.6rem 1rem;
          min-width: 140px;
        }
        .hw-overview-name { font-weight: 600; color: #333; font-size: 0.9rem; }
        .hw-overview-qty { font-size: 0.8rem; color: #667eea; margin-top: 0.2rem; }

        /* Users list */
        .users-list { display: flex; flex-direction: column; gap: 1rem; }
        .user-card {
          background: white; border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;
        }
        .user-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 1.25rem; flex-wrap: wrap; gap: 0.5rem;
          border-bottom: 1px solid #f0f0f0;
        }
        .user-title { display: flex; align-items: center; gap: 0.75rem; }
        .user-name { font-size: 1.05rem; font-weight: 700; color: #333; }
        .role-badge {
          font-size: 0.78rem; padding: 0.2rem 0.6rem;
          border-radius: 12px; font-weight: 500;
        }
        .role-badge.superadmin { background: #fce7f3; color: #9d174d; }
        .role-badge.admin      { background: #fef3c7; color: #b45309; }
        .role-badge.user       { background: #e7eafc; color: #667eea; }

        .pw-toggle-btn {
          background: #6b7280; color: white; border: none;
          padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; font-size: 0.85rem;
        }
        .pw-toggle-btn.active { background: #b45309; }
        .pw-toggle-btn:hover  { opacity: 0.85; }

        .pw-display {
          font-size: 0.82rem; color: #b45309;
          background: #fef3c7; padding: 0.15rem 0.5rem; border-radius: 4px;
        }
        .pw-display code { font-family: monospace; font-weight: 700; }
        .user-stats { display: flex; gap: 1rem; font-size: 0.85rem; color: #888; }
        .active-checkouts { color: #e53935; font-weight: 600; }
        .no-checkouts { color: #aaa; }

        /* Projects inside user card */
        .user-projects { padding: 0.75rem 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .user-project-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 0.75rem; flex-wrap: wrap;
          background: #fafafa; border-radius: 6px; padding: 0.5rem 0.75rem;
        }
        .project-info { display: flex; align-items: center; gap: 0.5rem; }
        .project-name { font-weight: 500; font-size: 0.9rem; color: #333; }
        .project-role { font-size: 0.78rem; color: #888; }
        .project-checkouts { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .checkout-tag {
          background: #e7eafc; color: #667eea;
          font-size: 0.78rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 500;
        }
        .no-hw { font-size: 0.8rem; color: #bbb; }

        .loading, .empty-state {
          text-align: center; padding: 2rem; color: #888;
        }
      `}</style>
    </div>
  );
}

export default AdminPage;
