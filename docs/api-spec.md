# REST API Specification

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints except `/login` and `/register` require an active session.

---

## Authentication Endpoints

### POST /register
Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "username": "string"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or username already exists
- `500 Internal Server Error` - Server error

---

### POST /login
Authenticate user and create session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "username": "string",
  "projects": ["project_id1", "project_id2"]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing required fields

---

### POST /logout
End user session.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Management Endpoints

### GET /get_user_projects_list
Get list of projects for authenticated user.

**Headers:**
```
Cookie: session=<session_id>
```

**Response (200):**
```json
{
  "success": true,
  "projects": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "role": "owner" | "member"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

## Project Management Endpoints

### POST /create_project
Create a new project.

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "project_id": "string"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or project name exists
- `401 Unauthorized` - Not authenticated

---

### POST /join_project
Join an existing project.

**Request Body:**
```json
{
  "project_id": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully joined project",
  "project": {
    "id": "string",
    "name": "string",
    "description": "string"
  }
}
```

**Error Responses:**
- `404 Not Found` - Project doesn't exist
- `400 Bad Request` - Already a member
- `401 Unauthorized` - Not authenticated

---

### GET /get_project_details/:project_id
Get detailed information about a project.

**URL Parameters:**
- `project_id` - Project identifier

**Response (200):**
```json
{
  "success": true,
  "project": {
    "id": "string",
    "name": "string",
    "description": "string",
    "owner": "string",
    "members": ["username1", "username2"],
    "hardware_checkouts": [
      {
        "hw_name": "string",
        "quantity": 5,
        "checked_out_at": "2026-02-13T10:30:00Z"
      }
    ],
    "created_at": "2026-02-10T14:20:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Project doesn't exist
- `403 Forbidden` - Not a project member
- `401 Unauthorized` - Not authenticated

---

## Hardware Management Endpoints

### POST /create_hardware_set
Create a new hardware set (admin only).

**Request Body:**
```json
{
  "hw_name": "string",
  "total_capacity": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Hardware set created successfully",
  "hw_name": "string",
  "total_capacity": 100,
  "available": 100
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or hardware already exists
- `403 Forbidden` - Not authorized (admin only)
- `401 Unauthorized` - Not authenticated

---

### GET /get_hardware_sets
Get all hardware sets with availability.

**Response (200):**
```json
{
  "success": true,
  "hardware_sets": [
    {
      "hw_name": "string",
      "total_capacity": 100,
      "available": 75,
      "checked_out": 25
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

### GET /get_hardware_availability/:hw_name
Get availability for a specific hardware set.

**URL Parameters:**
- `hw_name` - Hardware identifier

**Response (200):**
```json
{
  "success": true,
  "hw_name": "string",
  "total_capacity": 100,
  "available": 75,
  "checked_out": 25
}
```

**Error Responses:**
- `404 Not Found` - Hardware set doesn't exist
- `401 Unauthorized` - Not authenticated

---

## Hardware Checkout/Check-in Endpoints

### POST /check_out
Check out hardware for a project.

**Request Body:**
```json
{
  "project_id": "string",
  "hw_name": "string",
  "quantity": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Hardware checked out successfully",
  "checkout": {
    "hw_name": "string",
    "quantity": 5,
    "remaining_available": 70,
    "checked_out_at": "2026-02-13T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Insufficient hardware available
- `403 Forbidden` - Not a project member
- `404 Not Found` - Project or hardware doesn't exist
- `401 Unauthorized` - Not authenticated

---

### POST /check_in
Return hardware to inventory.

**Request Body:**
```json
{
  "project_id": "string",
  "hw_name": "string",
  "quantity": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Hardware checked in successfully",
  "checkin": {
    "hw_name": "string",
    "quantity": 5,
    "available": 75
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid quantity or not checked out
- `403 Forbidden` - Not a project member
- `404 Not Found` - Project or hardware doesn't exist
- `401 Unauthorized` - Not authenticated

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input or business logic error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

## Rate Limiting
(To be implemented)

## Versioning
Current version: v1
Future versions will use URL versioning: `/api/v2/...`
