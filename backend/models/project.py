"""
Project Model
=============
Data model and validation logic for Project entities.
"""

from datetime import datetime


class Project:
    """
    Project model representing a collaborative project.
    
    Attributes:
        name (str): Project name
        description (str): Project description
        owner (str): Username of project owner
        members (list): List of member usernames
        hardware_checkouts (list): List of hardware checkout records
        created_at (datetime): Project creation timestamp
        updated_at (datetime): Last update timestamp
    """
    
    def __init__(self, name, description, owner):
        self.name = name
        self.description = description
        self.owner = owner
        self.members = [owner]  # Owner is automatically a member
        self.hardware_checkouts = []
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """
        Convert project object to dictionary for database storage.
        
        Returns:
            dict: Project data as dictionary
        """
        return {
            'name': self.name,
            'description': self.description,
            'owner': self.owner,
            'members': self.members,
            'hardware_checkouts': self.hardware_checkouts,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    def to_json(self):
        """
        Convert project object to JSON-safe dictionary.
        
        Returns:
            dict: Project data for API responses
        """
        return {
            'name': self.name,
            'description': self.description,
            'owner': self.owner,
            'members': self.members,
            'hardware_checkouts': self.hardware_checkouts,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def add_member(self, username):
        """
        Add a member to the project.
        
        Args:
            username (str): Username to add
        
        Returns:
            bool: True if added, False if already a member
        """
        if username not in self.members:
            self.members.append(username)
            self.updated_at = datetime.utcnow()
            return True
        return False
    
    def remove_member(self, username):
        """
        Remove a member from the project.
        
        Args:
            username (str): Username to remove
        
        Returns:
            bool: True if removed, False if not a member or is owner
        """
        if username == self.owner:
            return False  # Cannot remove owner
        
        if username in self.members:
            self.members.remove(username)
            self.updated_at = datetime.utcnow()
            return True
        return False
    
    @staticmethod
    def validate_name(name):
        """
        Validate project name.
        
        Args:
            name (str): Project name to validate
        
        Returns:
            tuple: (is_valid, error_message)
        """
        if not name or len(name) < 3:
            return False, "Project name must be at least 3 characters"
        
        if len(name) > 100:
            return False, "Project name must be less than 100 characters"
        
        return True, None
    
    @staticmethod
    def validate_description(description):
        """
        Validate project description.
        
        Args:
            description (str): Description to validate
        
        Returns:
            tuple: (is_valid, error_message)
        """
        if description and len(description) > 500:
            return False, "Description must be less than 500 characters"
        
        return True, None


class HardwareCheckout:
    """
    Hardware checkout record within a project.
    
    Attributes:
        hw_name (str): Hardware set name
        quantity (int): Number of units checked out
        checked_out_at (datetime): Checkout timestamp
        checked_out_by (str): Username who checked out
    """
    
    def __init__(self, hw_name, quantity, checked_out_by):
        self.hw_name = hw_name
        self.quantity = quantity
        self.checked_out_at = datetime.utcnow()
        self.checked_out_by = checked_out_by
    
    def to_dict(self):
        """
        Convert checkout record to dictionary.
        
        Returns:
            dict: Checkout data as dictionary
        """
        return {
            'hw_name': self.hw_name,
            'quantity': self.quantity,
            'checked_out_at': self.checked_out_at,
            'checked_out_by': self.checked_out_by
        }
