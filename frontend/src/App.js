/**
 * Main Application Component
 * ===========================
 * This component sets up routing and manages the main application structure.
 * It defines routes for login, main portal, projects, and hardware inventory.
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MainPortal from './components/MainPortal';
import ProjectPage from './components/ProjectPage';
import HardwareInventoryPage from './components/HardwareInventoryPage';

function App() {
  // Track authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  // Check if user is already logged in on component mount
  useEffect(() => {
    // TODO: Check session/token validity on app load
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

  /**
   * Handle successful login
   * @param {string} user - Username of logged-in user
   */
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem('username', user);
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    localStorage.removeItem('username');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login Route */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/portal" /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />

          {/* Main Portal Route (Protected) */}
          <Route 
            path="/portal" 
            element={
              isAuthenticated ? 
                <MainPortal username={username} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />

          {/* Project Page Route (Protected) */}
          <Route 
            path="/projects" 
            element={
              isAuthenticated ? 
                <ProjectPage username={username} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />

          {/* Hardware Inventory Route (Protected) */}
          <Route 
            path="/hardware" 
            element={
              isAuthenticated ? 
                <HardwareInventoryPage username={username} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
            } 
          />

          {/* Default Route - Redirect to login or portal */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/portal" /> : 
                <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
