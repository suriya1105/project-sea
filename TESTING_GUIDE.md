# SeaTrace Phase 7 - Testing Guide

## Quick Start Testing

### 1. **Login with Password**
- URL: http://localhost:3000
- Admin User:
  - Email: `admin@seatrace.com`
  - Password: `admin123`
- Operator User:
  - Email: `operator@seatrace.com`
  - Password: `operator123`
- Viewer User:
  - Email: `viewer@seatrace.com`
  - Password: `viewer123`

**Expected**: Login page shows ocean-blue gradient background with wave animation, password field required

---

## 2. **Admin Panel Testing**

### Access Admin Panel
1. Login as admin@seatrace.com / admin123
2. Click ⚙️ **Admin Panel** tab (should appear for admin only)

### 3.1 **User Management**

#### Create New User
1. Fill form:
   - Email: `newuser@company.com`
   - Full Name: `John Smith`
   - Password: `secure123`
   - Company: `Ocean Shipping Co.`
   - Role: `Operator`
2. Click "✅ Create User"
3. **Expected**: Success message, user appears in "All System Users" list

#### List All Users
- Click 🔄 **Refresh** button
- **Expected**: 
  - Should show all 4-5 users
  - Each user shows email, name, company, role badge
  - Role badges color-coded (admin=red, operator=blue, viewer=green)

#### Delete User
1. Find user in list
2. Click 🗑️ **Delete**
3. **Expected**: Confirmation dialog, user removed from list

---

## 3. **Audit Logs Testing**

### View Audit Logs
1. Scroll to "📋 Audit Logs" section
2. Click 🔄 **Refresh**
3. **Expected**: 
   - Shows up to 100 recent logs
   - Columns: Timestamp, User Email, Action Type, Resource
   - Action badges with color coding

### Log Events to Look For
| Event | Trigger |
|-------|---------|
| LOGIN | Any user logs in |
| LOGIN_FAILED | Wrong password entered |
| VIEW | Click on Dashboard, Vessels, Oil Spills |
| CREATE_USER | Create new user in admin panel |
| DELETE_USER | Delete user in admin panel |
| UNAUTHORIZED_* | Non-admin tries to access admin endpoint |

### Example Audit Trail
```
2025-12-14 12:34:56 | admin@seatrace.com | LOGIN | authentication
2025-12-14 12:35:10 | admin@seatrace.com | VIEW | vessels_list
2025-12-14 12:35:45 | admin@seatrace.com | CREATE_USER | user_management
```

---

## 4. **Role-Based Access Control Testing**

### Admin User (admin@seatrace.com)
- ✅ Can see all 7 tabs (Dashboard, Map, Real-Time, Vessels, Spills, Reports, **Admin Panel**)
- ✅ Can manage users (create, view, delete)
- ✅ Can view audit logs
- ✅ Can modify vessel data (with restrictions)

