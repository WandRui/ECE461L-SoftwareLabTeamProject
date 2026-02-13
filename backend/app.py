"""
Main Flask Application
======================
This file contains the Flask application initialization and all REST API endpoints.
It handles user authentication, project management, and hardware inventory operations.

Main Routes:
- Authentication: /register, /login, /logout
- User Management: /get_user_projects_list
- Project Management: /create_project, /join_project, /get_project_details
- Hardware Management: /create_hardware_set, /get_hardware_sets, /get_hardware_availability
- Hardware Operations: /check_out, /check_in
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from datetime import timedelta
import config
from database import usersDB, projectsDB, hardwareDB

# Initialize Flask application
app = Flask(__name__)
app.config['SECRET_KEY'] = config.SECRET_KEY
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

# Enable CORS for frontend communication
CORS(app, supports_credentials=True)

# ============================================================================
# Authentication Routes
# ============================================================================

@app.route('/register', methods=['POST'])
def register():
    """
    Register a new user account.
    
    Request Body:
        - username (str): Unique username
        - password (str): User password
    
    Returns:
        JSON response with success status and message
    """
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # TODO: Add input validation
        # TODO: Add password hashing
        
        result = usersDB.addUser(username, password)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and create session.
    
    Request Body:
        - username (str): User's username
        - password (str): User's password
    
    Returns:
        JSON response with user info and project list
    """
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        result = usersDB.login(username, password)
        
        if result['success']:
            # Create session
            session['username'] = username
            session.permanent = True
            return jsonify(result), 200
        else:
            return jsonify(result), 401
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/logout', methods=['POST'])
def logout():
    """
    End user session.
    
    Returns:
        JSON response confirming logout
    """
    session.pop('username', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200


# ============================================================================
# User Management Routes
# ============================================================================

@app.route('/get_user_projects_list', methods=['GET'])
def get_user_projects_list():
    """
    Get list of projects for the authenticated user.
    
    Returns:
        JSON response with array of user's projects
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        username = session['username']
        result = usersDB.getUserProjects(username)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# Project Management Routes
# ============================================================================

@app.route('/create_project', methods=['POST'])
def create_project():
    """
    Create a new project.
    
    Request Body:
        - name (str): Project name
        - description (str): Project description
    
    Returns:
        JSON response with created project details
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        owner = session['username']
        
        result = projectsDB.createProject(name, description, owner)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/join_project', methods=['POST'])
def join_project():
    """
    Join an existing project.
    
    Request Body:
        - project_id (str): ID of project to join
    
    Returns:
        JSON response confirming project membership
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        data = request.get_json()
        project_id = data.get('project_id')
        username = session['username']
        
        result = projectsDB.addUser(project_id, username)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/get_project_details/<project_id>', methods=['GET'])
def get_project_details(project_id):
    """
    Get detailed information about a project.
    
    URL Parameters:
        - project_id (str): Project identifier
    
    Returns:
        JSON response with project details
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        username = session['username']
        result = projectsDB.getProject(project_id, username)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# Hardware Management Routes
# ============================================================================

@app.route('/create_hardware_set', methods=['POST'])
def create_hardware_set():
    """
    Create a new hardware set (admin only).
    
    Request Body:
        - hw_name (str): Hardware set name
        - total_capacity (int): Total number of units
        - description (str, optional): Hardware description
    
    Returns:
        JSON response with created hardware set details
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    # TODO: Add admin role check
    
    try:
        data = request.get_json()
        hw_name = data.get('hw_name')
        total_capacity = data.get('total_capacity')
        description = data.get('description', '')
        
        result = hardwareDB.createHardwareSet(hw_name, total_capacity, description)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/get_hardware_sets', methods=['GET'])
def get_hardware_sets():
    """
    Get all hardware sets with availability information.
    
    Returns:
        JSON response with array of hardware sets
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        result = hardwareDB.getAllHardwareSets()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/get_hardware_availability/<hw_name>', methods=['GET'])
def get_hardware_availability(hw_name):
    """
    Get availability for a specific hardware set.
    
    URL Parameters:
        - hw_name (str): Hardware identifier
    
    Returns:
        JSON response with hardware availability details
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        result = hardwareDB.getAvailability(hw_name)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# Hardware Checkout/Check-in Routes
# ============================================================================

@app.route('/check_out', methods=['POST'])
def check_out():
    """
    Check out hardware for a project.
    
    Request Body:
        - project_id (str): Project ID
        - hw_name (str): Hardware set name
        - quantity (int): Number of units to check out
    
    Returns:
        JSON response with checkout details
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        data = request.get_json()
        project_id = data.get('project_id')
        hw_name = data.get('hw_name')
        quantity = data.get('quantity')
        username = session['username']
        
        # TODO: Verify user is project member
        # TODO: Add transaction safety for concurrent requests
        
        # Check availability
        availability = hardwareDB.getAvailability(hw_name)
        if not availability['success'] or availability['available'] < quantity:
            return jsonify({
                'success': False,
                'error': 'Insufficient hardware available'
            }), 400
        
        # Update hardware inventory
        hw_result = hardwareDB.requestSpace(hw_name, quantity)
        
        if hw_result['success']:
            # Record checkout in project
            proj_result = projectsDB.checkOutHW(project_id, hw_name, quantity, username)
            
            if proj_result['success']:
                return jsonify({
                    'success': True,
                    'message': 'Hardware checked out successfully',
                    'checkout': {
                        'hw_name': hw_name,
                        'quantity': quantity,
                        'remaining_available': hw_result['available']
                    }
                }), 200
            else:
                # Rollback hardware update if project update fails
                hardwareDB.releaseSpace(hw_name, quantity)
                return jsonify(proj_result), 400
        else:
            return jsonify(hw_result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/check_in', methods=['POST'])
def check_in():
    """
    Return hardware to inventory.
    
    Request Body:
        - project_id (str): Project ID
        - hw_name (str): Hardware set name
        - quantity (int): Number of units to return
    
    Returns:
        JSON response with check-in confirmation
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    
    try:
        data = request.get_json()
        project_id = data.get('project_id')
        hw_name = data.get('hw_name')
        quantity = data.get('quantity')
        username = session['username']
        
        # TODO: Verify user is project member
        # TODO: Validate quantity doesn't exceed checked out amount
        
        # Update project record
        proj_result = projectsDB.checkInHW(project_id, hw_name, quantity)
        
        if proj_result['success']:
            # Update hardware inventory
            hw_result = hardwareDB.releaseSpace(hw_name, quantity)
            
            if hw_result['success']:
                return jsonify({
                    'success': True,
                    'message': 'Hardware checked in successfully',
                    'checkin': {
                        'hw_name': hw_name,
                        'quantity': quantity,
                        'available': hw_result['available']
                    }
                }), 200
            else:
                return jsonify(hw_result), 400
        else:
            return jsonify(proj_result), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    # Development server configuration
    # TODO: Use production WSGI server (Gunicorn) for deployment
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True  # Set to False in production
    )
