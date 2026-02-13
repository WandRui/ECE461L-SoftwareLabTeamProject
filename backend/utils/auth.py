"""
Authentication Utilities
========================
Helper functions for user authentication and session management.
"""

import hashlib
from functools import wraps
from flask import session, jsonify


def hash_password(password):
    """
    Hash a password for storage.
    
    Args:
        password (str): Plain text password
    
    Returns:
        str: Hashed password
    
    TODO: Replace with bcrypt for production
    This is a simple implementation for development only.
    """
    # Simple SHA-256 hashing (NOT SECURE - use bcrypt in production)
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password, hashed_password):
    """
    Verify a password against a hash.
    
    Args:
        plain_password (str): Plain text password to verify
        hashed_password (str): Stored password hash
    
    Returns:
        bool: True if password matches, False otherwise
    
    TODO: Replace with bcrypt for production
    """
    return hash_password(plain_password) == hashed_password


def hash_password_bcrypt(password):
    """
    Hash a password using bcrypt (PRODUCTION VERSION).
    
    Args:
        password (str): Plain text password
    
    Returns:
        bytes: Hashed password
    
    Note: Requires bcrypt library
    """
    # Uncomment when ready to use bcrypt
    # from bcrypt import hashpw, gensalt
    # return hashpw(password.encode('utf-8'), gensalt())
    pass


def verify_password_bcrypt(plain_password, hashed_password):
    """
    Verify a password using bcrypt (PRODUCTION VERSION).
    
    Args:
        plain_password (str): Plain text password to verify
        hashed_password (bytes): Stored bcrypt hash
    
    Returns:
        bool: True if password matches, False otherwise
    
    Note: Requires bcrypt library
    """
    # Uncomment when ready to use bcrypt
    # from bcrypt import checkpw
    # return checkpw(plain_password.encode('utf-8'), hashed_password)
    pass


def require_auth(f):
    """
    Decorator to require authentication for a route.
    
    Usage:
        @app.route('/protected')
        @require_auth
        def protected_route():
            return "This is protected"
    
    Returns:
        function: Decorated function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401
        return f(*args, **kwargs)
    return decorated_function


def require_admin(f):
    """
    Decorator to require admin role for a route.
    
    Usage:
        @app.route('/admin')
        @require_admin
        def admin_route():
            return "This is admin only"
    
    Returns:
        function: Decorated function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401
        
        # TODO: Check user role from database
        # For now, we'll just check if user is authenticated
        # In production, query database to verify admin role
        
        return f(*args, **kwargs)
    return decorated_function


def get_current_user():
    """
    Get the currently logged-in username from session.
    
    Returns:
        str or None: Username if logged in, None otherwise
    """
    return session.get('username', None)


def is_authenticated():
    """
    Check if a user is currently authenticated.
    
    Returns:
        bool: True if authenticated, False otherwise
    """
    return 'username' in session


def create_session(username, role='user'):
    """
    Create a new user session.
    
    Args:
        username (str): Username
        role (str): User role
    """
    session['username'] = username
    session['role'] = role
    session.permanent = True


def destroy_session():
    """
    Destroy the current user session.
    """
    session.pop('username', None)
    session.pop('role', None)
