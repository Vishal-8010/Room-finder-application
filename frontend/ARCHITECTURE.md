# RoomNest Frontend - Complete Documentation

## 📋 Overview

**RoomNest** is a fully responsive Airbnb-style room rental frontend built with React.js and Tailwind CSS. It provides a modern, clean, and minimal interface for students to find rooms and for owners to list their properties.

**Technology Stack:**
- React 18
- React Router v6
- Tailwind CSS
- Axios
- React Hot Toast
- React Icons

---

## 🏗️ Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   ├── Header
│   │   ├── Navigation
│   │   ├── Search
│   │   └── User Menu
│   ├── Main Routes
│   │   ├── HomePage
│   │   ├── LoginPage
│   │   ├── SignupPage
│   │   ├── RoomsPage
│   │   │   ├── Filters (Sidebar)
│   │   │   └── RoomCard (Grid)
│   │   ├── RoomDetailPage
│   │   │   ├── ImageGallery
│   │   │   ├── RoomInfo
│   │   │   ├── OwnerCard
│   │   │   ├── ReviewsSection
│   │   │   └── ConnectionModal
│   │   ├── ProfilePage
│   │   ├── FavoritesPage
│   │   │   └── RoomCard (Grid)
│   │   ├── MessagesPage
│   │   │   ├── ConversationList
│   │   │   └── ChatArea
│   │   ├── ConnectionsPage
│   │   │   └── ConnectionCard
│   │   └── HostDashboardPage
│   │       ├── Stats
│   │       ├── RoomCard (Grid)
│   │       └── CreateRoomModal
│   └── Footer
```

### Data Flow

```
User Action
    ↓
Event Handler
    ↓
API Call (api.js)
    ↓
Backend API
    ↓
Response
    ↓
State Update (useState)
    ↓
Component Re-render
```

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── api.js                          # Centralized API client
│   ├── index.js                        # React entry point
│   ├── index.css                       # Global styles
│   ├── App.jsx                         # Main routing
│   │
│   ├── context/
│   │   └── AuthContext.js              # Auth state management
│   │
│   ├── components/
│   │   ├── Header.jsx                  # Navigation
│   │   ├── Footer.jsx                  # Footer
│   │   ├── RoomCard.jsx                # Room listing card
│   │   └── ProtectedRoute.jsx          # Auth wrapper
│   │
│   └── pages/
│       ├── HomePage.jsx                # Hero + Features
│       ├── LoginPage.jsx               # Auth
│       ├── SignupPage.jsx              # Registration
│       ├── RoomsPage.jsx               # Rooms browse with filters
│       ├── RoomDetailPage.jsx          # Full room details
│       ├── ProfilePage.jsx             # User profile
│       ├── FavoritesPage.jsx           # Saved rooms
│       ├── MessagesPage.jsx            # Chat
│       ├── ConnectionsPage.jsx         # Inquiries
│       └── HostDashboardPage.jsx       # Owner management
│
├── index.html                          # HTML template
├── package.json                        # Dependencies
├── tailwind.config.js                  # Tailwind config
├── postcss.config.js                   # PostCSS config
├── .env                                # Environment variables
├── .gitignore                          # Git ignore
├── README.md                           # Quick start
├── SETUP_GUIDE.md                      # Detailed setup
├── API_EXAMPLES.md                     # API usage examples
└── ARCHITECTURE.md                     # This file
```

---

## 🎨 Design System

### Color Palette
```javascript
Primary:    #FF385C  (Airbnb Red)
Secondary:  #717171  (Medium Gray)
Dark:       #222222  (Charcoal)
Light:      #F7F7F7  (Off White)
Success:    #10B981  (Green)
Warning:    #F59E0B  (Amber)
Danger:     #EF4444  (Red)
```

### Typography
```
Font Family: 'Circular', -apple-system, system fonts
Weights: 400, 500, 600, 700
Sizes: 12px, 14px, 16px, 18px, 20px, 24px, 32px, 40px
```

