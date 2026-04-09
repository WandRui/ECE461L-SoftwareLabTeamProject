/**
 * Main Application Component
 * ===========================
 * This component sets up routing and manages the main application structure.
 * It defines routes for login, main portal, projects, and hardware inventory.
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import theme from './theme/theme';
import LoginPage from './components/LoginPage';
import MainPortal from './components/MainPortal';
import ProjectPage from './components/ProjectPage';
import HardwareInventoryPage from './components/HardwareInventoryPage';
import AdminPage from './components/AdminPage';

function App() {
  // Track authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('user');

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('userRole') || 'user';
    if (storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setUserRole(storedRole);
    }
  }, []);

  /**
   * Handle successful login
   * @param {string} user - Username of logged-in user
   * @param {string} role - Role of logged-in user ('user' or 'admin')
   */
  const handleLogin = (user, role = 'user') => {
    setIsAuthenticated(true);
    setUsername(user);
    setUserRole(role);
    localStorage.setItem('username', user);
    localStorage.setItem('userRole', role);
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setUserRole('user');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
                  <MainPortal username={username} userRole={userRole} onLogout={handleLogout} /> : 
                  <Navigate to="/login" />
              } 
            />

            {/* Project Page Route (Protected) */}
            <Route 
              path="/projects" 
              element={
                isAuthenticated ? 
                  <ProjectPage username={username} userRole={userRole} onLogout={handleLogout} /> : 
                  <Navigate to="/login" />
              } 
            />

            {/* Hardware Inventory Route (Protected) */}
            <Route 
              path="/hardware" 
              element={
                isAuthenticated ? 
                  <HardwareInventoryPage username={username} userRole={userRole} onLogout={handleLogout} /> : 
                  <Navigate to="/login" />
              } 
            />

            {/* Admin Panel Route (Protected + admin only) */}
            <Route
              path="/admin"
              element={
                isAuthenticated && (userRole === 'admin' || userRole === 'superadmin') ?
                  <AdminPage username={username} userRole={userRole} onLogout={handleLogout} /> :
                  <Navigate to="/portal" />
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
      </Router>
    </ThemeProvider>
  );
}

export default App;
