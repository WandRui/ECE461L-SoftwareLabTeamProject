# System Architecture Documentation

## Overview
This document provides a detailed explanation of the system architecture for the Hardware Lab Management System.

## Architecture Diagram

```
┌─────────┐
│  User   │
└────┬────┘
     │ Interacts with UI through
     │ clicking buttons and entering forms
     ▼
┌──────────────────┐
│  React Frontend  │  HTTP Requests (JSON)
│       UI         ├──────────────────────┐
└────────┬─────────┘                      │
         │                                 ▼
         │                      ┌──────────────────────┐
         │                      │   Flask Server       │  Function Calls
         │                      │     Backend          ├──────────────┐
         │ User Authentication  │                      │              │
         ▼                      └──────────────────────┘              ▼
┌──────────────┐                                          ┌──────────────────┐
│ Login Page   │                                          │     MongoDB      │
└──────┬───────┘                                          │    Database      │
       │                                                  └────────┬─────────┘
       │                                                           │
       │ User Authentication                                       │
       ▼                                                           │
┌──────────────┐                                                  │
│ Main Portal  │                                                  │
└──┬────────┬──┘                                                  │
   │        │                                                     │
   │        └─────────────────┐                                  │
   ▼                          ▼                                  │
┌──────────────┐      ┌────────────────────┐                    │
│ Project Page │      │ Hardware Inventory │                    │
│              │      │       Page         │                    │
└──────────────┘      └────────────────────┘                    │
        │                       │                                │
        │                       │ hardwareDB query               │
        │ projectsDB query      │                                │
        └───────────────────────┴────────────────────────────────┘
                                │ usersDB query
                                └──────────────────────────────────┘
```

## Component Interactions

### 1. User Authentication Flow
1. User enters credentials on Login Page
2. Frontend sends POST request to `/login`
3. Backend validates credentials using `usersDB.login()`
4. Session is created upon successful authentication
5. User is redirected to Main Portal

### 2. Project Management Flow
1. User navigates to Project Page
2. Frontend requests project list via `/get_user_projects_list`
3. Backend queries `projectsDB` for user's projects
4. Frontend displays projects
5. User can create new project or join existing:
   - Create: POST to `/create_project` → `projectsDB.createProject()`
   - Join: POST to `/join_project` → `projectsDB.addUser()`

### 3. Hardware Checkout Flow
1. User views hardware on Hardware Inventory Page
2. Frontend fetches hardware list via `/get_hardware_sets`
3. Backend queries `hardwareDB.getAllHwNames()`
4. User selects hardware and quantity to check out
5. Frontend sends POST to `/check_out`
6. Backend performs:
   - Validates availability: `hardwareDB.getAvailability()`
   - Updates inventory: `hardwareDB.requestSpace()`
   - Records checkout: `projectsDB.checkOutHW()`

### 4. Hardware Check-in Flow
1. User selects hardware to return
2. Frontend sends POST to `/check_in`
3. Backend performs:
   - Updates inventory: `hardwareDB.releaseSpace()`
   - Records return: `projectsDB.checkInHW()`

## Data Flow

### Request-Response Cycle
```
Frontend Component
    ↓ (API call via service layer)
Flask Route Handler
    ↓ (function call)
Database Module (usersDB/projectsDB/hardwareDB)
    ↓ (MongoDB query)
MongoDB Database
    ↑ (query result)
Database Module
    ↑ (processed data)
Flask Route Handler
    ↑ (JSON response)
Frontend Component
```

## Security Considerations

### Current Implementation
- Session-based authentication via Flask sessions
- Password storage (to be improved with hashing)

### Planned Improvements
- Implement bcrypt/argon2 password hashing
- Add CSRF protection
- Implement role-based access control (RBAC)
- Add rate limiting for API endpoints
- Implement JWT tokens for stateless authentication

## Scalability Considerations

### Current Architecture
- Monolithic Flask application
- Single MongoDB instance
- Session state stored in Flask

### Future Improvements
- Horizontal scaling of Flask instances
- MongoDB replica sets for high availability
- Redis for session management
- Load balancer for traffic distribution
- Microservices architecture for feature isolation

## Technology Choices

### Flask (Backend Framework)
- **Pros**: Lightweight, flexible, easy to learn, extensive ecosystem
- **Cons**: Not async by default, less structured than Django
- **Rationale**: Perfect for team projects, RESTful API development

### MongoDB (Database)
- **Pros**: Flexible schema, easy to modify, JSON-like documents
- **Cons**: Less structured than SQL, potential for data inconsistency
- **Rationale**: Rapid prototyping, flexible data models

### React (Frontend Framework)
- **Pros**: Component-based, large ecosystem, reusable components
- **Cons**: Steeper learning curve, requires build tooling
- **Rationale**: Industry-standard, excellent for SPAs

## Error Handling Strategy

### Backend
- Validate all inputs before database operations
- Return appropriate HTTP status codes
- Provide descriptive error messages
- Log errors for debugging

### Frontend
- Display user-friendly error messages
- Handle network failures gracefully
- Validate forms before submission
- Implement loading states

## Testing Strategy

### Backend Testing
- Unit tests for database modules
- Integration tests for API endpoints
- Test authentication flows
- Test concurrent hardware checkout scenarios

### Frontend Testing
- Component unit tests
- Integration tests for user flows
- End-to-end testing for critical paths
- Accessibility testing

## Deployment Architecture

### Development Environment
- Local MongoDB instance
- Flask development server
- React development server with hot reload

### Production Environment (Planned)
- Cloud-hosted MongoDB (MongoDB Atlas)
- WSGI server (Gunicorn) for Flask
- Nginx as reverse proxy
- Static React build served via CDN
- HTTPS enabled

## Monitoring and Logging

### Planned Implementation
- Application logging (Python logging module)
- Request/response logging
- Database query performance monitoring
- User activity tracking
- Error tracking and alerting
