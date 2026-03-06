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
CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:3000']:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

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
            session['role'] = result.get('role', 'user')
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
    Get list of projects for the authenticated user with full details.

    Returns:
        JSON response with array of project objects {id, name, description, role}
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401

    try:
        username = session['username']
        id_result = usersDB.getUserProjects(username)

        if not id_result['success']:
            return jsonify(id_result), 200

        project_ids = id_result.get('projects', [])
        projects = []
        for project_id in project_ids:
            detail = projectsDB.getProject(project_id, username)
            if detail['success']:
                p = detail['project']
                projects.append({
                    'id': p['_id'],
                    'name': p['name'],
                    'description': p.get('description', ''),
                    'role': 'owner' if p.get('owner') == username else 'member',
                    'members': p.get('members', []),
                    'hardware_checkouts': p.get('hardware_checkouts', []),
                })

        return jsonify({'success': True, 'projects': projects}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# Admin Routes
# ============================================================================

@app.route('/admin/all_users', methods=['GET'])
def admin_all_users():
    """
    Get all users with their projects and hardware checkout details (admin only).

    Returns:
        JSON list of users, each with: username, role, projects (with hardware_checkouts)
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401

    requester_role = session.get('role')
    if requester_role not in ('admin', 'superadmin'):
        return jsonify({'success': False, 'error': 'Admin access required'}), 403

    try:
        is_superadmin = requester_role == 'superadmin'
        raw_users = usersDB.getAllUsersWithPasswords() if is_superadmin else usersDB.getAllUsers()
        result = []
        for user in raw_users:
            username = user['username']
            project_ids = user.get('projects', [])
            projects = []
            for pid in project_ids:
                detail = projectsDB.getProject(pid, username)
                if detail['success']:
                    p = detail['project']
                    projects.append({
                        'id': p['_id'],
                        'name': p['name'],
                        'role': 'owner' if p.get('owner') == username else 'member',
                        'hardware_checkouts': p.get('hardware_checkouts', []),
                    })
            entry = {
                'username': username,
                'role': user.get('role', 'user'),
                'projects': projects,
            }
            if is_superadmin:
                entry['password'] = user.get('password', '')
            result.append(entry)
        return jsonify({'success': True, 'users': result, 'show_passwords': is_superadmin}), 200
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


@app.route('/add_member', methods=['POST'])
def add_member():
    """
    Add a user to a project (owner only).

    Request Body:
        - project_id (str): Project ID
        - username (str): Username to add
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401

    try:
        data = request.get_json()
        project_id = data.get('project_id')
        target_username = data.get('username', '').strip()
        requester = session['username']

        if not target_username:
            return jsonify({'success': False, 'error': 'Username is required'}), 400

        # Verify requester is the project owner
        detail = projectsDB.getProject(project_id, requester)
        if not detail['success']:
            return jsonify({'success': False, 'error': 'Project not found or access denied'}), 404
        if detail['project'].get('owner') != requester:
            return jsonify({'success': False, 'error': 'Only the project owner can add members'}), 403

        # Verify target user exists
        target_user = usersDB.getUser(target_username)
        if not target_user:
            return jsonify({'success': False, 'error': f'User "{target_username}" does not exist'}), 404

        result = projectsDB.addUser(project_id, target_username)
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/remove_member', methods=['POST'])
def remove_member():
    """
    Remove a user from a project (owner only).

    Request Body:
        - project_id (str): Project ID
        - username (str): Username to remove
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401

    try:
        data = request.get_json()
        project_id = data.get('project_id')
        target_username = data.get('username', '').strip()
        requester = session['username']

        if not target_username:
            return jsonify({'success': False, 'error': 'Username is required'}), 400

        # Verify requester is the project owner
        detail = projectsDB.getProject(project_id, requester)
        if not detail['success']:
            return jsonify({'success': False, 'error': 'Project not found or access denied'}), 404
        if detail['project'].get('owner') != requester:
            return jsonify({'success': False, 'error': 'Only the project owner can remove members'}), 403

        result = projectsDB.removeUser(project_id, target_username)
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

    if session.get('role') not in ('admin', 'superadmin'):
        return jsonify({'success': False, 'error': 'Admin access required'}), 403

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


@app.route('/delete_hardware_set', methods=['DELETE'])
def delete_hardware_set():
    """
    Delete a hardware set (admin only).

    Request Body:
        - hw_name (str): Hardware set name to delete

    Returns:
        JSON response with success status
    """
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401

    if session.get('role') not in ('admin', 'superadmin'):
        return jsonify({'success': False, 'error': 'Admin access required'}), 403

    try:
        data = request.get_json()
        hw_name = data.get('hw_name')

        result = hardwareDB.deleteHardwareSet(hw_name)

        if result['success']:
            return jsonify(result), 200
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
