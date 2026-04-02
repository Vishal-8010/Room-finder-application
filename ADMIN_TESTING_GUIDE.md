# Admin Panel Testing Quick Reference

## Admin Login Credentials
```
Email:    bursekaushal4@gmail.com
Password: kaushal@2004
```

## Quick Test Checklist

### Prerequisites
- [ ] Backend server running: `npm run dev` in `backend/`
- [ ] MongoDB running locally or Atlas URI configured
- [ ] Frontend running: `python -m http.server 8000` or `npm start`
- [ ] Browser at `http://localhost:8000` (frontend) or `http://localhost:3000` (React)

### Login & Navigation
- [ ] Go to login page
- [ ] Enter admin credentials above
- [ ] Click login
- [ ] Should see "Admin Panel" link in header navigation
- [ ] Click "Admin Panel" to go to dashboard

### Dashboard Page (/admin)
- [ ] Page loads without errors
- [ ] See 5 stat cards: Total Rooms, Total Users, Total Connections, Total Reviews, Pending Approvals
- [ ] Stats show actual numbers from database
- [ ] 4 quick action buttons: Manage Rooms, Manage Users, Manage Reviews, Manage Connections
- [ ] Each button navigates to respective management page

### Rooms Management (/admin/rooms)
- [ ] Page loads and shows list of rooms (if any exist)
- [ ] Filtering works: all, pending, approved, rejected
- [ ] For each room can see: title, status, owner name, actions
- [ ] Approve button changes status to "approved"
- [ ] Reject button shows form for rejection reason
- [ ] Delete button removes room

### Users Management (/admin/users)
- [ ] Page loads and shows list of users
- [ ] Filtering works: all, active, blocked, student, owner
- [ ] For each user can see: first name, last name, email, role, status
- [ ] Lock icon blocks user (status → "Blocked")
- [ ] Unlock icon unblocks user (status → "Active")
- [ ] Delete button removes user

### Reviews Management (/admin/reviews)
- [ ] Page loads and shows reviews (if any exist)
- [ ] Filtering works: all, published, flagged
- [ ] For each review can see: author, rating, text, status
- [ ] Flag icon flags review (status → "flagged")
- [ ] Flag again unflag it (status → "published")
- [ ] Delete button removes review

### Connections Management (/admin/connections)
- [ ] Page loads and shows rental connections (if any exist)
- [ ] Filtering works: all, pending, accepted, rejected
- [ ] For each connection can see: student name, owner name, room title, status
- [ ] Green checkmark approves (status → "accepted")
- [ ] Red X rejects (status → "rejected")
- [ ] Delete button removes connection

## API Endpoints to Test Manually

### In Postman or curl:

#### 1. Get Dashboard Stats
```
GET http://localhost:5000/api/admin/stats
Authorization: Bearer <TOKEN>
```

Response:
```json
{
  "success": true,
  "data": {
    "totalUsers": 3,
    "totalRooms": 5,
    "totalReviews": 2,
    "totalConnections": 1,
    "pendingApprovals": 1
  }
}
```

#### 2. Get All Users
```
GET http://localhost:5000/api/admin/users
Authorization: Bearer <TOKEN>
```

#### 3. Get All Rooms
```
GET http://localhost:5000/api/admin/rooms?status=pending
Authorization: Bearer <TOKEN>
```

#### 4. Approve a Room
```
PUT http://localhost:5000/api/admin/rooms/ROOM_ID/approve
Authorization: Bearer <TOKEN>
```

#### 5. Reject a Room
```
PUT http://localhost:5000/api/admin/rooms/ROOM_ID/reject
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "reason": "Insufficient details"
}
```

#### 6. Get All Reviews
```
GET http://localhost:5000/api/admin/reviews
Authorization: Bearer <TOKEN>
```

#### 7. Update Review Status
```
PUT http://localhost:5000/api/admin/reviews/REVIEW_ID/status
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "status": "flagged"
}
```

## Common Issues & Solutions

### Issue: "Access denied. Admin only" (403)
**Solution**: 
- Make sure logged-in user has `role: 'admin'` in database
- Check JWT token is not expired
- Verify Authorization header is sent: `Authorization: Bearer <token>`

### Issue: Admin pages show "No data"
**Solution**:
- Check if database has actual data
- Open browser DevTools Network tab
- Look at API response status and data
- Ensure MongoDB connection is working
- Check backend logs for database errors

### Issue: Pages not loading (blank)
**Solution**:
- Check browser console for JavaScript errors
- Verify API_BASE_URL in `frontend/src/api.js` is correct
- Make sure backend is running on correct port (5000)
- Check CORS is enabled in backend

### Issue: Can't login as admin
**Solution**:
- Verify credentials: bursekaushal4@gmail.com / kaushal@2004
- Check admin user was created (check MongoDB)
- If not created, run: `cd backend && node seed.js`
- Check backend login endpoint is working

### Issue: Actions (delete, approve) don't work
**Solution**:
- Check API response in Network tab
- Verify request body is correct JSON
- Make sure user has admin role
- Check backend logs for error details
- Verify MongoDB operations succeeded

## Test Workflow

1. **Create test data** (as student/owner):
   - Register as student
   - Register as owner
   - Owner creates a room (will be pending)
   - Student creates a connection request
   - Student leaves a review

2. **Test as admin**:
   - Login as admin
   - Go to Rooms page - should see pending room
   - Approve the room
   - Go to Connections - should see pending connection
   - Accept the connection
   - Go to Reviews - should see the review
   - Flag the review
   - Go to Users - should see both student and owner
   - Try blocking/unblocking

3. **Verify cascading deletes**:
   - Delete the student user
   - Verify their connections are removed
   - Verify their reviews as reviewer are removed
   - Delete the owner user
   - Verify their rooms are removed
   - Verify their reviews as owner are removed

## Files Modified

### Backend
- `backend/models/User.js` - Added `blocked` field and 'admin' role
- `backend/models/Room.js` - Added `status` and `rejectionReason`
- `backend/models/Review.js` - Added `status` field
- `backend/middleware/auth.js` - Added `adminOnlyMiddleware`
- `backend/controllers/adminController.js` - Created (15+ endpoints)
- `backend/routes/adminRoutes.js` - Created
- `backend/server.js` - Registered admin routes

### Frontend
- `frontend/src/api.js` - Added `adminAPI` module
- `frontend/src/pages/AdminDashboardPage.jsx` - Updated with real API
- `frontend/src/pages/AdminRoomsPage.jsx` - Updated with real API
- `frontend/src/pages/AdminUsersPage.jsx` - Updated with real API
- `frontend/src/pages/AdminReviewsPage.jsx` - Updated with real API
- `frontend/src/pages/AdminConnectionsPage.jsx` - Updated with real API
- `frontend/src/components/Header.jsx` - Added admin link
- `frontend/src/App.jsx` - Added admin routes

## Expected Test Duration
- Full dashboard load: < 2 seconds
- Filter operations: < 1 second
- Delete/Approve operations: < 2 seconds
- UI should be responsive without lag
