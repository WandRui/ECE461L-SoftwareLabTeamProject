"""
Input Validation Utilities
===========================
Helper functions for validating user input and request data.
"""

import re


def validate_required_fields(data, required_fields):
    """
    Check if all required fields are present in the data.
    
    Args:
        data (dict): Data to validate
        required_fields (list): List of required field names
    
    Returns:
        tuple: (is_valid, error_message)
    """
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    return True, None


def validate_string_length(value, field_name, min_length=1, max_length=None):
    """
    Validate string length.
    
    Args:
        value (str): String to validate
        field_name (str): Name of the field (for error message)
        min_length (int): Minimum length
        max_length (int, optional): Maximum length
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not isinstance(value, str):
        return False, f"{field_name} must be a string"
    
    if len(value) < min_length:
        return False, f"{field_name} must be at least {min_length} characters"
    
    if max_length and len(value) > max_length:
        return False, f"{field_name} must be less than {max_length} characters"
    
    return True, None


def validate_integer(value, field_name, min_value=None, max_value=None):
    """
    Validate integer value and range.
    
    Args:
        value: Value to validate
        field_name (str): Name of the field (for error message)
        min_value (int, optional): Minimum value
        max_value (int, optional): Maximum value
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not isinstance(value, int):
        try:
            value = int(value)
        except (ValueError, TypeError):
            return False, f"{field_name} must be an integer"
    
    if min_value is not None and value < min_value:
        return False, f"{field_name} must be at least {min_value}"
    
    if max_value is not None and value > max_value:
        return False, f"{field_name} must be at most {max_value}"
    
    return True, None


def validate_username(username):
    """
    Validate username format.
    
    Args:
        username (str): Username to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check length
    is_valid, error = validate_string_length(username, "Username", min_length=3, max_length=50)
    if not is_valid:
        return is_valid, error
    
    # Check format (alphanumeric and underscore only)
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"
    
    return True, None


def validate_password(password):
    """
    Validate password strength.
    
    Args:
        password (str): Password to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check length
    is_valid, error = validate_string_length(password, "Password", min_length=8, max_length=100)
    if not is_valid:
        return is_valid, error
    
    # TODO: Add more password strength requirements
    # - At least one uppercase letter
    # - At least one lowercase letter
    # - At least one number
    # - At least one special character
    
    return True, None


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
    
    # Simple email regex
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_pattern, email):
        return False, "Invalid email format"
    
    return True, None


def validate_project_name(name):
    """
    Validate project name.
    
    Args:
        name (str): Project name to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_string_length(name, "Project name", min_length=3, max_length=100)


def validate_hardware_name(name):
    """
    Validate hardware name.
    
    Args:
        name (str): Hardware name to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_string_length(name, "Hardware name", min_length=3, max_length=100)


def validate_quantity(quantity):
    """
    Validate hardware quantity.
    
    Args:
        quantity: Quantity to validate
    
    Returns:
        tuple: (is_valid, error_message)
    """
    return validate_integer(quantity, "Quantity", min_value=1, max_value=10000)


def sanitize_string(value):
    """
    Sanitize string input to prevent injection attacks.
    
    Args:
        value (str): String to sanitize
    
    Returns:
        str: Sanitized string
    
    TODO: Implement proper sanitization
    """
    if not isinstance(value, str):
        return value
    
    # Basic sanitization - remove potentially dangerous characters
    # In production, use a proper sanitization library
    sanitized = value.strip()
    
    # Remove any potential script tags
    sanitized = re.sub(r'<script[^>]*>.*?</script>', '', sanitized, flags=re.IGNORECASE)
    
    return sanitized
