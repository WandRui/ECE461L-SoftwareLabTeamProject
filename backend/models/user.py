"""
User Model
==========
Data model and validation logic for User entities.
"""

from datetime import datetime


class User:
    """
    User model representing a system user.
    
    Attributes:
        username (str): Unique username
        password (str): Hashed password
        email (str): User email address
        role (str): User role ('user' or 'admin')
        projects (list): List of project IDs
        created_at (datetime): Account creation timestamp
        last_login (datetime): Last login timestamp
    """
    
    def __init__(self, username, password, email='', role='user'):
        self.username = username
        self.password = password
        self.email = email
        self.role = role
        self.projects = []
        self.created_at = datetime.utcnow()
        self.last_login = None
    
    def to_dict(self):
        """
        Convert user object to dictionary for database storage.
        
        Returns:
            dict: User data as dictionary
        """
        return {
            'username': self.username,
            'password': self.password,
            'email': self.email,
            'role': self.role,
            'projects': self.projects,
            'created_at': self.created_at,
            'last_login': self.last_login
        }
    
    def to_json(self):
        """
        Convert user object to JSON-safe dictionary (excludes password).
        
        Returns:
            dict: User data for API responses
        """
        return {
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'projects': self.projects,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    @staticmethod
    def validate_username(username):
        """
        Validate username format.
        
        Args:
            username (str): Username to validate
        
        Returns:
            tuple: (is_valid, error_message)
        """
        if not username or len(username) < 3:
            return False, "Username must be at least 3 characters"
        
        if len(username) > 50:
            return False, "Username must be less than 50 characters"
        
        if not username.replace('_', '').isalnum():
            return False, "Username can only contain letters, numbers, and underscores"
        
        return True, None
    
    @staticmethod
    def validate_password(password):
        """
        Validate password strength.
        
        Args:
            password (str): Password to validate
        
        Returns:
            tuple: (is_valid, error_message)
        """
        if not password or len(password) < 8:
            return False, "Password must be at least 8 characters"
        
        if len(password) > 100:
            return False, "Password must be less than 100 characters"
        
        # TODO: Add more password strength requirements
        # - At least one uppercase letter
        # - At least one lowercase letter
        # - At least one number
        # - At least one special character
        
        return True, None
    
    @staticmethod
    def validate_email(email):
        """
        Validate email format.
        
        Args:
            email (str): Email to validate
        
        Returns:
            tuple: (is_valid, error_message)
        """
        if not email:
            return True, None  # Email is optional
        
        # Simple email validation
        if '@' not in email or '.' not in email.split('@')[1]:
            return False, "Invalid email format"
        
        return True, None