### Spacing
```
Base unit: 4px
Scale: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
Used as: px, py, gap, etc
```

### Responsive Breakpoints
```
Mobile:  < 640px
Tablet:  640px - 1024px  (md)
Desktop: > 1024px        (lg)
```

---

## 🔐 Authentication System

### Flow
```
1. User SignUp/Login
   ↓
2. Backend validates & returns JWT token
   ↓
3. Token stored in localStorage
   ↓
4. Token sent with every request (Authorization header)
   ↓
5. Backend validates token
   ↓
6. If invalid → redirect to login
   ↓
7. If valid → process request & return data
```

### Context Usage
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, loading, login, logout, updateUser } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <Redirect to="/login" />;
  
  return <Dashboard />;
}
```

### Protected Routes
```javascript
<Route 
  path="/profile" 
  element={user ? <ProfilePage /> : <Navigate to="/login" />}
/>
```

---

## 📡 API Integration

### Request Structure
```javascript
Method: GET/POST/PUT/DELETE
URL: http://localhost:5000/api/endpoint
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'
}
```

### Response Structure
```javascript
{
  success: true,
  message: 'Success message',
  data: { /* response data */ },
  error: 'Error message (if failed)'
}
```

### API Modules
```javascript
authAPI        - Login, register, profile
roomAPI        - CRUD operations for rooms
favoriteAPI    - Add/remove favorites
messageAPI     - Send/receive messages
connectionAPI  - Create/manage connections
reviewAPI      - Post/manage reviews
```

---

## 🎯 Key Features

### 1. Room Discovery
- **Browse**: View all available rooms
- **Search**: Find by location
- **Filter**: Price range, amenities
- **Sort**: By rating, newest, price

### 2. Favorites
- Add/remove favorite rooms
- Quick access to saved listings
- Persistent across sessions

### 3. Messaging
- Real-time chat with users
- Conversation history
- Read/unread status
- Message timestamps

### 4. Connections
- Send connection requests to owners
- Track request status (pending, accepted, rejected)
- Schedule viewings
- Manage inquiries

### 5. Host Dashboard
- Create new room listings
- Edit existing rooms
- Delete listings
- View room statistics
- Manage student inquiries

### 6. Reviews & Ratings
- Post reviews for rooms
- Rate room quality (1-5 stars)
- View owner/room ratings
- See all reviews with photos

### 7. User Profiles
- Edit personal information
- View profile stats
- Update college/experience info
- Bio/description

---

## 🛠️ State Management

### Local State (useState)
```javascript
// Room data
const [rooms, setRooms] = useState([]);
const [filters, setFilters] = useState({});

// UI state
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [loading, setLoading] = useState(false);
```

### Global State (Context)
```javascript
// Auth context
const { user, login, logout, updateUser } = useAuth();
```

### Persistent State (localStorage)
```javascript
localStorage.setItem('authToken', token);
localStorage.setItem('userData', JSON.stringify(user));
```

---

## 🎬 Component Patterns

### Functional Component Pattern
```javascript
import React, { useState, useEffect } from 'react';

export default function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  return <div>{data}</div>;
}
```

### API Call Pattern
```javascript
try {
  const response = await apiFunction(params);
  setData(response.data);
} catch (error) {
  toast.error('Error message');
  console.error(error);
}
```

### Form Handling Pattern
```javascript
const [formData, setFormData] = useState({});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  // Validate
  // Submit
};
```

---

## 🚀 Performance Optimization

### Code Splitting
- Routes are lazy loaded with React Router
- Each page is a separate bundle

### Memoization
- Components re-render only when props change
- useCallback for event handlers

### Image Optimization
- Lazy loading with placeholder
- Responsive image sizing

### CSS Optimization
- Tailwind purges unused styles in production
- Minimal bundle size

### Caching
- API responses stored in state
- Refetch only when needed

---

## 📱 Responsive Design

### Mobile First
```
Mobile Base → Tablet (md:) → Desktop (lg:)
```

### Common Patterns
```jsx
// Single column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Stack on mobile, horizontal on desktop
<div className="flex flex-col md:flex-row gap-4">

