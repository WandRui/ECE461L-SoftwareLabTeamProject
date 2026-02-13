# Database Schema Documentation

## Overview
This document describes the MongoDB database schema for the Hardware Lab Management System.

## Database: hardware_lab_system

---

## Collection: usersDB

### Purpose
Stores user account information and authentication credentials.

### Schema

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  username: String,                 // Unique username (primary identifier)
  password: String,                 // Password (to be hashed in production)
  email: String,                    // Optional email address
  role: String,                     // User role: "admin" or "user" (default: "user")
  projects: [String],               // Array of project IDs user is member of
  created_at: Date,                 // Account creation timestamp
  last_login: Date                  // Last login timestamp
}
```

### Indexes

```javascript
// Unique index on username
db.usersDB.createIndex({ "username": 1 }, { unique: true })

// Optional: Index on email for faster lookups
db.usersDB.createIndex({ "email": 1 })
```

### Example Document

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "john_doe",
  "password": "$2b$12$KIX...",  // bcrypt hashed password
  "email": "john@example.com",
  "role": "user",
  "projects": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ],
  "created_at": ISODate("2026-02-10T14:30:00Z"),
  "last_login": ISODate("2026-02-13T09:15:00Z")
}
```

### Validation Rules

- `username`: Required, unique, 3-50 characters, alphanumeric and underscore only
- `password`: Required, minimum 8 characters (before hashing)
- `email`: Optional, must be valid email format
- `role`: Must be "admin" or "user"
- `projects`: Array of valid ObjectId strings

---

## Collection: projectsDB

### Purpose
Stores project information, team membership, and hardware checkout records.

### Schema

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  name: String,                     // Project name (unique)
  description: String,              // Project description
  owner: String,                    // Username of project creator
  members: [String],                // Array of usernames (including owner)
  hardware_checkouts: [             // Array of checked out hardware
    {
      hw_name: String,              // Hardware set name
      quantity: Number,             // Quantity checked out
      checked_out_at: Date,         // Checkout timestamp
      checked_out_by: String        // Username who checked out
    }
  ],
  created_at: Date,                 // Project creation timestamp
  updated_at: Date                  // Last modification timestamp
}
```

### Indexes

```javascript
// Unique index on project name
db.projectsDB.createIndex({ "name": 1 }, { unique: true })

// Index on owner for faster queries
db.projectsDB.createIndex({ "owner": 1 })

// Index on members for membership queries
db.projectsDB.createIndex({ "members": 1 })

// Compound index for hardware checkout queries
db.projectsDB.createIndex({ "_id": 1, "hardware_checkouts.hw_name": 1 })
```

### Example Document

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "name": "IoT Sensor Project",
  "description": "Building temperature and humidity sensors for campus buildings",
  "owner": "john_doe",
  "members": ["john_doe", "jane_smith", "bob_wilson"],
  "hardware_checkouts": [
    {
      "hw_name": "Arduino Uno",
      "quantity": 5,
      "checked_out_at": ISODate("2026-02-12T10:30:00Z"),
      "checked_out_by": "john_doe"
    },
    {
      "hw_name": "DHT22 Sensors",
      "quantity": 10,
      "checked_out_at": ISODate("2026-02-12T10:35:00Z"),
      "checked_out_by": "jane_smith"
    }
  ],
  "created_at": ISODate("2026-02-10T14:30:00Z"),
  "updated_at": ISODate("2026-02-12T10:35:00Z")
}
```

### Validation Rules

- `name`: Required, unique, 3-100 characters
- `description`: Optional, max 500 characters
- `owner`: Required, must be valid username
- `members`: Must include owner, all must be valid usernames
- `hardware_checkouts.quantity`: Must be positive integer

---

## Collection: hardwareDB

### Purpose
Stores hardware inventory sets with capacity and availability tracking.

### Schema

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  hw_name: String,                  // Hardware set name (unique)
  description: String,              // Hardware description
  total_capacity: Number,           // Total units available
  available: Number,                // Currently available units
  checked_out: Number,              // Currently checked out units
  category: String,                 // Hardware category (e.g., "Microcontroller", "Sensor")
  location: String,                 // Physical storage location
  created_at: Date,                 // Record creation timestamp
  updated_at: Date                  // Last update timestamp
}
```

### Indexes

```javascript
// Unique index on hardware name
db.hardwareDB.createIndex({ "hw_name": 1 }, { unique: true })

// Index on category for filtering
db.hardwareDB.createIndex({ "category": 1 })

// Index on availability for quick checks
db.hardwareDB.createIndex({ "available": 1 })
```

### Example Document

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439020"),
  "hw_name": "Arduino Uno",
  "description": "Arduino Uno Rev3 microcontroller board",
  "total_capacity": 50,
  "available": 35,
  "checked_out": 15,
  "category": "Microcontroller",
  "location": "Lab Room 201, Cabinet A",
  "created_at": ISODate("2026-02-08T09:00:00Z"),
  "updated_at": ISODate("2026-02-12T10:30:00Z")
}
```

### Validation Rules

