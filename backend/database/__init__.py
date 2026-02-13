"""
Database Package
================
This package contains all database modules for interacting with MongoDB collections.

Modules:
- usersDB: User account management and authentication
- projectsDB: Project creation and membership management
- hardwareDB: Hardware inventory management
"""

# Import database modules for easy access
from .usersDB import *
from .projectsDB import *
from .hardwareDB import *

__all__ = ['usersDB', 'projectsDB', 'hardwareDB']
