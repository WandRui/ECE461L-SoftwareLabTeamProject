/**
 * Hardware Inventory Page Component
 * ==================================
 * Displays available hardware sets with real-time availability.
 * Allows users to check out and check in hardware for their projects.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHardwareSets, checkOutHardware, checkInHardware, createHardwareSet, deleteHardwareSet } from '../services/hardwareService';
import { getUserProjects } from '../services/projectService';

function HardwareInventoryPage({ username, userRole, onLogout }) {
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const navigate = useNavigate();
  
  // State management
  const [hardwareSets, setHardwareSets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Checkout/Checkin form state
  const [selectedHardware, setSelectedHardware] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isCheckoutMode, setIsCheckoutMode] = useState(true);

  // Create hardware set form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHwName, setNewHwName] = useState('');
  const [newHwCapacity, setNewHwCapacity] = useState('');
  const [newHwDescription, setNewHwDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Load hardware sets and projects on component mount
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Load hardware sets and user projects
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [hardwareResponse, projectsResponse] = await Promise.all([
        getHardwareSets(),
        getUserProjects()
      ]);

      if (hardwareResponse.success) {
        setHardwareSets(hardwareResponse.hardware_sets || []);
      } else {
        setError(hardwareResponse.error || 'Failed to load hardware');
      }

      if (projectsResponse.success) {
        setProjects(projectsResponse.projects || []);
      }
    } catch (err) {
      setError('An error occurred while loading data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle hardware checkout
   */
  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedProject || !quantity) {
      setError('Please select a project and enter quantity');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (qty > selectedHardware.available) {
      setError('Insufficient hardware available');
      return;
    }

    try {
      const response = await checkOutHardware(
        selectedProject,
        selectedHardware.hw_name,
        qty
      );

      if (response.success) {
        setSelectedHardware(null);
        setQuantity('');
        setSelectedProject('');
        loadData(); // Reload hardware list
      } else {
        setError(response.error || 'Failed to checkout hardware');
      }
    } catch (err) {
      setError('An error occurred during checkout');
      console.error('Checkout error:', err);
    }
  };

  /**
   * Handle hardware check-in
   */
  const handleCheckin = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedProject || !quantity) {
      setError('Please select a project and enter quantity');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    try {
      const response = await checkInHardware(
        selectedProject,
        selectedHardware.hw_name,
        qty
      );

      if (response.success) {
        setSelectedHardware(null);
        setQuantity('');
        setSelectedProject('');
        loadData(); // Reload hardware list
      } else {
        setError(response.error || 'Failed to check in hardware');
      }
    } catch (err) {
      setError('An error occurred during check-in');
      console.error('Check-in error:', err);
    }
  };

  /**
   * Handle creating a new hardware set
   */
  const handleCreateHardware = async (e) => {
    e.preventDefault();
    setError('');
    setCreateLoading(true);

    const capacity = parseInt(newHwCapacity);
    if (!newHwName.trim()) {
      setError('Hardware name is required');
      setCreateLoading(false);
      return;
    }
    if (isNaN(capacity) || capacity <= 0) {
      setError('Total capacity must be a positive number');
      setCreateLoading(false);
      return;
    }

    try {
      const response = await createHardwareSet(newHwName.trim(), capacity, newHwDescription.trim());
      if (response.success) {
        setShowCreateForm(false);
        setNewHwName('');
        setNewHwCapacity('');
        setNewHwDescription('');
        loadData();
      } else {
        setError(response.error || 'Failed to create hardware set');
      }
    } catch (err) {
      setError('An error occurred while creating hardware set');
    } finally {
      setCreateLoading(false);
    }
  };

  /**
   * Handle deleting a hardware set (admin only)
   */
  const handleDeleteHardware = async (hwName) => {
    if (!window.confirm(`Delete hardware set "${hwName}"? This cannot be undone.`)) return;
    setError('');
    try {
      const response = await deleteHardwareSet(hwName);
      if (response.success) {
        loadData();
      } else {
        setError(response.error || 'Failed to delete hardware set');
      }
    } catch (err) {
      setError('An error occurred while deleting hardware set');
    }
  };

  /**
   * Compute how many units of each hardware the current user holds
   * across all their projects.
   * Returns a map: { hw_name -> total_qty }
   */
  const getUserCheckedOutMap = () => {
    const map = {};
    projects.forEach((project) => {
      (project.hardware_checkouts || []).forEach((item) => {
        map[item.hw_name] = (map[item.hw_name] || 0) + item.quantity;
      });
    });
    return map;
  };

  const userCheckedOutMap = getUserCheckedOutMap();

  /**
   * Open checkout/checkin form for a hardware set
   */
  const openForm = (hardware, isCheckout) => {
    setSelectedHardware(hardware);
    setIsCheckoutMode(isCheckout);
    setError('');
    setQuantity('');
    setSelectedProject('');
  };

  return (
    <div className="hardware-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/portal')} className="back-btn">← Back</button>
          <h1>Hardware Inventory</h1>
        </div>
        <div className="header-right">
          {isAdmin && (
            <button onClick={() => { setShowCreateForm(true); setError(''); }} className="create-btn">
              + Add Hardware Set
            </button>
          )}
          <span className="username-label">
            {username}{isAdmin && <span className="admin-badge"> (Admin)</span>}
          </span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="page-content">
        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Create Hardware Set Modal */}
        {showCreateForm && (
          <div className="form-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Create Hardware Set</h3>
              <form onSubmit={handleCreateHardware}>
                <div className="form-group">
                  <label>Hardware Name:</label>
                  <input
                    type="text"
                    value={newHwName}
                    onChange={(e) => setNewHwName(e.target.value)}
                    placeholder="e.g. Arduino Uno"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Capacity:</label>
                  <input
                    type="number"
                    value={newHwCapacity}
                    onChange={(e) => setNewHwCapacity(e.target.value)}
                    placeholder="e.g. 50"
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description (optional):</label>
                  <input
                    type="text"
                    value={newHwDescription}
                    onChange={(e) => setNewHwDescription(e.target.value)}
                    placeholder="e.g. Microcontroller board"
                  />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="primary-btn" disabled={createLoading}>
                    {createLoading ? 'Creating...' : 'Create'}
                  </button>
                  <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Checkout/Checkin Form */}
        {selectedHardware && (
          <div className="form-overlay" onClick={() => setSelectedHardware(null)}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{isCheckoutMode ? 'Check Out' : 'Check In'} {selectedHardware.hw_name}</h3>
              <form onSubmit={isCheckoutMode ? handleCheckout : handleCheckin}>
                <div className="form-group">
                  <label>Select Project:</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    required
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    max={isCheckoutMode ? selectedHardware.available : (userCheckedOutMap[selectedHardware.hw_name] || 0)}
                    required
                  />
                  <small>
                    {isCheckoutMode
                      ? `Available: ${selectedHardware.available}`
                      : `Your checked out: ${userCheckedOutMap[selectedHardware.hw_name] || 0}`}
                  </small>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="primary-btn">
                    {isCheckoutMode ? 'Check Out' : 'Check In'}
                  </button>
                  <button type="button" onClick={() => setSelectedHardware(null)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Hardware List */}
        {loading ? (
          <div className="loading">Loading hardware...</div>
        ) : hardwareSets.length === 0 ? (
          <div className="empty-state">
            <p>No hardware sets available.</p>
            <p>Click <strong>+ Create Hardware Set</strong> in the top right to add one.</p>
          </div>
        ) : (
          <div className="hardware-grid">
            {hardwareSets.map((hardware) => {
              const myQty = userCheckedOutMap[hardware.hw_name] || 0;
              return (
              <div key={hardware.hw_name} className="hardware-card">
                <h3>{hardware.hw_name}</h3>
                <p className="description">{hardware.description || 'No description'}</p>

                <div className="hardware-stats">
                  <div className="stat">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{hardware.total_capacity}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Available:</span>
                    <span className="stat-value available">{hardware.available}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">All Checked Out:</span>
                    <span className="stat-value">{hardware.checked_out}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">My Usage:</span>
                    <span className={`stat-value ${myQty > 0 ? 'my-usage' : ''}`}>{myQty}</span>
                  </div>
                </div>

                <div className="availability-bar">
                  <div
                    className="availability-fill"
                    style={{width: `${(hardware.available / hardware.total_capacity) * 100}%`}}
                  ></div>
                </div>

                <div className="hardware-actions">
                  <button
                    onClick={() => openForm(hardware, true)}
                    className="checkout-btn"
                    disabled={hardware.available === 0}
                  >
                    Check Out
                  </button>
                  <button
                    onClick={() => openForm(hardware, false)}
                    className="checkin-btn"
                    disabled={myQty === 0}
                  >
                    Check In
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteHardware(hardware.hw_name)}
                      className="delete-btn"
                      disabled={hardware.checked_out > 0}
                      title={hardware.checked_out > 0
                        ? `Cannot delete: ${hardware.checked_out} unit(s) still checked out`
                        : 'Delete this hardware set'}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Inline Styles */}
      <style jsx>{`
        .hardware-page {
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

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .username-label {
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .create-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .create-btn:hover {
          background: #f0f0ff;
        }

        .logout-btn {
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

        .hardware-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .hardware-card {
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .hardware-card h3 {
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .hardware-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #999;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
        }

        .stat-value.available {
          color: #4caf50;
        }

        .stat-value.my-usage {
          color: #e53935;
        }

        .availability-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .availability-fill {
          height: 100%;
          background: #4caf50;
          transition: width 0.3s;
        }

        .hardware-actions {
          display: flex;
          gap: 0.5rem;
        }

        .checkout-btn, .checkin-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
        }

        .checkout-btn {
          background: #667eea;
          color: white;
        }

        .checkout-btn:hover:not(:disabled) {
          background: #5568d3;
        }

        .checkin-btn {
          background: #4caf50;
          color: white;
        }

        .checkin-btn:hover:not(:disabled) {
          background: #45a049;
        }

        .checkout-btn:disabled, .checkin-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-btn {
          padding: 0.75rem 1rem;
          background: #e53935;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.3s;
        }

        .delete-btn:hover:not(:disabled) {
          background: #c62828;
        }

        .delete-btn:disabled {
          background: #e0e0e0;
          color: #aaa;
          cursor: not-allowed;
        }

        .admin-badge {
          font-size: 0.75rem;
          background: rgba(255,255,255,0.25);
          padding: 0.1rem 0.4rem;
          border-radius: 3px;
          margin-left: 0.25rem;
        }

        .form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .form-modal {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          max-width: 400px;
          width: 90%;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #666;
          font-size: 0.85rem;
        }

        .form-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .primary-btn {
          flex: 1;
          padding: 0.75rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .cancel-btn {
          flex: 1;
          padding: 0.75rem;
          background: #ddd;
          color: #333;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 1rem;
          border-radius: 5px;
          margin-bottom: 1rem;
        }

        .loading, .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}

export default HardwareInventoryPage;
