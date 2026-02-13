"""
Users Database Module
=====================
This module handles all user-related database operations including:
- User registration
- User authentication
- User profile management
- User project list retrieval

Database Collection: usersDB
"""

from pymongo import MongoClient
from datetime import datetime
import config

# Initialize MongoDB connection
client = MongoClient(config.MONGO_URI)
db = client[config.DATABASE_NAME]
users_collection = db[config.USERS_COLLECTION]


def addUser(username, password):
    """
    Create a new user account.
    
    Args:
        username (str): Unique username
        password (str): User password (will be hashed in production)
    
    Returns:
        dict: Result with success status and message
        
    TODO: 
        - Add password hashing before storing
        - Add email validation
        - Add username format validation
    """
    try:
        # Check if username already exists
        existing_user = users_collection.find_one({'username': username})
        
        if existing_user:
            return {
                'success': False,
                'error': 'Username already exists'
            }
        
        # TODO: Hash password before storing
        # from bcrypt import hashpw, gensalt
        # hashed_password = hashpw(password.encode('utf-8'), gensalt())
        
        # Create user document
        user_doc = {
            'username': username,
            'password': password,  # TODO: Store hashed password
            'role': 'user',  # Default role
            'projects': [],  # Empty project list initially
            'created_at': datetime.utcnow(),
            'last_login': None
        }
        
        # Insert into database
        result = users_collection.insert_one(user_doc)
        
        if result.inserted_id:
            return {
                'success': True,
                'message': 'User created successfully',
                'username': username
            }
        else:
            return {
                'success': False,
                'error': 'Failed to create user'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def login(username, password):
    """
    Authenticate user credentials.
    
    Args:
        username (str): Username
        password (str): Password to verify
    
    Returns:
        dict: Result with success status, user info, and project list
        
    TODO:
        - Add password hash verification
        - Add login attempt tracking
        - Add account lockout after failed attempts
    """
    try:
        # Find user by username
        user = users_collection.find_one({'username': username})
        
        if not user:
            return {
                'success': False,
                'error': 'Invalid username or password'
            }
        
        # TODO: Verify hashed password
        # from bcrypt import checkpw
        # if not checkpw(password.encode('utf-8'), user['password']):
        #     return {'success': False, 'error': 'Invalid username or password'}
        
        # Simple password check (replace with hash verification)
        if user['password'] != password:
            return {
                'success': False,
                'error': 'Invalid username or password'
            }
        
        # Update last login timestamp
        users_collection.update_one(
            {'username': username},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        return {
            'success': True,
            'message': 'Login successful',
            'username': username,
            'projects': user.get('projects', []),
            'role': user.get('role', 'user')
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def getUser(username):
    """
    Retrieve user information.
    
    Args:
        username (str): Username to look up
    
    Returns:
        dict: User document or None if not found
    """
    try:
        user = users_collection.find_one(
            {'username': username},
            {'password': 0}  # Exclude password from results
        )
        return user
    except Exception as e:
        print(f"Error retrieving user: {e}")
        return None


def getUserProjects(username):
    """
    Get list of projects for a user.
    
    Args:
        username (str): Username
    
    Returns:
        dict: Result with list of project IDs
    """
    try:
        user = users_collection.find_one(
            {'username': username},
            {'projects': 1}
        )
        
        if not user:
            return {
                'success': False,
                'error': 'User not found'
            }
        
        return {
            'success': True,
            'projects': user.get('projects', [])
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def addProjectToUser(username, project_id):
    """
    Add a project to user's project list.
    
    Args:
        username (str): Username
        project_id (str): Project ID to add
    
    Returns:
        dict: Result with success status
    """
    try:
        result = users_collection.update_one(
            {'username': username},
            {'$addToSet': {'projects': project_id}}
        )
        
        if result.modified_count > 0:
            return {
                'success': True,
                'message': 'Project added to user'
            }
        else:
            return {
                'success': False,
                'error': 'Failed to add project to user'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def removeProjectFromUser(username, project_id):
    """
    Remove a project from user's project list.
    
    Args:
        username (str): Username
        project_id (str): Project ID to remove
    
    Returns:
        dict: Result with success status
    """
    try:
        result = users_collection.update_one(
            {'username': username},
            {'$pull': {'projects': project_id}}
        )
        
        if result.modified_count > 0:
            return {
                'success': True,
                'message': 'Project removed from user'
            }
        else:
            return {
                'success': False,
                'error': 'Failed to remove project from user'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


# ============================================================================
# Database Initialization
# ============================================================================

def initialize_indexes():
    """
    Create database indexes for optimal query performance.
    Should be called once during application setup.
    """
    try:
        # Create unique index on username
        users_collection.create_index('username', unique=True)
        print("Users database indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {e}")


# Initialize indexes when module is loaded
# Comment out if you don't want automatic index creation
# initialize_indexes()
