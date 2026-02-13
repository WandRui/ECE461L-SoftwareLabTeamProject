/**
 * Login Page Component
 * ====================
 * Handles user authentication (login and registration).
 * Provides forms for both login and registration with validation.
 */

import React, { useState } from 'react';
import { login, register } from '../services/authService';

function LoginPage({ onLogin }) {
  // Form state
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle form submission for login or registration
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!username || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Additional validation for registration
    if (!isLoginMode) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLoginMode) {
        // Login
        const response = await login(username, password);
        if (response.success) {
          onLogin(username);
        } else {
          setError(response.error || 'Login failed');
        }
      } else {
        // Register
        const response = await register(username, password);
        if (response.success) {
          // Auto-login after successful registration
          const loginResponse = await login(username, password);
          if (loginResponse.success) {
            onLogin(username);
          }
        } else {
          setError(response.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle between login and registration modes
   */
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setConfirmPassword('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Hardware Lab Management System</h1>
        <h2>{isLoginMode ? 'Login' : 'Register'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              required
            />
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={loading}
                required
              />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLoginMode ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="toggle-mode">
          <button onClick={toggleMode} disabled={loading}>
            {isLoginMode ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-container {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }

        h2 {
          color: #667eea;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
        }

        button[type="submit"] {
          width: 100%;
          padding: 0.75rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
          margin-top: 1rem;
        }

        button[type="submit"]:hover:not(:disabled) {
          background: #5568d3;
        }

        button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 0.75rem;
          border-radius: 5px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .toggle-mode {
          text-align: center;
          margin-top: 1rem;
        }

        .toggle-mode button {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          text-decoration: underline;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