// Show on desktop only
<div className="hidden md:block">

// Text size scaling
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

**Authentication**
- [ ] Sign up as student
- [ ] Sign up as owner
- [ ] Login with credentials
- [ ] Login with demo account
- [ ] Logout functionality
- [ ] Session persistence

**Room Discovery**
- [ ] View all rooms
- [ ] Filter by location
- [ ] Filter by price range
- [ ] Filter by amenities
- [ ] View room details
- [ ] See owner information

**Favorites**
- [ ] Add to favorites
- [ ] Remove from favorites
- [ ] View favorite list
- [ ] Persistence across pages

**Connections**
- [ ] Send connection request
- [ ] View connections
- [ ] Track request status
- [ ] Accept/reject (owner)
- [ ] Cancel request (student)

**Messaging**
- [ ] Send message
- [ ] Receive message
- [ ] View conversation history
- [ ] Start new conversation
- [ ] Real-time updates

**Profile**
- [ ] Edit profile info
- [ ] Update avatar
- [ ] Change password
- [ ] View profile stats

---

## 🐛 Debugging Tips

### Check Network Requests
1. Open DevTools → Network tab
2. Filter by XHR
3. Check status codes (200, 401, 404, 500)
4. Verify response data

### Check Console
1. DevTools → Console
2. Look for errors (red)
3. Check warnings (yellow)
4. Use console.log() to debug

### Check Auth
1. Open DevTools → Application
2. Check localStorage for authToken
3. Verify token is sent in requests
4. Check token expiration

### Responsive Testing
1. DevTools → Toggle device toolbar
2. Test on different screen sizes
3. Check media query activation
4. Verify touch interactions

---

## 📚 Learning Resources

### Official Documentation
- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios](https://axios-http.com)

### Video Tutorials
- React Basics
- Building REST APIs with React
- Tailwind CSS Mastery
- State Management Patterns

### Code Examples
- See `API_EXAMPLES.md` for usage patterns
- Check component files for implementation
- Review page components for full examples

---

## 🔄 Development Workflow

### Making Changes
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# Edit files...

# 3. Test locally
npm start

# 4. Commit changes
git add .
git commit -m "feat: add new feature"

# 5. Push to remote
git push origin feature/new-feature

# 6. Create pull request
```

### Common Tasks

**Add New Page**
1. Create file in `src/pages/`
2. Add route in `App.jsx`
3. Add navigation link in `Header.jsx`
4. Implement page logic

**Add New Component**
1. Create file in `src/components/`
2. Implement component logic
3. Export component
4. Use in pages/components

**Add New API Call**
1. Add function in `src/api.js`
2. Use in component with try-catch
3. Handle errors with toast
4. Update state on success

---

## 📦 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Environment Variables
```
REACT_APP_API_URL=https://api.example.com/api
```

---

## 🤝 Contributing

### Code Style
- Use functional components
- Use hooks for state
- Use const for imports
- Use arrow functions
- Add comments for complex logic

### Naming Conventions
- Components: PascalCase (RoomCard.jsx)
- Functions: camelCase (handleSubmit)
- Files: Match component name
- Variables: camelCase (roomData)

### Git Conventions
- Branch: feature/name, bugfix/name, docs/name
- Commit: feat:, fix:, docs:, style:, refactor:
- PR: Descriptive title and description

---

## 📞 Support

### Getting Help
- Check documentation files
- Search in code comments
- Review API examples
- Check console for errors
- Review network tab

### Reporting Issues
- Describe the problem
- Provide steps to reproduce
- Share error messages
- Include screenshots
- Mention browser/OS

---

## 📝 License

MIT License - Free to use and modify

---

## 🎉 Summary

This frontend provides a complete, modern, and responsive UI for the RoomNest application. It integrates seamlessly with the backend API, provides excellent user experience, and is fully customizable.

**Happy Coding! 🚀**
