# Admin Panel Setup Guide

## Overview
The admin panel has been fully integrated into the RoomNest application with both frontend and backend components. The admin user has been created with specific credentials.

## Admin Credentials
- **Email**: `bursekaushal4@gmail.com`
- **Password**: `kaushal@2004`
- **Role**: `admin`
- **Phone**: `9999999999`
- **Name**: Kaushal Burse

## Backend Changes

### 1. Updated Models
- **User Model** (`backend/models/User.js`):
  - Added `blocked` field (boolean) to support user blocking
  - Updated role enum to include `'admin'` alongside `'student'` and `'owner'`

- **Room Model** (`backend/models/Room.js`):
  - Added `status` field (enum: `'pending'`, `'approved'`, `'rejected'`) for room approval workflow
  - Added `rejectionReason` field (string) to store room rejection reasons

- **Review Model** (`backend/models/Review.js`):
  - Added `status` field (enum: `'published'`, `'flagged'`) for review moderation

### 2. Middleware Updates
- **Auth Middleware** (`backend/middleware/auth.js`):
  - Split into two functions: `authMiddleware` and `adminOnlyMiddleware`
  - `adminOnlyMiddleware` checks if user role is `'admin'` and denies access otherwise
  - Both are exported as named exports

### 3. New Admin Controller
**File**: `backend/controllers/adminController.js`

**Endpoints**:

#### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics
  - Returns: totalUsers, totalRooms, totalReviews, totalConnections, pendingApprovals

#### Users Management
- `GET /api/admin/users` - Get all users (with optional filtering)
  - Query: `role` (student/owner/admin), `status` (active/blocked)
- `PUT /api/admin/users/:userId/status` - Update user status (block/unblock)
  - Body: `{ status: "active" | "blocked" }`
- `DELETE /api/admin/users/:userId` - Delete user (cascades to delete their rooms/reviews/connections)

#### Rooms Management
- `GET /api/admin/rooms` - Get all rooms (with optional filtering)
  - Query: `status` (pending/approved/rejected)
- `PUT /api/admin/rooms/:roomId/approve` - Approve a room
- `PUT /api/admin/rooms/:roomId/reject` - Reject a room
  - Body: `{ reason: "rejection reason" }`
- `DELETE /api/admin/rooms/:roomId` - Delete a room (cascades to delete reviews/connections)

#### Reviews Management
- `GET /api/admin/reviews` - Get all reviews (with optional filtering)
- `PUT /api/admin/reviews/:reviewId/status` - Flag/unflag review
  - Body: `{ status: "published" | "flagged" }`
- `DELETE /api/admin/reviews/:reviewId` - Delete a review

#### Connections Management
- `GET /api/admin/connections` - Get all connections (with optional filtering)
  - Query: `status` (pending/accepted/rejected)
- `PUT /api/admin/connections/:connectionId/status` - Update connection status
  - Body: `{ status: "pending" | "accepted" | "rejected" }`
- `DELETE /api/admin/connections/:connectionId` - Delete a connection

### 4. Admin Routes
**File**: `backend/routes/adminRoutes.js`
- All routes require JWT authentication AND admin role verification
- Middleware chain: `authMiddleware` → `adminOnlyMiddleware`

### 5. Server Registration
**File**: `backend/server.js`
- Admin routes registered at `/api/admin`
- Imported and mounted along with other routes

### 6. Seed Script
**File**: `backend/seed.js`
- Creates initial admin user if not already exists
- Username: `bursekaushal4@gmail.com`
- Password: `kaushal@2004` (hashed with bcrypt)
- **Status**: Already executed - admin user created in database

## Frontend Changes

### 1. Frontend API Integration
**File**: `frontend/src/api.js`

Added new `adminAPI` object with methods:
```javascript
export const adminAPI = {
    // Dashboard
    getDashboardStats: () => apiClient.get('/admin/stats'),
    
    // Users Management
    getAllUsers: (params) => apiClient.get('/admin/users', { params }),
    updateUserStatus: (userId, status) => apiClient.put(`/admin/users/${userId}/status`, { status }),
    deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
    
    // Rooms Management
    getAllRooms: (params) => apiClient.get('/admin/rooms', { params }),
    approveRoom: (roomId) => apiClient.put(`/admin/rooms/${roomId}/approve`),
    rejectRoom: (roomId, reason) => apiClient.put(`/admin/rooms/${roomId}/reject`, { reason }),
    deleteRoom: (roomId) => apiClient.delete(`/admin/rooms/${roomId}`),
    
    // Reviews Management
    getAllReviews: (params) => apiClient.get('/admin/reviews', { params }),
    updateReviewStatus: (reviewId, status) => apiClient.put(`/admin/reviews/${reviewId}/status`, { status }),
    deleteReview: (reviewId) => apiClient.delete(`/admin/reviews/${reviewId}`),
    
    // Connections Management
    getAllConnections: (params) => apiClient.get('/admin/connections', { params }),
    updateConnectionStatus: (connectionId, status) => apiClient.put(`/admin/connections/${connectionId}/status`, { status }),
    deleteConnection: (connectionId) => apiClient.delete(`/admin/connections/${connectionId}`),
};
```

### 2. Admin Pages - Updated to Use Real API
All admin pages now fetch real data from backend:

- **AdminDashboardPage** (`frontend/src/pages/AdminDashboardPage.jsx`)
  - Calls `adminAPI.getDashboardStats()`
  - Displays: Total Rooms, Total Users, Total Connections, Total Reviews, Pending Approvals
  - Includes quick action links to management pages

