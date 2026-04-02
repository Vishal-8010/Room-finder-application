# Room Rental Application - Complete Features Documentation

## Project Overview

**Room Rental** is a full-stack web application that connects students looking for accommodation with property owners/landlords. The platform facilitates room discovery, communication, booking, and community building through reviews and ratings.

### Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React.js with HTML/CSS/JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Mapping**: Geolocation with GeoJSON
- **API**: RESTful architecture

---

## Core Features

### 1. Authentication & User Management

#### 1.1 User Registration
- **Dual Role Support**: Users can register as either:
  - **Student**: Looking for accommodation
  - **Owner**: Listing properties for rent
  - **Admin**: Platform administrators (super users)
  
- **Required Fields**:
  - First Name & Last Name
  - Email (unique)
  - Password (min 6 characters) with confirmation
  - Phone Number
  - Role Selection

- **Student-Specific Fields**:
  - College/University Name
  - Course/Major
  - Year of Study

- **Owner-Specific Fields**:
  - Number of Properties
  - Experience in Property Management

#### 1.2 User Login
- Email and password authentication
- JWT token generation (30-day expiration)
- Automatic token storage in localStorage
- Role-based access control

#### 1.3 User Profile Management
- View and update user information
- Avatar/Profile picture upload
- Bio/About section
- Rating and review count display
- Block/Unblock feature for users
- Verification status tracking
- Favorites list management

#### 1.4 User Roles & Permissions
- **Student Role**:
  - View available rooms
  - Search and filter rooms
  - Create connections with owners
  - Send messages
  - Leave reviews and ratings
  - Manage favorites
  - Upload verification documents

- **Owner Role**:
  - List and manage rooms/properties
  - Respond to student connections
  - Send messages to interested students
  - Manage room availability
  - Track ratings and reviews
  - Upload property documents

- **Admin Role**:
  - Access comprehensive dashboard
  - Manage all users (view, block, unblock)
  - Approve/reject room listings
  - Monitor reviews and connections
  - View platform statistics
  - Manage room verification status

---

### 2. Room Management

#### 2.1 Room Listing Creation
Owners can create detailed room listings with:

**Basic Information**:
- Title (required)
- Detailed Description
- Price (monthly rent, required)
- Security Deposit
- Room Size/Square Footage
- Available From Date
- Location Name (required)

**Location Services**:
- Geocoding integration for precise location mapping
- Latitude/Longitude coordinates
- GeoJSON Point format for mapping
- Address-based search

**Amenities**:
- Multiple amenity selection
- Predefined amenity options (WiFi, Furnished, AC, Parking, etc.)

**Media**:
- Multiple image upload support
- Image URL storage and management
- Image validation and cleanup

**Verification & Status**:
- Verification status tracking
- Active/Inactive status toggle
- Admin approval workflow (pending → approved/rejected)
- Rejection reason documentation

#### 2.2 Room Search & Filtering
Students can discover rooms using:

**Search Filters**:
- **Location-based**: Search by location name (case-insensitive)
- **Price Range**: Min and Max price filtering
- **Amenities**: Filter by multiple amenities
- **Text Search**: Full-text search in title, description, and location
- **Sorting**: By price, rating, newest listings

**Room Display Information**:
- Owner details (name, rating, verification status)
- Room rating and review count
- Available amenities list
- Price and deposit information
- Location and distance information
- Featured room highlighting

#### 2.3 Room Management by Owners
- **Edit Listings**: Modify room details anytime
- **Deactivate Rooms**: Hide listings temporarily
- **View Analytics**: Track views and connections
- **Manage Availability**: Update dates and availability

#### 2.4 Admin Room Moderation
- View all rooms (active and pending)
- Approve pending room listings
- Reject with documented reasons
- Feature rooms (boost visibility)
- Verify legitimate listings
- Monitor room quality

---

### 3. Room Details & Reviews

#### 3.1 Room Detail Page
When viewing a room, students see:
- Complete room information
- High-resolution image gallery
- Owner profile and rating
- All reviews with ratings
- Location on interactive map
- Available amenities
- Contact information
- Connection button

#### 3.2 Review System
- **5-Star Rating Scale**: Numeric rating (0-5)
- **Review Components**:
  - Rating (required)
  - Title/Headline
  - Detailed Comment
  - Automatic timestamp
  - Reviewer information

- **Review Features**:
  - One review per room per student
  - Aggregate rating calculation
  - Owner rating based on all reviews
  - Review count tracking
  - Edit/delete own reviews

