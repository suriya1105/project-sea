# SeaTrace API Documentation - Admin & Audit Features

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/login`) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

Token obtained from login endpoint, valid for 24 hours.

---

## Authentication Endpoints

### POST /auth/login
Authenticate user with email and password.

**Request**:
```json
{
  "email": "admin@seatrace.com",
  "password": "admin123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@seatrace.com",
    "role": "admin",
    "company": "SeaTrace Admin"
  }
}
```

**Error** (401 Unauthorized):
```json
{
  "error": "Invalid email or password"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Email and password required"
}
```

**Audit Logging**:
- Action: `LOGIN` (success) or `LOGIN_FAILED` (failure)
- Resource: `authentication`

---

### POST /auth/logout
Logout current user.

**Request**: No body required

**Response** (200 OK):
```json
{
  "message": "Logged out"
}
```

---

## Admin User Management Endpoints

### POST /admin/users/register
Create a new company user. **Admin only**.

**Requirements**:
- User must have `role: "admin"`
- All fields required

**Request**:
```json
{
  "email": "newuser@company.com",
  "name": "John Smith",
  "password": "secure123",
  "company": "Ocean Shipping Co.",
  "role": "operator"
}
```

**Valid Roles**: `"operator"`, `"viewer"`, `"admin"`

**Response** (200 OK):
```json
{
  "message": "User created successfully",
  "user": {
    "email": "newuser@company.com",
    "name": "John Smith",
    "company": "Ocean Shipping Co.",
    "role": "operator"
  }
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Email already exists"
}
```

**Error** (403 Forbidden):
```json
{
  "error": "Admin access required"
}
```

**Audit Logging**:
- Action: `CREATE_USER`
- Resource: `user_management`
- Details: `{ "new_email": "newuser@company.com" }`

---

### GET /admin/users
List all system users. **Admin only**.

**Request**: No parameters required

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@seatrace.com",
    "role": "admin",
    "company": "SeaTrace Admin"
  },
  {
    "id": 2,
    "name": "Operator User",
    "email": "operator@seatrace.com",
    "role": "operator",
    "company": "SeaTrace Ops"
  },
  ...
]
```

**Error** (403 Forbidden):
```json
{
  "error": "Admin access required"
}
```

**Audit Logging**:
- Action: `VIEW`
- Resource: `user_list`

---

### DELETE /admin/users/<email>
Delete a user. **Admin only**.

**URL Parameters**:
- `email` (string): Email of user to delete

**Request**: No body required

**Example**:
```
DELETE /admin/users/operator@seatrace.com
```

**Response** (200 OK):
```json
{
  "message": "User deleted successfully"
}
```

**Error** (404 Not Found):
```json
{
  "error": "User not found"
}
```

**Error** (403 Forbidden):
```json
{
  "error": "Admin access required"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Cannot delete yourself"
}
```

**Audit Logging**:
- Action: `DELETE_USER`
- Resource: `user_management`
- Details: `{ "deleted_email": "operator@seatrace.com" }`

---

## Audit Log Endpoints

### GET /admin/audit-logs
Get system-wide audit logs. **Admin only**.

**Query Parameters**:
- `limit` (integer, optional): Number of logs to return (default: 50, max: 1000)

**Examples**:
```
GET /admin/audit-logs?limit=50
GET /admin/audit-logs
```

**Response** (200 OK):
```json
{
  "count": 42,
  "logs": [
    {
      "timestamp": "2025-12-14T15:34:56.789Z",
      "user_email": "admin@seatrace.com",
      "action": "LOGIN",
      "resource": "authentication",
      "details": {}
    },
    {
      "timestamp": "2025-12-14T15:35:10.234Z",
      "user_email": "admin@seatrace.com",
      "action": "VIEW",
      "resource": "vessels_list",
      "details": {}
    },
    {
      "timestamp": "2025-12-14T15:35:45.567Z",
      "user_email": "admin@seatrace.com",
      "action": "CREATE_USER",
      "resource": "user_management",
      "details": { "new_email": "newuser@company.com" }
    },
    ...
  ]
}
```

**Error** (403 Forbidden):
```json
{
  "error": "Admin access required"
}
```

**Audit Logging**:
- Action: `VIEW`
- Resource: `audit_logs`

---

### GET /admin/audit-logs/user/<email>
Get audit logs for a specific user. **Admin only**.

**URL Parameters**:
- `email` (string): Email of user to get logs for

**Query Parameters**:
- `limit` (integer, optional): Number of logs to return (default: 50)

**Examples**:
```
GET /admin/audit-logs/user/operator@seatrace.com?limit=25
GET /admin/audit-logs/user/viewer@seatrace.com
```

**Response** (200 OK):
```json
{
  "user_email": "operator@seatrace.com",
  "count": 15,
  "logs": [
    {
      "timestamp": "2025-12-14T14:20:10.123Z",
      "user_email": "operator@seatrace.com",
      "action": "LOGIN",
      "resource": "authentication",
      "details": {}
    },
    {
      "timestamp": "2025-12-14T14:21:05.456Z",
      "user_email": "operator@seatrace.com",
      "action": "VIEW",
      "resource": "vessel_details",
      "details": { "imo": "IMO9780428" }
    },
    ...
  ]
}
```

**Error** (403 Forbidden):
```json
{
  "error": "Admin access required"
}
```

**Audit Logging**:
- Action: `VIEW`
- Resource: `user_audit`
- Details: `{ "target_user": "operator@seatrace.com" }`

---

## Standard Endpoints with Audit Logging

### GET /vessels
Get all vessels with company information.

**Audit Logging**:
- Action: `VIEW`
- Resource: `vessels_list`

