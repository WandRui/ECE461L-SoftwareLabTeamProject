# Hardware Lab Management System - Backend

Flask-based REST API backend for the Hardware Lab Management System.

## Getting Started

### Prerequisites
- Python 3.8 or higher
- MongoDB 4.4 or higher (running locally or remotely)
- pip (Python package manager)

### Installation

1. **Create a virtual environment** (recommended):
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment**:
   - Update `config.py` with your MongoDB connection string
   - Change the `SECRET_KEY` to a secure random value
   - For production, use environment variables instead of hardcoded values

4. **Start MongoDB**:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud) and update MONGO_URI in config.py
```

5. **Run the application**:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## Project Structure

```
backend/
├── app.py                  # Main Flask application with all API endpoints
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
│
├── database/              # Database modules
│   ├── __init__.py
│   ├── usersDB.py        # User management
│   ├── projectsDB.py     # Project management
│   └── hardwareDB.py     # Hardware inventory
│
├── models/                # Data models
│   ├── __init__.py
│   ├── user.py
│   ├── project.py
│   └── hardware.py
│
└── utils/                 # Utility functions
    ├── __init__.py
    ├── auth.py           # Authentication helpers
    └── validators.py     # Input validation
```

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout

### User Management
- `GET /get_user_projects_list` - Get user's projects

### Project Management
- `POST /create_project` - Create new project
- `POST /join_project` - Join existing project
- `GET /get_project_details/<project_id>` - Get project details

### Hardware Management
- `POST /create_hardware_set` - Create hardware set (admin)
- `GET /get_hardware_sets` - Get all hardware sets
- `GET /get_hardware_availability/<hw_name>` - Get hardware availability

### Hardware Operations
- `POST /check_out` - Check out hardware
- `POST /check_in` - Check in hardware

See `docs/api-spec.md` for detailed API documentation.

## Database Setup

### MongoDB Collections

The application uses three collections:
- `usersDB` - User accounts
- `projectsDB` - Project information
- `hardwareDB` - Hardware inventory

Collections are created automatically when first accessed.

### Initialize Indexes

To create database indexes for optimal performance:
```python
from database import usersDB, projectsDB, hardwareDB

usersDB.initialize_indexes()
projectsDB.initialize_indexes()
hardwareDB.initialize_indexes()
```

## Configuration

### Environment Variables

For production, use environment variables instead of hardcoding in `config.py`:

```bash
export MONGO_URI="mongodb://localhost:27017/"
export SECRET_KEY="your-secret-key-here"
export FLASK_ENV="production"
```

### Security Considerations

**Before deploying to production:**
1. Enable password hashing (uncomment bcrypt code in `usersDB.py`)
2. Use strong SECRET_KEY
3. Enable HTTPS
4. Implement rate limiting
5. Add CSRF protection
6. Set DEBUG=False

## Testing

```bash
# Install testing dependencies
pip install pytest pytest-flask

# Run tests (when implemented)
pytest
```

## Development

### Code Style

Follow PEP 8 style guide:
```bash
# Install development tools
pip install black flake8

# Format code
black .

# Check style
flake8 .
```

### Adding New Endpoints

1. Define route in `app.py`
2. Add database functions in appropriate module
3. Add validation in `utils/validators.py`
4. Update API documentation in `docs/api-spec.md`

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in `config.py`
- Verify network connectivity if using remote MongoDB

### Import Errors
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

### CORS Errors
- Frontend URL is in CORS_ORIGINS in `config.py`
- Check Flask-CORS configuration in `app.py`

## Production Deployment

### Using Gunicorn (WSGI Server)

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker (Future)

Create a `Dockerfile` and `docker-compose.yml` for containerized deployment.

## License

(To be determined)

## Contributors

(To be added)