- **Review Display**:
  - Chronological listing
  - Average rating display
  - Reviewer profile visible

#### 3.3 Rating System
- **Room Rating**: Average of all reviews for a room
- **Owner Rating**: Average of all reviews given to their properties
- **Rating Updates**: Automatic recalculation after new reviews
- **Review Count**: Total number of reviews tracked

---

### 4. Connection Management

#### 4.1 Creating Connections
Students can express interest in rooms by creating connections:

**Connection Details**:
- Student Name
- Student Email
- Student Phone
- College/University
- Course
- Desired Move-in Date
- Duration of stay (in months)
- Personal message to owner

**Connection Workflow**:
1. Student selects room and clicks "Connect"
2. Fills out connection request form
3. Request sent to property owner
4. Owner can accept, reject, or message back

#### 4.2 Connection Status Types
- **Pending**: Awaiting owner response
- **Accepted**: Owner approved the connection
- **Rejected**: Owner declined (cannot create duplicate)
- **Blocked**: User blocking prevents connections

#### 4.3 Connection Management
**For Students**:
- View all their connections
- See connection status
- Cancel pending connections
- Track accepted connections

**For Owners**:
- View connection requests for their rooms
- Accept/Reject connections
- Message students directly
- View student details in request
- Track connection history

#### 4.4 Duplicate Prevention
- One connection per student per room
- Cannot create multiple connections for same room
- Previous rejections prevent new attempts

---

### 5. Messaging System

#### 5.1 Real-time Messaging
Direct messaging between students and property owners:

**Message Features**:
- Sender and receiver identification
- Message content (text)
- Timestamp tracking
- Room reference (optional)
- Conversation history

#### 5.2 Conversation Management
- **Get Conversation**: Retrieve all messages between two users
- **View Conversations**: List all active conversations
- **Send Message**: Send new messages instantly
- **Chronological Ordering**: Messages sorted by timestamp
- **User Details**: Sender/receiver names and avatars displayed

#### 5.3 Communication Context
- Messages linked to rooms (optional)
- Follow-up from connection requests
- Direct negotiation with owners
- Document sharing capability

---

### 6. Favorites Management

#### 6.1 Add to Favorites
- Students can bookmark interesting rooms
- One-click favorite toggle
- Prevent duplicate favorites

#### 6.2 Favorites Features
- **Wishlist**: Curated list of favorite rooms
- **Quick Access**: View all favorites on dedicated page
- **Remove**: Remove rooms from wishlist
- **Persistent**: Saved in user profile

#### 6.3 Favorites Use Cases
- Save rooms for later consideration
- Compare multiple properties
- Track preferred locations
- Quick reference during decision-making

---

### 7. Document Management

#### 7.1 Document Upload
Users can upload supporting documents:

**Allowed Document Types**:
- PDF files
- JPEG images
- PNG images
- Maximum file size: 10MB per file

**Document Categories**:
- Student ID/Enrollment Certificate
- Income Proof (for owners)
- Property Documents
- Lease Agreements
- Identification Documents

#### 7.2 Document Upload Process
1. Select document type
2. Choose file (PDF or image)
3. Link to room (optional)
4. Automatic file storage
5. Admin review and approval

#### 7.3 Document Management
- **User Documents**: Students/owners view their uploads
- **Status Tracking**: Pending → Approved/Rejected
- **Admin Review**: Documents reviewed for verification
- **File Management**: Store, retrieve, and delete documents
- **Room Association**: Link documents to specific rooms

---

### 8. Admin Dashboard

#### 8.1 Dashboard Statistics
Real-time platform analytics:
- **Total Users**: Count of registered users
- **Total Rooms**: Count of all listings
- **Total Reviews**: Count of all reviews
- **Total Connections**: Count of connections made
- **Pending Approvals**: Rooms awaiting admin approval

#### 8.2 User Management
**Admin Capabilities**:
- View all registered users
- Filter by role (student, owner, admin)
- Filter by status (active, blocked)
- Block/Unblock users
- Remove fraudulent accounts
- Monitor user activity

**User Information Displayed**:
- Name and email
- Role and registration date
- Verification status
- Activity level
- Block status

#### 8.3 Room Moderation
**Admin Actions**:
- View all pending rooms
- Approve/reject listings
- Document rejection reasons
- Feature approved rooms
- Verify property authenticity
- Monitor room quality standards

**Room Review Process**:
- Check listing completeness
- Verify owner information
- Validate location data
- Assess image quality
- Approve for platform display