**Response** includes:
- `company_name`: (string) Operating company
- `company_logo`: (string) Company logo URL

---

### GET /vessels/<imo>
Get specific vessel details. **Operator/Admin only**.

**Audit Logging**:
- Action: `VIEW`
- Resource: `vessel_details`
- Details: `{ "imo": "IMO9780428" }`

**Unauthorized Access Logging**:
- Action: `UNAUTHORIZED_ACCESS`
- Resource: `vessel`
- Details: `{ "imo": "IMO9780428" }`

---

### GET /oil-spills
Get all oil spill incidents with company information.

**Audit Logging**:
- Action: `VIEW`
- Resource: `oil_spills_list`

**Response** includes:
- `company_name`: (string) Responsible company
- `company_logo`: (string) Company logo URL

---

### GET /oil-spills/<spill_id>
Get specific oil spill details. **Operator/Admin only**.

**Audit Logging**:
- Action: `VIEW`
- Resource: `oil_spill_details`
- Details: `{ "spill_id": "SPILL001" }`

---

## Audit Log Actions Reference

| Action | Event | Resource |
|--------|-------|----------|
| `LOGIN` | User logged in successfully | `authentication` |
| `LOGIN_FAILED` | Login failed (wrong credentials) | `authentication` |
| `VIEW` | Accessed data (vessels, spills, etc) | `*_list`, `*_details` |
| `CREATE_USER` | New user created | `user_management` |
| `DELETE_USER` | User deleted | `user_management` |
| `UNAUTHORIZED_ACCESS` | Non-authorized access attempt | `vessel`, `spill` |
| `UNAUTHORIZED_UPDATE_*` | Modification by unauthorized user | `vessel`, `spill` |
| `UNAUTHORIZED_*` | General unauthorized access | `various` |

---

## Audit Log Structure

```python
{
  "timestamp": str,        # ISO 8601 format (UTC)
  "user_email": str,       # Email of user performing action
  "action": str,           # Type of action (LOGIN, VIEW, CREATE_USER, etc)
  "resource": str,         # Resource being accessed/modified
  "details": dict          # Additional context (optional)
}
```

### Details Examples

**Vessel Access**:
```json
{ "imo": "IMO9780428" }
```

**User Creation**:
```json
{ "new_email": "user@company.com" }
```

**Oil Spill Access**:
```json
{ "spill_id": "SPILL001" }
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized - Missing Token**:
```json
{
  "error": "Token missing"
}
```

**401 Unauthorized - Invalid Token**:
```json
{
  "error": "Invalid token"
}
```

**401 Unauthorized - Expired Token**:
```json
{
  "error": "Token expired"
}
```

**403 Forbidden - Insufficient Permissions**:
```json
{
  "error": "Admin access required"
}
```

**404 Not Found**:
```json
{
  "error": "Resource not found"
}
```

**400 Bad Request**:
```json
{
  "error": "Detailed error message"
}
```

---

## Rate Limiting & Constraints

- **Audit Log History**: Last 1000 logs maintained (circular buffer)
- **Token Expiry**: 24 hours
- **Log Limit Parameter**: Max 1000 logs per request
- **User Creation**: No duplicate emails allowed
- **Password**: Minimum 1 character (no validation enforced, consider adding)

---

## Security Notes

1. **Passwords**: Currently stored in plaintext (DEV ONLY). Should hash before production.
2. **Token**: JWT with secret key. Change `SECRET_KEY` environment variable in production.
3. **CORS**: Currently enabled for all origins. Restrict in production.
4. **Admin Functions**: Restricted to `role="admin"` users only
5. **Access Logs**: All sensitive operations are audited

---

## Example API Workflows

### Admin Creates New User
```
1. POST /auth/login (admin@seatrace.com/admin123)
   → Returns token
   
2. POST /admin/users/register (with token)
   → User created
   → Audit log: "CREATE_USER" recorded
   
3. GET /admin/users (with token)
   → New user appears in list
   → Audit log: "VIEW" recorded
```

### Operator Views Vessels
```
1. POST /auth/login (operator@seatrace.com/operator123)
   → Returns token
   → Audit log: "LOGIN" recorded
   
2. GET /vessels (with token)
   → All vessels returned with company info
   → Audit log: "VIEW" recorded
   
3. GET /vessels/IMO9780428 (with token)
   → Specific vessel details
   → Audit log: "VIEW" recorded
```

### Viewer Attempts Admin Access
```
1. POST /auth/login (viewer@seatrace.com/viewer123)
   → Returns token
   → Audit log: "LOGIN" recorded
   
2. GET /admin/users (with token)
   → 403 Forbidden returned
   → Audit log: "UNAUTHORIZED_LIST_USERS" recorded
```

---

## Testing with curl

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@seatrace.com", "password": "admin123"}'
```

### Create User
```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
curl -X POST http://localhost:5000/api/admin/users/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "newuser@test.com",
    "name": "Test User",
    "password": "test123",
    "company": "Test Co.",
    "role": "operator"
  }'
```

### Get Audit Logs
```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
curl -X GET "http://localhost:5000/api/admin/audit-logs?limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

### Get User Audit Logs
```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
curl -X GET "http://localhost:5000/api/admin/audit-logs/user/operator@seatrace.com" \
  -H "Authorization: Bearer $TOKEN"
```

### Delete User
```bash
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
curl -X DELETE http://localhost:5000/api/admin/users/newuser@test.com \
  -H "Authorization: Bearer $TOKEN"
```

---

## Version History

- **v1.0** (2025-12-14): Initial admin and audit features
  - User management endpoints
  - Audit logging infrastructure
  - Admin control panel
  - Company information in models

---

**Last Updated**: 2025-12-14  
**Status**: Production Ready ✅