### Operator User (operator@seatrace.com)
- ✅ Can see 6 tabs (Dashboard, Map, Real-Time, Vessels, Spills, Reports)
- ❌ Cannot see Admin Panel tab
- ❌ Cannot access /api/admin/* endpoints
- ✅ Can view vessel and spill data
- ✅ Can generate reports

### Viewer User (viewer@seatrace.com)
- ✅ Can see 3 tabs (Dashboard, Map, Real-Time)
- ❌ Cannot see Vessels, Spills, Reports tabs
- ❌ Cannot see Admin Panel
- ✅ Dashboard and map view only
- ❌ Cannot modify any data

---

## 5. **Company Information Display**

### Check Vessel Company Info
1. Go to **Vessels** tab
2. **Expected**: Each vessel card shows company name and logo
   - KMTC NEW YORK: Korea Merchant Marine Co.
   - ORIENTAL DIGNITY: Oriental Shipping Lines
   - MAERSK SEALAND: Maersk Line Ltd.
   - VALIANT LEADER: Global Maritime Inc.
   - SEA HARMONY: Harmony Shipping Ltd.

### Check Oil Spill Company Info
1. Go to **Oil Spills** tab
2. **Expected**: Each spill card shows:
   - Vessel name
   - Company name (if available)
   - Company logo (placeholder)

---

## 6. **Maritime Theme Validation**

### Login Page
- ✅ Ocean-blue gradient background (dark blue → nautical blue → light blue)
- ✅ Wave animation pattern at bottom
- ✅ White card with rounded corners
- ✅ Blue border on card
- ✅ Password field with 🔐 icon
- ✅ Responsive on mobile (card centered)

### Color Variables Used
```css
--ocean-dark: #0f172a (deep sea)
--ocean-blue: #064e89 (nautical)
--ocean-light: #1e88e5 (water)
--ocean-teal: #00897b (seafoam)
--wave-color: #42a5f5 (highlights)
```

---

## 7. **Backend API Testing** (Using curl/Postman)

### Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@seatrace.com",
    "password": "admin123"
  }'
```

**Expected Response**:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@seatrace.com",
    "role": "admin",
    "company": "SeaTrace Admin"
  }
}
```

### Test Create User Endpoint
```bash
curl -X POST http://localhost:5000/api/admin/users/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "email": "newuser@test.com",
    "name": "Test User",
    "password": "test123",
    "company": "Test Company",
    "role": "operator"
  }'
```

### Test Audit Logs Endpoint
```bash
curl -X GET http://localhost:5000/api/admin/audit-logs?limit=50 \
  -H "Authorization: Bearer <token>"
```

### Test User Audit Logs
```bash
curl -X GET http://localhost:5000/api/admin/audit-logs/user/admin@seatrace.com \
  -H "Authorization: Bearer <token>"
```

---

## 8. **Error Handling Tests**

### Non-Admin Tries to Create User
1. Login as operator@seatrace.com
2. Attempt to access /api/admin/users/register
3. **Expected**: 403 Forbidden error, access denied message

### Failed Login Attempt
1. Enter wrong password for admin@seatrace.com
2. **Expected**: 
   - Error message: "Invalid email or password"
   - Audit log shows "LOGIN_FAILED" event

### Delete Self
1. In admin panel, try to delete admin@seatrace.com (your own user)
2. **Expected**: Error message "Cannot delete yourself"

### Create User with Missing Fields
1. Leave some fields blank in user creation form
2. Click Create
3. **Expected**: "All fields are required" message

---

## 9. **Performance Checks**

### Admin Panel Load Time
- Click Admin Panel tab
- **Expected**: Loads in < 2 seconds
- Users list fetches and displays
- Audit logs load (up to 100 records)

### Audit Log Pagination
- Audit logs maintained in circular buffer
- Last 1000 logs kept in memory
- Older logs automatically purged
- API limit parameter: `/audit-logs?limit=50`

---

## 10. **Responsive Design Tests**

Test on these breakpoints:
- **Desktop** (1200px+): Two-column admin panel
- **Tablet** (768px-1024px): Single column admin panel
- **Mobile** (<768px): Full-width layout, stacked forms

---

## 11. **Key Features Checklist**

- ✅ Maritime login background with wave animation
- ✅ Password authentication required
- ✅ Demo credentials removed from UI
- ✅ Admin panel visible only to admins
- ✅ User creation form with all fields
- ✅ User management (list, delete)
- ✅ Company field in users
- ✅ Company names on vessels and spills
- ✅ Audit logging on all sensitive operations
- ✅ Role-based access control
- ✅ Admin-only endpoints with authorization
- ✅ Success/error messages
- ✅ Form validation
- ✅ Loading states
- ✅ Responsive design

---

## 12. **Troubleshooting**

### Admin Panel Not Showing
- **Check**: Logged in as admin (role='admin')
- **Check**: Token is valid and not expired
- **Check**: Frontend App.js has userRole state properly set

### Audit Logs Empty
- **Check**: Perform some actions (login, view vessels, etc.)
- **Check**: Logs show in chronological order (newest first)
- **Check**: Backend is logging correctly

### Company Names Not Showing
- **Check**: Vessels and oil_spills have company_name and company_logo fields
- **Check**: API response includes company information
- **Check**: Frontend is displaying company_name field

### Create User Button Disabled
- **Check**: All form fields are filled
- **Check**: Loading state (adminPanelLoading) is false
- **Check**: User creation request completed

---

## 13. **Browser Console Tests**

Open DevTools Console and check for:
- ✅ No JavaScript errors
- ✅ Proper API responses logged
- ✅ WebSocket connected successfully
- ✅ Form submissions logged with data

---

## Test Data for New Users

Use these for testing user creation:

```
Email: analyst1@maritime.com
Name: Sarah Anderson
Password: secure@123
Company: Pacific Shipping
Role: Operator

Email: monitor1@maritime.com
Name: David Chen
Password: secure@456
Company: Atlantic Logistics
Role: Viewer

Email: admin2@maritime.com
Name: Alice Brown
Password: admin@789
Company: Global Maritime Services
Role: Admin (will fail - admin creation restricted to current admin)
```

---

## Contact & Support

For issues or questions about the implementation:
- Check IMPLEMENTATION_SUMMARY.md for full feature details
- Review audit logs for access patterns
- Check browser console for JavaScript errors
- Verify backend is running: `python backend/app.py`
- Verify frontend is running: `npm start` in seatrace-frontend directory

---

**Last Updated**: 2025-12-14
**Version**: 1.0
**Status**: Ready for Testing ✅
