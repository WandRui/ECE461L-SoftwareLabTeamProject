# ECE461L Software Lab Team Project

A full-stack web application for managing hardware lab resources, enabling users to create projects, manage team collaborations, and check out/check in hardware equipment.

## 📋 Table of Contents
- [Quick Start](#-quick-start)
- [System Architecture](#️-system-architecture)
- [Project Structure](#-project-structure)
- [Core Components](#-core-components)
- [Database Schema](#️-database-schema)
- [Features](#-features)
- [API Endpoints](#-api-endpoints)
- [Development Workflow](#-development-workflow)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

Get up and running in 5 minutes!

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB 4.4+

### Step 1: Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `backend/config.py`

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

Backend runs on `http://localhost:5000`

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start React server
npm start
```

Frontend opens at `http://localhost:3000`

### Step 4: Test the Application

1. **Register**: Create account with username and password (min 8 chars)
2. **Create Project**: Go to Projects → "+ Create Project"
3. **Create Hardware** (via API):
```bash
curl -X POST http://localhost:5000/create_hardware_set \
  -H "Content-Type: application/json" \
  -d '{"hw_name": "Arduino Uno", "total_capacity": 50}'
```
4. **Check Out Hardware**: Go to Hardware Inventory → Select hardware → Check Out

---

## 🏗️ System Architecture

### High-Level Overview
```
User → React Frontend UI → Flask Backend (REST API) → MongoDB Database
                                                       ├─ usersDB
                                                       ├─ projectsDB
                                                       └─ hardwareDB
```

### Technology Stack
- **Frontend**: React.js
- **Backend**: Flask (Python)
- **Database**: MongoDB
- **Communication**: RESTful API (JSON)
- **Authentication**: Flask session management

### Architecture Diagram

See `docs/images/system-architecture-diagram.png` for detailed flow diagram.

---

## 📁 Project Structure

```
ECE461L-SoftwareLabTeamProject/
│
├── backend/                      # Flask backend application
│   ├── app.py                   # Main Flask application & API routes
│   ├── config.py                # Configuration settings (DB connection, secrets)
│   ├── requirements.txt         # Python dependencies
│   │
│   ├── database/                # Database modules
│   │   ├── __init__.py
│   │   ├── usersDB.py          # User management & authentication
│   │   ├── projectsDB.py       # Project management & membership
│   │   └── hardwareDB.py       # Hardware inventory & availability
│   │
│   ├── models/                  # Data models/schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   └── hardware.py
│   │
│   └── utils/                   # Utility functions
│       ├── __init__.py
│       ├── auth.py             # Authentication helpers
│       └── validators.py       # Input validation
│
├── frontend/                    # React frontend application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── index.js            # Entry point
│   │   │
│   │   ├── components/         # Reusable UI components
│   │   │   ├── LoginPage.js
│   │   │   ├── MainPortal.js
│   │   │   ├── ProjectPage.js
│   │   │   └── HardwareInventoryPage.js
│   │   │
│   │   ├── services/           # API communication layer
│   │   │   ├── api.js          # Base API configuration
│   │   │   ├── authService.js
│   │   │   ├── projectService.js
│   │   │   └── hardwareService.js
│   │   │
│   │   └── utils/              # Frontend utilities
│   │       └── constants.js
│   │
│   ├── package.json
│   └── README.md
│
├── docs/                        # Project documentation
│   ├── architecture.md          # Detailed architecture documentation
│   ├── api-spec.md             # REST API specification
│   ├── database-schema.md      # MongoDB schema documentation
│   ├── user-stories.md         # Feature requirements & user stories
│   └── images/
│       └── system-architecture-diagram.png
│
├── .gitignore
└── README.md                    # This file
```

### File Statistics

**Backend (Python)**
- Total Files: 13 Python files (~2,800 lines)
- `app.py`: 500+ lines (all API endpoints)
- Database modules: 1,050+ lines
- Models: 550+ lines
- Utilities: 350+ lines

**Frontend (JavaScript/React)**
- Total Files: 13 JavaScript files (~2,200 lines)
- React components: 1,150+ lines
- Services (API): 470+ lines
- App & routing: 250+ lines

**Documentation**
- Total Files: 9 markdown files (~2,000 lines)
- Complete API specs, architecture docs, user stories

---

## 🔧 Core Components

### Backend (Flask)

#### `app.py` - Main Application
Central Flask application containing all REST API endpoints:

**Authentication Routes:**
- `POST /login` - User authentication
- `POST /register` - New user registration
- `POST /logout` - User logout

**User Management Routes:**
- `GET /get_user_projects_list` - Retrieve user's projects

**Project Management Routes:**
- `POST /create_project` - Create new project
- `POST /join_project` - Join existing project
- `GET /get_project_details/<project_id>` - Get project information

**Hardware Management Routes:**
- `POST /create_hardware_set` - Create hardware inventory (admin)
- `GET /get_hardware_sets` - View all hardware sets
- `GET /get_hardware_availability/<hw_name>` - Check specific hardware availability
- `POST /check_out` - Check out hardware for a project
- `POST /check_in` - Return hardware to inventory

#### Database Modules

**`database/usersDB.py`**
Manages user accounts and authentication:
- `addUser(username, password)` - Create new user account
- `login(username, password)` - Authenticate user credentials
- `getUser(username)` - Retrieve user information
- `getUserProjects(username)` - Get user's project list

**`database/projectsDB.py`**
Handles project creation and membership:
- `createProject(name, description, owner)` - Create new project
- `addUser(project_id, username)` - Add user to project
- `removeUser(project_id, username)` - Remove user from project
- `getProject(project_id)` - Retrieve project details
- `checkOutHW(project_id, hw_name, quantity)` - Record hardware checkout
- `checkInHW(project_id, hw_name, quantity)` - Record hardware return

**`database/hardwareDB.py`**
Manages hardware inventory:
- `createHardwareSet(hw_name, total_capacity)` - Initialize hardware set
- `queryHardwareSet(hw_name)` - Get hardware set details
- `getAllHwNames()` - List all hardware types
- `requestSpace(hw_name, quantity)` - Reserve hardware units
- `releaseSpace(hw_name, quantity)` - Return hardware units
- `getAvailability(hw_name)` - Get current available quantity

### Frontend (React)

#### Main Components

**`LoginPage.js`**
- User authentication interface
- Registration form
- Form validation

**`MainPortal.js`**
- Main dashboard after login
- Navigation to Project Page and Hardware Inventory Page
- User session display

**`ProjectPage.js`**
- Display user's projects
- Create new project functionality
- Join existing project functionality
- View project details and members

**`HardwareInventoryPage.js`**
- Display all hardware sets with availability
- Check out hardware for projects
- Check in hardware from projects
- Real-time availability updates

#### Services Layer

**`services/authService.js`**
- `login(username, password)`
- `register(username, password)`
- `logout()`

**`services/projectService.js`**
- `createProject(projectData)`
- `joinProject(projectId)`
- `getUserProjects()`

**`services/hardwareService.js`**
- `getHardwareSets()`
- `checkOut(projectId, hwName, quantity)`
- `checkIn(projectId, hwName, quantity)`

---

## 🗄️ Database Schema (MongoDB)

### usersDB Collection
```json
{
  "_id": ObjectId,
  "username": String (unique),
  "password": String (hashed),
  "created_at": Date,
  "projects": [String]  // Array of project IDs
}
```

### projectsDB Collection
```json
{
  "_id": ObjectId,
  "name": String,
  "description": String,
  "owner": String,
  "members": [String],  // Array of usernames
  "hardware_checkouts": [
    {
      "hw_name": String,
      "quantity": Number,
      "checked_out_at": Date
    }
  ],
  "created_at": Date
}
```

### hardwareDB Collection
```json
{
  "_id": ObjectId,
  "hw_name": String (unique),
  "total_capacity": Number,
  "available": Number,
  "created_at": Date
}
```

See `docs/database-schema.md` for detailed schema documentation with indexes, validation rules, and transaction examples.

---

## ✨ Features

### Feature 1: User Management
- User registration and authentication
- Secure login/logout
- View personal project list

### Feature 2: Project Management
- Create new projects
- Join existing projects
- View project details and team members

### Feature 3: Hardware Inventory Management
- View all available hardware
- Real-time inventory tracking
- Admin hardware set creation

### Feature 4: Hardware Checkout & Check-in
- Check out hardware for projects
- Return hardware to inventory
- Prevent over-allocation

### Feature 5: Frontend Dashboard
- Intuitive user interface
- Project and hardware overview
- Easy navigation between views

See `docs/user-stories.md` for complete user stories, acceptance criteria, and sprint planning.

---

## 🌐 API Endpoints

### Authentication (3 endpoints)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout

### User Management (1 endpoint)
- `GET /get_user_projects_list` - Get user's projects

### Project Management (3 endpoints)
- `POST /create_project` - Create project
- `POST /join_project` - Join project
- `GET /get_project_details/<id>` - Get project details

### Hardware Management (3 endpoints)
- `POST /create_hardware_set` - Create hardware (admin)
- `GET /get_hardware_sets` - List all hardware
- `GET /get_hardware_availability/<name>` - Check availability

### Hardware Operations (2 endpoints)
- `POST /check_out` - Check out hardware
- `POST /check_in` - Return hardware

**Total: 13 API endpoints**

See `docs/api-spec.md` for complete API documentation with request/response formats and error codes.

---

## 🛠️ Development Workflow

### Dependencies

**Backend Requirements** (`backend/requirements.txt`):
```
Flask==3.0.0
Flask-CORS==4.0.0
Flask-Session==0.5.0
pymongo==4.6.0
bcrypt==4.1.2
python-dotenv==1.0.0
Werkzeug==3.0.1
```

**Frontend Dependencies** (`frontend/package.json`):
```
react==18.2.0
react-dom==18.2.0
react-router-dom==6.20.0
axios==1.6.2
react-scripts==5.0.1
```

### Development Workflow

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py

# Terminal 2: Frontend
cd frontend
npm start

# Both servers auto-reload on file changes
```

### Current Work Items
See GitHub Project board (to be created) for detailed task tracking.

### Technical Debt & TODOs
- Implement password hashing (bcrypt/argon2)
- Add role-based access control (admin vs user)
- Improve concurrency handling for hardware checkouts
- Add comprehensive input validation
- Implement transaction-like safety checks
- Add unit and integration tests
- Add error logging and monitoring
- Performance optimization

### Research Items
- Flask session management vs JWT authentication
- MongoDB document structure optimization
- React state management (Context API vs Redux)
- Concurrency control strategies for checkout operations

---

## 🔧 Troubleshooting

### Backend Issues

**"ModuleNotFoundError"**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt
```

**"Connection refused" for MongoDB**
```bash
# Start MongoDB service
mongod
```

**"Port 5000 already in use"**
```bash
# macOS/Linux:
lsof -ti:5000 | xargs kill -9
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend Issues

**"npm: command not found"**
- Install Node.js from [nodejs.org](https://nodejs.org/)

**"Port 3000 already in use"**
- App will offer to run on port 3001
- Or kill the process using port 3000

**CORS errors in browser**
- Ensure backend is running on port 5000
- Check CORS configuration in `backend/app.py`
- Verify `CORS_ORIGINS` in `backend/config.py`

### Database Issues

**MongoDB connection timeout**
- Check MongoDB is running: `mongod --version`
- Verify connection string in `backend/config.py`
- For MongoDB Atlas, check IP whitelist and credentials

---

## 📚 Additional Documentation

- `docs/architecture.md` - Detailed system architecture
- `docs/api-spec.md` - Complete REST API specification
- `docs/database-schema.md` - MongoDB schema with indexes and transactions
- `docs/user-stories.md` - Feature requirements and sprint planning
- `backend/README.md` - Backend setup and development guide
- `frontend/README.md` - Frontend setup and component guide

---

## 📊 Project Statistics

- **Total Files**: 35+ files
- **Total Lines of Code**: ~7,000+ lines
- **Backend**: ~2,800 lines (Python)
- **Frontend**: ~2,200 lines (JavaScript/React)
- **Documentation**: ~2,000 lines (Markdown)
- **Languages**: Python, JavaScript, HTML, CSS, Markdown
- **Frameworks**: Flask, React
- **Database**: MongoDB

---

## 🧪 Testing
(To be implemented)

## 📄 License
(To be determined)

## 👥 Team Members
(To be added)

## 📞 Contact
(To be added)

---

**Last Updated**: 2026-02-13  
**Status**: Initial architecture complete, ready for development