"""
Projects Database Module
========================
This module handles all project-related database operations including:
- Project creation
- Project membership management
- Hardware checkout/check-in tracking
- Project information retrieval

Database Collection: projectsDB
"""

from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import config

# Initialize MongoDB connection
client = MongoClient(config.MONGO_URI)
db = client[config.DATABASE_NAME]
projects_collection = db[config.PROJECTS_COLLECTION]


def createProject(name, description, owner):
    """
    Create a new project.
    
    Args:
        name (str): Project name (must be unique)
        description (str): Project description
        owner (str): Username of project creator
    
    Returns:
        dict: Result with success status and project details
    """
    try:
        # Check if project name already exists
        existing_project = projects_collection.find_one({'name': name})
        
        if existing_project:
            return {
                'success': False,
                'error': 'Project name already exists'
            }
        
        # Create project document
        project_doc = {
            'name': name,
            'description': description,
            'owner': owner,
            'members': [owner],  # Owner is automatically a member
            'hardware_checkouts': [],  # Empty initially
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert into database
        result = projects_collection.insert_one(project_doc)
        
        if result.inserted_id:
            # Also add project to user's project list
            from database.usersDB import addProjectToUser
            addProjectToUser(owner, str(result.inserted_id))
            
            return {
                'success': True,
                'message': 'Project created successfully',
                'project_id': str(result.inserted_id),
                'name': name
            }
        else:
            return {
                'success': False,
                'error': 'Failed to create project'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def addUser(project_id, username):
    """
    Add a user to a project.
    
    Args:
        project_id (str): Project ID
        username (str): Username to add
    
    Returns:
        dict: Result with success status
    """
    try:
        # Check if project exists
        project = projects_collection.find_one({'_id': ObjectId(project_id)})
        
        if not project:
            return {
                'success': False,
                'error': 'Project not found'
            }
        
        # Check if user is already a member
        if username in project['members']:
            return {
                'success': False,
                'error': 'User is already a project member'
            }
        
        # Add user to project
        result = projects_collection.update_one(
            {'_id': ObjectId(project_id)},
            {
                '$push': {'members': username},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        
        if result.modified_count > 0:
            # Also add project to user's project list
            from database.usersDB import addProjectToUser
            addProjectToUser(username, project_id)
            
            return {
                'success': True,
                'message': 'User added to project successfully',
                'project': {
                    'id': project_id,
                    'name': project['name']
                }
            }
        else:
            return {
                'success': False,
                'error': 'Failed to add user to project'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def removeUser(project_id, username):
    """
    Remove a user from a project.
    
    Args:
        project_id (str): Project ID
        username (str): Username to remove
    
    Returns:
        dict: Result with success status
    """
    try:
        # Check if user is project owner
        project = projects_collection.find_one({'_id': ObjectId(project_id)})
        
        if not project:
            return {
                'success': False,
                'error': 'Project not found'
            }
        
        if project['owner'] == username:
            return {
                'success': False,
                'error': 'Cannot remove project owner'
            }
        
        # Remove user from project
        result = projects_collection.update_one(
            {'_id': ObjectId(project_id)},
            {
                '$pull': {'members': username},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        
        if result.modified_count > 0:
            # Also remove project from user's project list
            from database.usersDB import removeProjectFromUser
            removeProjectFromUser(username, project_id)
            
            return {
                'success': True,
                'message': 'User removed from project'
            }
        else:
            return {
                'success': False,
                'error': 'Failed to remove user from project'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def getProject(project_id, username):
    """
    Get project details.
    
    Args:
        project_id (str): Project ID
        username (str): Username requesting the information
    
    Returns:
        dict: Project details or error if not authorized
    """
    try:
        project = projects_collection.find_one({'_id': ObjectId(project_id)})
        
        if not project:
            return {
                'success': False,
                'error': 'Project not found'
            }
        
        # Check if user is a member
        if username not in project['members']:
            return {
                'success': False,
                'error': 'Not authorized to view this project'
            }
        
        # Convert ObjectId to string for JSON serialization
        project['_id'] = str(project['_id'])
        
        return {
            'success': True,
            'project': project
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def checkOutHW(project_id, hw_name, quantity, username):
    """
    Record hardware checkout for a project.
    
    Args:
        project_id (str): Project ID
        hw_name (str): Hardware set name
        quantity (int): Number of units to check out
        username (str): User who is checking out
    
    Returns:
        dict: Result with success status
    """
    try:
        checkout_record = {
            'hw_name': hw_name,
            'quantity': quantity,
            'checked_out_at': datetime.utcnow(),
            'checked_out_by': username
        }
        
        result = projects_collection.update_one(
            {'_id': ObjectId(project_id)},
            {
                '$push': {'hardware_checkouts': checkout_record},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        
        if result.modified_count > 0:
            return {
                'success': True,
                'message': 'Hardware checkout recorded'
            }
        else:
            return {
                'success': False,
                'error': 'Failed to record checkout'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def checkInHW(project_id, hw_name, quantity):
    """
    Record hardware check-in for a project.
    
    Args:
        project_id (str): Project ID
        hw_name (str): Hardware set name
        quantity (int): Number of units to return
    
    Returns:
        dict: Result with success status
    """
    try:
        # Find the checkout record and update quantity
        project = projects_collection.find_one({'_id': ObjectId(project_id)})
        
        if not project:
            return {
                'success': False,
                'error': 'Project not found'
            }
        
        # Find matching hardware checkout
        checkouts = project.get('hardware_checkouts', [])
        updated = False
        
        for checkout in checkouts:
            if checkout['hw_name'] == hw_name:
                # Reduce quantity or remove if returning all
                if checkout['quantity'] <= quantity:
                    # Remove the entire checkout record
                    projects_collection.update_one(
                        {'_id': ObjectId(project_id)},
                        {
                            '$pull': {'hardware_checkouts': {'hw_name': hw_name}},
                            '$set': {'updated_at': datetime.utcnow()}
                        }
                    )
                else:
                    # Reduce the quantity
                    projects_collection.update_one(
                        {
                            '_id': ObjectId(project_id),
                            'hardware_checkouts.hw_name': hw_name
                        },
                        {
                            '$inc': {'hardware_checkouts.$.quantity': -quantity},
                            '$set': {'updated_at': datetime.utcnow()}
                        }
                    )
                updated = True
                break
        
        if updated:
            return {
                'success': True,
                'message': 'Hardware check-in recorded'
            }
        else:
            return {
                'success': False,
                'error': 'Hardware not found in project checkouts'
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
        # Create unique index on project name
        projects_collection.create_index('name', unique=True)
        
        # Create index on owner for faster queries
        projects_collection.create_index('owner')
        
        # Create index on members for membership queries
        projects_collection.create_index('members')
        
        print("Projects database indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {e}")


# Initialize indexes when module is loaded
# Comment out if you don't want automatic index creation
# initialize_indexes()