#### 8.4 Review Management
- View all platform reviews
- Monitor review quality
- Remove inappropriate reviews
- Flag spam or fake reviews
- Ensure community standards

#### 8.5 Connection Tracking
- Monitor platform connections
- Identify user engagement
- Track successful matches
- Identify inactive users
- Analyze booking patterns

---

### 9. User Verification System

#### 9.1 User Verification Status
- Boolean flag indicating verified status
- Manual verification by admin
- Email confirmation (optional)
- Document-based verification

#### 9.2 Benefits of Verification
- **For Students**:
  - Increased trust from property owners
  - Priority in connection responses
  - Badge display on profile

- **For Owners**:
  - Legitimate listing indicator
  - Higher visibility in searches
  - Increased student connections
  - Trust badge display

#### 9.3 Verification Process
1. User uploads supporting documents
2. Admin reviews documentation
3. Verification approved/denied
4. Verification badge displayed on profile

---

### 10. Blocking System

#### 10.1 User Blocking
Users can block other users:

**Block Features**:
- Prevent blocked users from:
  - Creating connections
  - Viewing profile details
  - Sending messages
  - Viewing listings (optional)

#### 10.2 Block Management
- **Block List**: View all blocked users
- **Unblock**: Remove users from block list
- **Reasons**: Document why user was blocked (optional)

#### 10.3 Admin Blocking
- Admins can block problematic users
- Platform-wide blocking
- Prevents account access
- Tracks blocked status

---

### 11. Search & Discovery

#### 11.1 Advanced Search
Multiple search methods:
- **Location Search**: Find rooms in specific areas
- **Price Range**: Set budget constraints
- **Amenity Filters**: Select preferred facilities
- **Text Search**: Search by keywords
- **Combined Filters**: Multiple criteria simultaneously

#### 11.2 Search Results
- Filtered room listings
- Sorting options (price, rating, newest)
- Pagination for large result sets
- Direct access to room details

#### 11.3 Discovery Features
- **Featured Rooms**: Highlighted listings
- **New Listings**: Recently added properties
- **Top-Rated Rooms**: Highest-rated properties
- **Popular Locations**: Trending areas

---

### 12. Geolocation & Mapping

#### 12.1 Location Services
- **Geocoding**: Convert addresses to coordinates
- **GeoJSON Integration**: Store location data in GeoJSON format
- **Coordinates Storage**: Latitude and Longitude tracking
- **Location Display**: Map visualization of rooms

#### 12.2 Room Location Features
- Precise location pinpointing
- Distance calculation
- Neighborhood information
- Proximity-based searches

#### 12.3 Map Integration
- Interactive map display
- Room location markers
- Search by map area
- Directional information

---

### 13. Notifications & Activity

#### 13.1 Connection Notifications
- New connection requests
- Connection acceptance/rejection
- Message notifications

#### 13.2 Review Notifications
- New reviews on owner's properties
- Review ratings changes
- Reply to reviews

#### 13.3 User Activity
- Last login tracking
- Profile view history
- Message read status

---

### 14. Security Features

#### 14.1 Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password encryption
- **Session Management**: 30-day token expiration
- **Token Refresh**: Automatic token management

#### 14.2 Data Protection
- **Email Validation**: Regex pattern matching
- **Password Requirements**: Minimum 6 characters
- **Unique Constraints**: Email uniqueness enforcement
- **Role-Based Access Control**: Permission-based endpoints

#### 14.3 File Security
- **File Type Validation**: Only PDF and images allowed
- **File Size Limits**: 10MB maximum per file
- **Secure Storage**: Organized file directory structure
- **MIME Type Checking**: Validate file types

---

### 15. Error Handling

#### 15.1 Input Validation
- Required field checking
- Email format validation
- Password strength validation
- Phone number validation
- Price and numeric field validation

#### 15.2 Error Responses
- HTTP status codes
- Descriptive error messages
- Field-specific validation errors
- Duplicate account prevention

#### 15.3 Business Logic Validation
- Room existence checking
- Owner verification
- Connection duplicate prevention
- Review duplicate prevention
- Favorite duplicate prevention

---

## Frontend Pages & Components

### 1. Authentication Pages

#### LoginPage
- Email and password input
- "Remember Me" option
- Role-based redirect after login
- Error message display
- Link to signup page

#### SignupPage
- Registration form
- Role selection (Student/Owner)
- Role-specific field collection
- Password confirmation
- Terms & conditions acknowledgment