- `hw_name`: Required, unique, 3-100 characters
- `description`: Optional, max 500 characters
- `total_capacity`: Required, positive integer, max 10000
- `available`: Must be >= 0 and <= total_capacity
- `checked_out`: Must be >= 0 and <= total_capacity
- Invariant: `available + checked_out = total_capacity`

---

## Database Operations

### Common Queries

#### Find user by username
```javascript
db.usersDB.findOne({ username: "john_doe" })
```

#### Get all projects for a user
```javascript
db.projectsDB.find({ members: "john_doe" })
```

#### Get available hardware
```javascript
db.hardwareDB.find({ available: { $gt: 0 } })
```

#### Get project hardware checkouts
```javascript
db.projectsDB.findOne(
  { _id: ObjectId("507f1f77bcf86cd799439012") },
  { hardware_checkouts: 1 }
)
```

### Transaction Examples

#### Hardware Checkout (Atomic Operation)
```javascript
// Start session for transaction
const session = client.startSession();

try {
  session.startTransaction();
  
  // 1. Check hardware availability
  const hardware = await db.hardwareDB.findOne(
    { hw_name: "Arduino Uno" },
    { session }
  );
  
  if (hardware.available < requestedQty) {
    throw new Error("Insufficient hardware available");
  }
  
  // 2. Update hardware availability
  await db.hardwareDB.updateOne(
    { hw_name: "Arduino Uno" },
    {
      $inc: { available: -requestedQty, checked_out: requestedQty },
      $set: { updated_at: new Date() }
    },
    { session }
  );
  
  // 3. Add checkout record to project
  await db.projectsDB.updateOne(
    { _id: projectId },
    {
      $push: {
        hardware_checkouts: {
          hw_name: "Arduino Uno",
          quantity: requestedQty,
          checked_out_at: new Date(),
          checked_out_by: username
        }
      },
      $set: { updated_at: new Date() }
    },
    { session }
  );
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

#### Hardware Check-in (Atomic Operation)
```javascript
const session = client.startSession();

try {
  session.startTransaction();
  
  // 1. Update hardware availability
  await db.hardwareDB.updateOne(
    { hw_name: "Arduino Uno" },
    {
      $inc: { available: returnQty, checked_out: -returnQty },
      $set: { updated_at: new Date() }
    },
    { session }
  );
  
  // 2. Update project checkout record
  await db.projectsDB.updateOne(
    {
      _id: projectId,
      "hardware_checkouts.hw_name": "Arduino Uno"
    },
    {
      $inc: { "hardware_checkouts.$.quantity": -returnQty },
      $set: { updated_at: new Date() }
    },
    { session }
  );
  
  // 3. Remove checkout record if quantity is 0
  await db.projectsDB.updateOne(
    { _id: projectId },
    {
      $pull: {
        hardware_checkouts: { quantity: { $lte: 0 } }
      }
    },
    { session }
  );
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## Data Integrity

### Constraints

1. **Username Uniqueness**: Each username must be unique across the system
2. **Project Name Uniqueness**: Each project name must be unique
3. **Hardware Name Uniqueness**: Each hardware set name must be unique
4. **Availability Constraint**: `hardware.available + hardware.checked_out = hardware.total_capacity`
5. **Project Owner**: Project owner must always be in members array
6. **Valid References**: All usernames in projects must exist in usersDB

### Referential Integrity

Since MongoDB doesn't enforce foreign key constraints, the application must ensure:
- Users referenced in projects exist
- Projects referenced in user documents exist
- Hardware sets referenced in project checkouts exist

### Audit Trail

Consider adding an audit collection for tracking:
- Hardware checkout/check-in history
- Project membership changes
- User login/logout events
- Administrative actions

```javascript
// Optional: auditDB collection
{
  _id: ObjectId,
  action: String,              // "checkout", "checkin", "login", etc.
  user: String,
  target: String,              // Project ID, Hardware name, etc.
  details: Object,             // Action-specific details
  timestamp: Date,
  ip_address: String
}
```

---

## Performance Considerations

### Indexing Strategy
- Index frequently queried fields (username, project name, hardware name)
- Use compound indexes for common query patterns
- Monitor index usage with `db.collection.explain()`

### Denormalization
- User projects array duplicates data but improves query performance
- Consider caching frequently accessed data in application layer

### Sharding Strategy (Future)
If the system scales to many users/projects:
- Shard `usersDB` by `username` hash
- Shard `projectsDB` by `_id` hash
- Keep `hardwareDB` unsharded (relatively small)

---

## Backup and Recovery

### Backup Strategy
- Daily full backups
- Point-in-time recovery with oplog
- Regular backup testing

### Recovery Procedures
1. Restore from latest backup
2. Replay oplog to recover recent changes
3. Validate data integrity after restore

---

## Migration Scripts

When schema changes are needed, create migration scripts:

```javascript
// Example: Add email field to existing users
db.usersDB.updateMany(
  { email: { $exists: false } },
  { $set: { email: "" } }
)

// Example: Add category to hardware sets
db.hardwareDB.updateMany(
  { category: { $exists: false } },
  { $set: { category: "Uncategorized" } }
)
```
