"""
Configuration Settings
======================
This file contains all configuration settings for the Flask application,
including database connection strings, secret keys, and environment-specific settings.

IMPORTANT: In production, use environment variables for sensitive data.
Never commit actual secret keys or passwords to version control.
"""

import os
from datetime import timedelta

# ============================================================================
# Flask Configuration
# ============================================================================

# Secret key for session management
# TODO: Change this to a strong, random secret key in production
# TODO: Use environment variable: os.environ.get('SECRET_KEY')
SECRET_KEY = 'your-secret-key-here-change-in-production'

# Session configuration
SESSION_TYPE = 'filesystem'
SESSION_PERMANENT = False
PERMANENT_SESSION_LIFETIME = timedelta(hours=24)

# ============================================================================
# Database Configuration
# ============================================================================

# MongoDB connection settings
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = os.environ.get('DATABASE_NAME', 'hardware_lab_system')

# Collection names
USERS_COLLECTION = 'usersDB'
PROJECTS_COLLECTION = 'projectsDB'
HARDWARE_COLLECTION = 'hardwareDB'

# ============================================================================
# CORS Configuration
# ============================================================================

# Allowed origins for CORS
# Update this list based on your frontend URL
CORS_ORIGINS = [
    'http://localhost:3000',  # React development server
    'http://localhost:5000',  # Flask server
]

# ============================================================================
# Application Configuration
# ============================================================================

# Debug mode (set to False in production)
DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'

# Application host and port
HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
PORT = int(os.environ.get('FLASK_PORT', 5000))

# ============================================================================
# Security Configuration
# ============================================================================

# Password hashing settings
# TODO: Implement password hashing with bcrypt
BCRYPT_LOG_ROUNDS = 12

# Maximum login attempts before lockout
MAX_LOGIN_ATTEMPTS = 5

# Session timeout in hours
SESSION_TIMEOUT_HOURS = 24

# ============================================================================
# Feature Flags
# ============================================================================

# Enable/disable features for development
ENABLE_REGISTRATION = True
ENABLE_HARDWARE_CREATION = True  # Set to False to restrict to admins only

# ============================================================================
# Logging Configuration
# ============================================================================

LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
LOG_FILE = 'app.log'

# ============================================================================
# Environment-Specific Configuration
# ============================================================================

class Config:
    """Base configuration"""
    SECRET_KEY = SECRET_KEY
    MONGO_URI = MONGO_URI
    DATABASE_NAME = DATABASE_NAME


class DevelopmentConfig(Config):
    """Development environment configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production environment configuration"""
    DEBUG = False
    TESTING = False
    # Override with production database URI
    MONGO_URI = os.environ.get('MONGO_URI_PROD', MONGO_URI)


class TestingConfig(Config):
    """Testing environment configuration"""
    DEBUG = True
    TESTING = True
    DATABASE_NAME = 'hardware_lab_system_test'


# Select configuration based on environment
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig
}

# Get current environment
ENV = os.environ.get('FLASK_ENV', 'development')
current_config = config_map.get(ENV, DevelopmentConfig)
