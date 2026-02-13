"""
Hardware Model
==============
Data model and validation logic for Hardware entities.
"""

from datetime import datetime


class Hardware:
    """
    Hardware model representing a hardware inventory set.
    
    Attributes:
        hw_name (str): Hardware set name
        description (str): Hardware description
        total_capacity (int): Total number of units
        available (int): Currently available units
        checked_out (int): Currently checked out units
        category (str): Hardware category
        location (str): Physical storage location
        created_at (datetime): Record creation timestamp
        updated_at (datetime): Last update timestamp
    """
    
    def __init__(self, hw_name, total_capacity, description='', category='', location=''):
        self.hw_name = hw_name
        self.description = description
        self.total_capacity = total_capacity
        self.available = total_capacity  # All units available initially
        self.checked_out = 0
        self.category = category
        self.location = location
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """
        Convert hardware object to dictionary for database storage.
        
        Returns:
            dict: Hardware data as dictionary
        """
        return {
            'hw_name': self.hw_name,
            'description': self.description,
            'total_capacity': self.total_capacity,
            'available': self.available,
            'checked_out': self.checked_out,
            'category': self.category,
            'location': self.location,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    def to_json(self):
        """
        Convert hardware object to JSON-safe dictionary.
        
        Returns:
            dict: Hardware data for API responses
        """
        return {
            'hw_name': self.hw_name,
            'description': self.description,
            'total_capacity': self.total_capacity,
            'available': self.available,
            'checked_out': self.checked_out,
            'category': self.category,
            'location': self.location,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def reserve(self, quantity):
        """
        Reserve hardware units (checkout).
        
        Args:
            quantity (int): Number of units to reserve
        
        Returns:
            tuple: (success, error_message)
        """
        if quantity <= 0:
            return False, "Quantity must be positive"
        
        if self.available < quantity:
            return False, "Insufficient hardware available"
        
        self.available -= quantity
        self.checked_out += quantity
        self.updated_at = datetime.utcnow()
        return True, None
    
    def release(self, quantity):
        """
        Release hardware units (check-in).
        
        Args:
            quantity (int): Number of units to release
        
        Returns:
            tuple: (success, error_message)
        """
        if quantity <= 0:
            return False, "Quantity must be positive"
        
        if self.checked_out < quantity:
            return False, "Cannot release more than checked out"
        
        self.available += quantity
        self.checked_out -= quantity
        self.updated_at = datetime.utcnow()
        return True, None
    
    @staticmethod
    def validate_hw_name(hw_name):
        """
        Validate hardware name.
        
        Args:
            hw_name (str): Hardware name to validate
        
        Returns:
            tuple: (is_valid, error_message)
        """
        if not hw_name or len(hw_name) < 3:
            return False, "Hardware name must be at least 3 characters"
        
        if len(hw_name) > 100:
            return False, "Hardware name must be less than 100 characters"
        
        return True, None
    
    @staticmethod
    def validate_capacity(capacity):
        """
        Validate hardware capacity.
        
        Args:
            capacity (int): Capacity to validate
        
        Returns:
            tuple: (is_valid, error_message)
        """
        if not isinstance(capacity, int) or capacity <= 0:
            return False, "Capacity must be a positive integer"
        
        if capacity > 10000:
            return False, "Capacity must be less than 10000"
        
        return True, None
    
    def check_invariant(self):
        """
        Verify the invariant: available + checked_out = total_capacity
        
        Returns:
            bool: True if invariant holds, False otherwise
        """
        return self.available + self.checked_out == self.total_capacity
