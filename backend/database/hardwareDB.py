"""
Hardware Database Module
========================
This module handles all hardware inventory database operations including:
- Hardware set creation
- Inventory tracking
- Availability queries
- Hardware reservation and release

Database Collection: hardwareDB
"""

from pymongo import MongoClient
from datetime import datetime
import config

# Initialize MongoDB connection
client = MongoClient(config.MONGO_URI)
db = client[config.DATABASE_NAME]
hardware_collection = db[config.HARDWARE_COLLECTION]


def createHardwareSet(hw_name, total_capacity, description=''):
    """
    Create a new hardware set.
    
    Args:
        hw_name (str): Hardware set name (must be unique)
        total_capacity (int): Total number of units available
        description (str, optional): Hardware description
    
    Returns:
        dict: Result with success status and hardware details
    """
    try:
        # Check if hardware set already exists
        existing_hw = hardware_collection.find_one({'hw_name': hw_name})
        
        if existing_hw:
            return {
                'success': False,
                'error': 'Hardware set already exists'
            }
        
        # Validate capacity
        if total_capacity <= 0:
            return {
                'success': False,
                'error': 'Total capacity must be positive'
            }
        
        # Create hardware document
        hw_doc = {
            'hw_name': hw_name,
            'description': description,
            'total_capacity': total_capacity,
            'available': total_capacity,  # All units available initially
            'checked_out': 0,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert into database
        result = hardware_collection.insert_one(hw_doc)
        
        if result.inserted_id:
            return {
                'success': True,
                'message': 'Hardware set created successfully',
                'hw_name': hw_name,
                'total_capacity': total_capacity,
                'available': total_capacity
            }
        else:
            return {
                'success': False,
                'error': 'Failed to create hardware set'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def queryHardwareSet(hw_name):
    """
    Get details of a specific hardware set.
    
    Args:
        hw_name (str): Hardware set name
    
    Returns:
        dict: Hardware set details or None if not found
    """
    try:
        hw_set = hardware_collection.find_one({'hw_name': hw_name})
        
        if hw_set:
            # Remove MongoDB _id for cleaner output
            hw_set.pop('_id', None)
        
        return hw_set
        
    except Exception as e:
        print(f"Error querying hardware set: {e}")
        return None


def getAllHwNames():
    """
    Get list of all hardware set names.
    
    Returns:
        list: Array of hardware set names
    """
    try:
        hw_names = hardware_collection.distinct('hw_name')
        return hw_names
    except Exception as e:
        print(f"Error retrieving hardware names: {e}")
        return []


def getAllHardwareSets():
    """
    Get all hardware sets with availability information.
    
    Returns:
        dict: Result with list of all hardware sets
    """
    try:
        hardware_sets = list(hardware_collection.find({}, {'_id': 0}))
        
        return {
            'success': True,
            'hardware_sets': hardware_sets
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def getAvailability(hw_name):
    """
    Get current availability for a hardware set.
    
    Args:
        hw_name (str): Hardware set name
    
    Returns:
        dict: Result with availability information
    """
    try:
        hw_set = hardware_collection.find_one(
            {'hw_name': hw_name},
            {'_id': 0, 'hw_name': 1, 'total_capacity': 1, 'available': 1, 'checked_out': 1}
        )
        
        if not hw_set:
            return {
                'success': False,
                'error': 'Hardware set not found'
            }
        
        return {
            'success': True,
            'hw_name': hw_set['hw_name'],
            'total_capacity': hw_set['total_capacity'],
            'available': hw_set['available'],
            'checked_out': hw_set['checked_out']
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def requestSpace(hw_name, quantity):
    """
    Reserve hardware units (decrease available count).
    Used during hardware checkout.
    
    Args:
        hw_name (str): Hardware set name
        quantity (int): Number of units to reserve
    
    Returns:
        dict: Result with success status and updated availability
        
    TODO:
        - Add transaction support for concurrent requests
        - Add validation to prevent over-allocation
    """
    try:
        # Check current availability
        hw_set = hardware_collection.find_one({'hw_name': hw_name})
        
        if not hw_set:
            return {
                'success': False,
                'error': 'Hardware set not found'
            }
        
        if hw_set['available'] < quantity:
            return {
                'success': False,
                'error': 'Insufficient hardware available'
            }
        
        # Update availability
        result = hardware_collection.update_one(
            {'hw_name': hw_name},
            {
                '$inc': {
                    'available': -quantity,
                    'checked_out': quantity
                },
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        
        if result.modified_count > 0:
            # Get updated values
            updated_hw = hardware_collection.find_one({'hw_name': hw_name})
            
            return {
                'success': True,
                'message': 'Hardware reserved successfully',
                'available': updated_hw['available'],
                'checked_out': updated_hw['checked_out']
            }
        else:
            return {
                'success': False,
                'error': 'Failed to reserve hardware'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def releaseSpace(hw_name, quantity):
    """
    Release hardware units (increase available count).
    Used during hardware check-in.
    
    Args:
        hw_name (str): Hardware set name
        quantity (int): Number of units to release
    
    Returns:
        dict: Result with success status and updated availability
    """
    try:
        # Verify hardware set exists
        hw_set = hardware_collection.find_one({'hw_name': hw_name})
        
        if not hw_set:
            return {
                'success': False,
                'error': 'Hardware set not found'
            }
        
        # Validate quantity doesn't exceed checked out amount
        if hw_set['checked_out'] < quantity:
            return {
                'success': False,
                'error': 'Cannot release more than checked out quantity'
            }
        
        # Update availability
        result = hardware_collection.update_one(
            {'hw_name': hw_name},
            {
                '$inc': {
                    'available': quantity,
                    'checked_out': -quantity
                },
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        
        if result.modified_count > 0:
            # Get updated values
            updated_hw = hardware_collection.find_one({'hw_name': hw_name})
            
            return {
                'success': True,
                'message': 'Hardware released successfully',
                'available': updated_hw['available'],
                'checked_out': updated_hw['checked_out']
            }
        else:
            return {
                'success': False,
                'error': 'Failed to release hardware'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'Database error: {str(e)}'
        }


def updateCapacity(hw_name, new_capacity):
    """
    Update total capacity for a hardware set.
    
    Args:
        hw_name (str): Hardware set name
        new_capacity (int): New total capacity
    
    Returns:
        dict: Result with success status
        
    Note:
        This adjusts the available quantity to maintain the invariant:
        available + checked_out = total_capacity
    """
    try:
        hw_set = hardware_collection.find_one({'hw_name': hw_name})
        
        if not hw_set:
            return {
                'success': False,
                'error': 'Hardware set not found'
            }
        
        # Validate new capacity
        if new_capacity < hw_set['checked_out']:
            return {
                'success': False,
                'error': 'New capacity cannot be less than currently checked out units'
            }
        
        # Calculate new available quantity
        new_available = new_capacity - hw_set['checked_out']
        
        result = hardware_collection.update_one(
            {'hw_name': hw_name},
            {
                '$set': {
                    'total_capacity': new_capacity,
                    'available': new_available,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            return {
                'success': True,
                'message': 'Hardware capacity updated successfully'
            }
        else:
            return {
                'success': False,
                'error': 'Failed to update capacity'
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
        # Create unique index on hardware name
        hardware_collection.create_index('hw_name', unique=True)
        
        # Create index on availability for quick queries
        hardware_collection.create_index('available')
        
        print("Hardware database indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {e}")


# Initialize indexes when module is loaded
# Comment out if you don't want automatic index creation
# initialize_indexes()