### 2. User Pages

#### ProfilePage
- User information display and editing
- Avatar upload
- Bio/About section
- Verification status
- Rating and review count
- Favorites list preview
- Blocked users list

#### HomePage
- Featured rooms showcase
- Recent listings
- Search bar
- Call-to-action buttons
- Platform overview

### 3. Room Pages

#### RoomsPage
- Room listings grid/list view
- Search and filter interface
- Price range slider
- Amenity selection
- Location search
- Sorting options
- Pagination

#### RoomDetailPage
- Complete room information
- Image gallery
- Owner profile card
- Reviews section
- Connection button
- Add to favorites button
- Contact information
- Map display

#### EditRoomPage
- Update room details
- Change images
- Modify amenities
- Update availability
- Deactivate room

### 4. Connection Pages

#### ConnectionsPage
- **For Students**:
  - View pending connections
  - View accepted connections
  - View rejected connections
  - Create new connections
  - Cancel pending connections

- **For Owners**:
  - View connection requests
  - Accept/Reject connections
  - View student details
  - Message students

### 5. Communication Pages

#### MessagesPage
- List of all conversations
- Conversation threads
- Send new messages
- View message history
- User avatars and names
- Timestamp display

### 6. Favorites Pages

#### FavoritesPage
- All bookmarked rooms
- Quick view room details
- Remove from favorites
- Direct connection option
- Filter favorites

### 7. Documents Pages

#### DocumentsPage
- Upload verification documents
- View uploaded documents
- Document status tracking
- Delete documents
- View associated room (if any)

### 8. Dashboard Pages

#### HostDashboardPage (For Owners)
- Room listings management
- Connection requests overview
- Messages from students
- Room performance analytics
- Recent reviews
- Revenue/booking information

#### AdminDashboardPage
- Platform statistics
- User management interface
- Room approval queue
- Review monitoring
- Analytics and reports
- System health status

### 9. Admin Management Pages

#### AdminUsersPage
- List all users
- Filter by role
- Block/Unblock users
- View user details
- Activity monitoring

#### AdminRoomsPage
- Pending room approvals
- Approved/Active rooms
- Rejected rooms
- Feature rooms
- Room verification management

#### AdminReviewsPage
- All platform reviews
- Review quality monitoring
- Flag inappropriate reviews
- Review moderation tools

#### AdminConnectionsPage
- Connection analytics
- Success rate tracking
- User engagement metrics
- Connection patterns

---

## API Endpoints Summary

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Room Routes
- `GET /api/rooms` - Get all rooms with filters
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create new room (owner)
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `GET /api/rooms/:id/reviews` - Get room reviews

### Connection Routes
- `POST /api/connections` - Create connection
- `GET /api/connections` - Get user connections
- `PUT /api/connections/:id` - Update connection status
- `DELETE /api/connections/:id` - Delete connection

### Message Routes
- `POST /api/messages` - Send message
- `GET /api/messages/:userId` - Get conversation
- `GET /api/messages` - Get all conversations

### Review Routes
- `POST /api/reviews` - Create review
- `GET /api/reviews` - Get all reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Favorites Routes
- `POST /api/favorites/:roomId` - Add to favorites
- `DELETE /api/favorites/:roomId` - Remove from favorites
- `GET /api/favorites` - Get user favorites

