/**
 * Main Portal Component
 * =====================
 * Main dashboard displayed after successful login.
 * Provides navigation to Projects and Hardware Inventory pages.
 * Shows user information and logout option.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

function MainPortal({ username, onLogout }) {
  const navigate = useNavigate();

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Still logout on frontend even if backend call fails
      onLogout();
      navigate('/login');
    }
  };

  /**
   * Navigate to Projects page
   */
  const goToProjects = () => {
    navigate('/projects');
  };

  /**
   * Navigate to Hardware Inventory page
   */
  const goToHardware = () => {
    navigate('/hardware');
  };

  return (
    <div className="main-portal">
      <header className="portal-header">
        <h1>Hardware Lab Management System</h1>
        <div className="user-info">
          <span>Welcome, <strong>{username}</strong></span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="portal-content">
        <h2>Main Dashboard</h2>
        <p className="welcome-text">
          Manage your projects and hardware inventory from here.
        </p>

        <div className="portal-cards">
          {/* Projects Card */}
          <div className="portal-card" onClick={goToProjects}>
            <div className="card-icon">📁</div>
            <h3>Projects</h3>
            <p>Create, join, and manage your projects</p>
            <button className="card-button">Go to Projects</button>
          </div>

          {/* Hardware Inventory Card */}
          <div className="portal-card" onClick={goToHardware}>
            <div className="card-icon">🔧</div>
            <h3>Hardware Inventory</h3>
            <p>View and manage hardware equipment</p>
            <button className="card-button">Go to Hardware</button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .main-portal {
          min-height: 100vh;
          background: #f5f5f5;
        }

        .portal-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .portal-header h1 {
          margin: 0;
          font-size: 1.5rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logout-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s;
        }

        .logout-btn:hover {
          background: #f0f0f0;
        }

        .portal-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .portal-content h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .welcome-text {
          color: #666;
          margin-bottom: 2rem;
        }

        .portal-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .portal-card {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          text-align: center;
        }

        .portal-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
        }

        .card-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .portal-card h3 {
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .portal-card p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .card-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s;
        }

        .card-button:hover {
          background: #5568d3;
        }
      `}</style>
    </div>
  );
}

export default MainPortal;