- **AdminRoomsPage** (`frontend/src/pages/AdminRoomsPage.jsx`)
  - Calls `adminAPI.getAllRooms()`
  - Can filter by status: all, pending, approved, rejected
  - Actions: Approve, Reject, Delete rooms

- **AdminUsersPage** (`frontend/src/pages/AdminUsersPage.jsx`)
  - Calls `adminAPI.getAllUsers()`
  - Can filter by status (active/blocked) or role (student/owner)
  - Actions: Block/Unblock, Delete users
  - Displays: First Name, Last Name, Email, Role, Status

- **AdminReviewsPage** (`frontend/src/pages/AdminReviewsPage.jsx`)
  - Calls `adminAPI.getAllReviews()`
  - Can filter by status: all, published, flagged
  - Actions: Flag/Unflag, Delete reviews

- **AdminConnectionsPage** (`frontend/src/pages/AdminConnectionsPage.jsx`)
  - Calls `adminAPI.getAllConnections()`
  - Can filter by status: all, pending, accepted, rejected
  - Actions: Accept, Reject, Delete connections

### 3. Navigation Updates
**File**: `frontend/src/components/Header.jsx`
- Added "Admin Panel" link that appears only for admin users
- Links to `/admin` route
- Available on both desktop and mobile menus

### 4. Routing Updates
**File**: `frontend/src/App.jsx`
- Added 5 protected admin routes
- Routes are protected with `AdminRoute` wrapper that checks user role
- Routes:
  - `/admin` - AdminDashboardPage
  - `/admin/rooms` - AdminRoomsPage
  - `/admin/users` - AdminUsersPage
  - `/admin/reviews` - AdminReviewsPage
  - `/admin/connections` - AdminConnectionsPage

## Testing the Admin Panel

### Step 1: Start Backend
```bash
cd backend
npm install  # if not already done
npm run dev  # or npm start
```

MongoDB should be running (local or Atlas URI in `.env`)

### Step 2: Start Frontend
```bash
cd frontend
npm start
# or
python -m http.server 8000
```

### Step 3: Login as Admin
1. Go to login page
2. Enter credentials:
   - **Email**: `bursekaushal4@gmail.com`
   - **Password**: `kaushal@2004`
3. After login, click "Admin Panel" in navigation
4. You should see the admin dashboard

### Step 4: Test Features

#### Dashboard
- View statistics for all resources
- See pending room approvals count

#### Rooms Management
- View all rooms with their status
- Filter by pending/approved/rejected
- Approve new rooms
- Reject rooms (with reason)
- Delete rooms

#### Users Management
- View all registered users
- Filter by role (student/owner) or status (active/blocked)
- Block/Unblock users
- Delete users (cascades to remove their data)

#### Reviews Management
- View all reviews across the platform
- Flag inappropriate reviews
- Unflag flagged reviews
- Delete reviews

#### Connections Management
- View all rental connections
- Filter by status (pending/accepted/rejected)
- Accept or reject connections
- Delete connections

## Important Notes

### Cascading Deletes
When a user is deleted via admin panel:
- All their rooms are deleted
- All their reviews (as reviewer and owner) are deleted
- All their connections (as student and owner) are deleted

When a room is deleted:
- All its reviews are deleted
- All its connections are deleted

### Field Mapping
Backend models use these field names:
- Room: `owner` (not `ownerId`)
- Connection: `student`, `owner`, `room` (not `studentId`, `ownerId`, `roomId`)
- Review: `reviewer`, `room` (not `userId`, `roomId`)

### Status Fields
- Room: `'pending'`, `'approved'`, `'rejected'`
- Review: `'published'`, `'flagged'`
- Connection: `'pending'`, `'accepted'`, `'rejected'`, `'cancelled'`

## Troubleshooting

### Admin can't access admin panel
- Check if user role is `'admin'` in database
- Verify JWT token is being sent in Authorization header
- Check browser console for errors

### API calls returning 403 Forbidden
- Ensure JWT token is valid and not expired
- Verify user role is `'admin'`
- Check that adminOnlyMiddleware is properly checking role

### 404 errors on admin endpoints
- Verify backend is running on `http://localhost:5000`
- Check that adminRoutes are registered in server.js at `/api/admin`
- Verify API_BASE_URL in frontend api.js is correct

### Data not loading
- Check browser network tab for API errors
- Verify MongoDB is connected and has data
- Check backend logs for database query errors

## Database Structure for Admin Features

### Users
```
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  password: String (hashed),
  phone: String,
  role: String ('student', 'owner', 'admin'),
  blocked: Boolean (default: false),
  ...otherFields
}
```

### Rooms
```
{
  _id: ObjectId,
  title: String,
  owner: ObjectId (ref: User),
  status: String ('pending', 'approved', 'rejected'),
  rejectionReason: String (optional),
  ...otherFields
}
```

### Reviews
```
{
  _id: ObjectId,
  room: ObjectId (ref: Room),
  reviewer: ObjectId (ref: User),
  owner: ObjectId (ref: User),
  rating: Number,
  status: String ('published', 'flagged'),
  ...otherFields
}
```

### Connections
```
{
  _id: ObjectId,
  room: ObjectId (ref: Room),
  student: ObjectId (ref: User),
  owner: ObjectId (ref: User),
  status: String ('pending', 'accepted', 'rejected', 'cancelled'),
  ...otherFields
}
```

## Summary

The admin panel is now fully functional with:
- ✅ Secure admin authentication
- ✅ Dashboard with system statistics
- ✅ User management (view, block, delete)
- ✅ Room approval workflow
- ✅ Review moderation
- ✅ Connection management
- ✅ Role-based access control
- ✅ Cascading deletes for data integrity
- ✅ Real-time API integration
