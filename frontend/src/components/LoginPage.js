/**
 * Login Page Component
 * ====================
 * Handles user authentication (login and registration).
 * Provides forms for both login and registration with validation.
 * Uses Material UI components for a modern, beautiful UI.
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Link,
  Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Engineering as EngineeringIcon,
} from '@mui/icons-material';
import { login, register } from '../services/authService';

function LoginPage({ onLogin }) {
  // Form state
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          onLogin(username, response.role || 'user');
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
            onLogin(username, loginResponse.role || 'user');
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
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 450,
          borderRadius: 3,
          overflow: 'visible',
          position: 'relative',
        }}
      >
        {/* Logo/Header Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: 4,
            pb: 2,
            px: 3,
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              mb: 2,
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
            }}
          >
            <EngineeringIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textAlign: 'center',
            }}
          >
            Hardware Lab
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: 'center' }}
          >
            Management System
          </Typography>
        </Box>

        <Divider sx={{ mx: 3 }} />

        <CardContent sx={{ pt: 3, px: 4, pb: 4 }}>
          {/* Mode Title */}
          <Typography
            variant="h5"
            component="h2"
            sx={{
              textAlign: 'center',
              mb: 3,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {isLoginMode ? 'Sign In' : 'Create Account'}
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Username Field */}
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
              sx={{ mb: isLoginMode ? 0 : 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password Field (Registration only) */}
            {!isLoginMode && (
              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={loading}
                required
                sx={{ mt: 2, mb: 0 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isLoginMode ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </Box>

          {/* Toggle Mode Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
              <Link
                component="button"
                variant="body2"
                onClick={toggleMode}
                sx={{
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                disabled={loading}
              >
                {isLoginMode ? 'Sign Up' : 'Sign In'}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;