### Document Routes
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id` - Get document details

### Admin Routes
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Block/Unblock user
- `GET /api/admin/rooms` - Get all rooms (admin)
- `PUT /api/admin/rooms/:id/approve` - Approve room
- `PUT /api/admin/rooms/:id/reject` - Reject room
- `GET /api/admin/reviews` - Get all reviews
- `GET /api/admin/connections` - Get all connections

---

## Database Models

### User Model
- Personal information (firstName, lastName, email, phone)
- Authentication (password with bcrypt hashing)
- Role (student, owner, admin)
- Student fields (college, course, year)
- Owner fields (propertyCount, experience)
- Profile info (avatar, bio)
- Ratings (rating, reviewCount)
- Status (verified, blocked)
- Favorites list

### Room Model
- Basic info (title, description, price)
- Location (locationName, coordinates with GeoJSON)
- Details (amenities, size, deposit)
- Availability (availableFrom)
- Media (images array)
- Owner reference
- Verification and status
- Ratings (rating, reviewCount)
- Admin fields (featured, active, status, rejectionReason)

### Connection Model
- Room and User references
- Student details (name, email, phone, college, course)
- Timeline (moveInDate, duration)
- Personal message
- Status tracking
- Timestamps

### Message Model
- Sender and receiver references
- Content
- Room reference (optional)
- Timestamps
- Read/Unread status (optional)

### Review Model
- Room and owner references
- Reviewer reference
- Rating (1-5)
- Title and comment
- Timestamps

### Document Model
- User reference
- Room reference (optional)
- Document type
- File info (fileName, fileUrl, fileSize, mimeType)
- Status tracking
- Timestamps

### Visit Request Model
- User and room references
- Visit date/time
- Status
- Notes
- Timestamps

---

## Key Features Implementation Details

### 1. Image Management
- Multiple image upload per room
- Image URL normalization
- Automatic cleanup of invalid images
- Support for external URLs
- Local file storage

### 2. Geolocation
- Address to coordinates conversion
- GeoJSON Point format storage
- Longitude/Latitude tracking
- Distance calculation capability

### 3. Rating System
- Automatic aggregate calculation
- User and room rating updates
- Review count tracking
- Real-time rating updates

### 4. Authentication Flow
1. User registers with email and password
2. Password hashed with bcryptjs
3. JWT token generated
4. Token stored in localStorage
5. Subsequent requests include Authorization header
6. Token verified and user identified

### 5. Role-Based Access Control
- Middleware checks user role
- Different endpoints for student/owner/admin
- Permission enforcement at controller level
- Route protection with authentication middleware

---

## User Workflows

### Student User Journey
1. **Registration**: Sign up with college details
2. **Discovery**: Search and filter available rooms
3. **Exploration**: View room details and reviews
4. **Interest**: Add favorite rooms, read reviews
5. **Connection**: Create connection request with owner
6. **Communication**: Message owner for clarification
7. **Agreement**: Accept offered connection
8. **Review**: Leave review and rating after experience

### Owner User Journey
1. **Registration**: Sign up with property details
2. **Listing**: Create room listing with images and amenities
3. **Approval**: Wait for admin approval
4. **Management**: Track connections and messages
5. **Communication**: Respond to student inquiries
6. **Booking**: Accept/Reject connection requests
7. **Monitoring**: Track reviews and ratings

### Admin User Journey
1. **Login**: Access admin dashboard
2. **Monitoring**: View platform statistics
3. **Moderation**: Review pending room listings
4. **Approval**: Approve or reject rooms with reasons
5. **Management**: Block problematic users
6. **Monitoring**: Track reviews and connections
7. **Reporting**: Generate platform analytics

---

## Security Considerations

1. **Password Security**: Bcryptjs hashing
2. **Token Security**: JWT with expiration
3. **Input Validation**: Server-side validation
4. **CORS**: Enabled for frontend access
5. **File Upload**: Type and size validation
6. **Email Uniqueness**: Database constraints
7. **Role-Based Access**: Middleware enforcement
8. **Blocked Users**: Cannot interact with others

---

## Performance Features

1. **Database Indexing**: Email and location indexes
2. **Pagination**: Large dataset handling
3. **Query Optimization**: Selective field retrieval
4. **Image Compression**: Multiple size storage
5. **Caching**: Frontend caching options
6. **Lazy Loading**: Progressive content loading

---

## Future Enhancement Possibilities

1. **Real-time Chat**: WebSocket integration for live messaging
2. **Video Calling**: In-app video tours with owners
3. **Payment Integration**: Online booking payments
4. **Lease Management**: Digital lease agreements
5. **Move Coordination**: Move-in scheduling
6. **Roommate Matching**: AI-based compatibility
7. **Rental History**: Verify previous rentals
8. **Insurance Integration**: Rental insurance options
9. **Maintenance Portal**: Reported maintenance tracking
10. **Mobile App**: Native iOS/Android application
11. **Notification System**: Email and push notifications
12. **Analytics**: Advanced platform analytics
13. **API Webhooks**: Third-party integrations
14. **Multi-language**: Internationalization support

---

## Conclusion

The Room Rental Application is a comprehensive platform designed to streamline the process of finding and renting accommodations. With robust authentication, advanced search capabilities, secure communication, and admin moderation tools, it provides a safe and efficient marketplace for students and property owners. The system is built on scalable architecture with MongoDB, Express, and React, ensuring reliability and performance as the user base grows.

The platform emphasizes trust through verification, ratings, and reviews, while maintaining security through role-based access control and proper data validation. The feature set covers the complete rental lifecycle from discovery to booking, making it a complete solution for accommodation rental needs.
