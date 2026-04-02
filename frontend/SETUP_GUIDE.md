# RoomNest Frontend - Setup & Deployment Guide

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` file with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

---

## Project Structure Explained

```
frontend/
├── src/
│   ├── api.js                  # API client with axios
│   ├── App.jsx                 # Main app routing
│   ├── index.js                # Entry point
│   ├── index.css               # Global styles
│   │
│   ├── context/
│   │   └── AuthContext.js      # Authentication state
│   │
│   ├── components/
│   │   ├── Header.jsx          # Navigation header
│   │   ├── Footer.jsx          # Footer
│   │   ├── RoomCard.jsx        # Room listing card
│   │   └── ProtectedRoute.jsx  # Route protection
│   │
│   └── pages/
│       ├── HomePage.jsx        # Landing page
│       ├── LoginPage.jsx       # User login
│       ├── SignupPage.jsx      # User registration
│       ├── RoomsPage.jsx       # Browse rooms
│       ├── RoomDetailPage.jsx  # Room details
│       ├── ProfilePage.jsx     # User profile
│       ├── FavoritesPage.jsx   # Saved rooms
│       ├── MessagesPage.jsx    # Messaging
│       ├── ConnectionsPage.jsx # Connection requests
│       └── HostDashboardPage.jsx  # Host dashboard
│
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind config
├── postcss.config.js           # PostCSS config
└── README.md                   # Documentation
```

---

## Key Features Walkthrough

### 🏠 Home Page
- Hero section with search
- Feature highlights
- Call-to-action sections
- Responsive design

### 🔍 Room Discovery
- Browse all rooms
- Filter by location, price, amenities
- View room details with gallery
- See owner profiles
- Read reviews

### ❤️ Favorites
- Save favorite rooms
- Quick access to saved listings
- One-click removal

### 💬 Messaging
- Real-time chat with users
- Conversation history
- Read/unread status

### 🤝 Connections
- Send connection requests to owners
- Manage booking inquiries
- Track request status
- Schedule viewings

### 👤 Profile
- Edit user information
- View profile stats
- Update bio and preferences

### 🏢 Host Dashboard
- Create new listings
- Manage existing rooms
- View statistics
- Edit room details
- Delete listings

---

## Components Deep Dive

### Header Component
```javascript
Features:
- Logo and branding
- Search bar
- Navigation menu
- User dropdown
- Mobile responsive
- Authentication status
```

### RoomCard Component
```javascript
Features:
- Room image
- Title and location
- Price display
- Rating with review count
- Amenities preview
- Favorite button
- Link to detail page
```

### Authentication Flow
```javascript
1. User signup/login
2. Token stored in localStorage
3. Token sent with every API request
4. Auto-redirect on 401 (expired token)
5. Logout clears token and user data
```

---

## Styling with Tailwind CSS

### Color Scheme
```
Primary (Red):     #FF385C  - CTAs, highlights
Secondary (Gray):  #717171  - Text, descriptions
Dark:              #222222  - Main text
Light:             #F7F7F7  - Backgrounds
```

### Responsive Breakpoints
```
Mobile:   < 768px   (sm)
Tablet:   768-1024px (md)
Desktop:  > 1024px  (lg, xl)
```

### Custom Utilities
```css
.line-clamp-1/2/3  - Truncate text
.fade-in           - Fade animation
.slide-up          - Slide animation
```

---

## API Integration

### Authentication Endpoints
```javascript
POST   /auth/register      - Create account
POST   /auth/login         - Login user
GET    /auth/profile       - Get profile
PUT    /auth/profile       - Update profile
GET    /auth/owner/:id     - Get owner info
```

### Room Endpoints
```javascript
GET    /rooms              - List all rooms
GET    /rooms/:id          - Get room details
POST   /rooms              - Create room (owner)
PUT    /rooms/:id          - Update room (owner)
DELETE /rooms/:id          - Delete room (owner)
```

### Additional Endpoints
```javascript
Connections: POST, PUT /connections
Messages:    POST, GET /messages
Favorites:   POST, DELETE /favorites
Reviews:     POST, GET /reviews
```

---

## State Management

### Context API (AuthContext)
```javascript
- user          : Current user data
- loading       : Loading state
- login()       : Set user and token
- logout()      : Clear auth data
- updateUser()  : Update user info
```

### Local Storage
```
authToken  - JWT token
userData   - User object
```

---

## Error Handling

### Toast Notifications
```javascript
toast.success('Action successful')
toast.error('Error message')
toast.loading('Loading...')
```

### HTTP Interceptors
- Request: Add auth token
- Response: Handle 401, 403, 500

### Form Validation
- Required fields check
- Email format validation
- Password match verification
- Phone number validation

---

## Responsive Design Implementation

### Mobile First Approach
```
Mobile (Base) → Tablet (md:) → Desktop (lg:)
```

### Key Responsive Patterns
```jsx
// Grid layouts
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Flexbox wrapping
flex flex-col md:flex-row

// Hidden elements
hidden md:block

// Text sizing
text-sm md:text-base lg:text-lg
```

---

## Performance Tips

1. **Code Splitting**: Routes are lazy loaded
2. **Image Optimization**: Use placeholder images
3. **Caching**: API responses cached in state
4. **Memoization**: Prevent unnecessary re-renders
5. **CSS**: Tailwind purges unused styles in production

---

## Testing the Application

### Demo Credentials
```
Student Account:
  Email: student@demo.com
  Password: demo123

Owner Account:
  Email: owner@demo.com
  Password: demo123
```

### Test Flow
1. Sign up / Login with demo account
2. Browse rooms on homepage
3. Apply filters and search
4. View room details
5. Add to favorites
6. Send connection request
7. Send messages
8. View profile and connections

---

## Deployment

### Production Build
```bash
npm run build
```
Creates `build/` folder with optimized files

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

### Environment Variables (Production)
```
REACT_APP_API_URL=https://api.example.com/api
```

---

## Troubleshooting

### Issue: CORS errors
**Solution**: Ensure backend has CORS enabled
```javascript
// Backend setup
app.use(cors());
```

### Issue: API 404 errors
**Solution**: Check API_BASE_URL in .env

### Issue: Auth not working
**Solution**: Clear localStorage and restart
```javascript
localStorage.clear()
```

### Issue: Styling not applied
**Solution**: Restart dev server
```bash
npm start
```

### Issue: Port 3000 already in use
**Solution**: Use different port
```bash
PORT=3001 npm start
```

---

## Browser DevTools Tips

### Network Tab
- Check API requests/responses
- Verify auth headers
- Monitor loading times

### Application Tab
- View localStorage data
- Check cookies
- Debug state

### Console Tab
- Check for errors/warnings
- Test API calls manually
- Debug component issues

---

## Security Best Practices

✅ **JWT Tokens**
- Stored in localStorage
- Sent in Authorization header
- 30-day expiration

✅ **HTTPS**
- Always use HTTPS in production
- Redirect HTTP to HTTPS

✅ **CORS**
- Only allow trusted domains
- Validate API responses

✅ **Input Validation**
- Validate on client and server
- Sanitize user input
- Prevent XSS attacks

---

## Performance Metrics

### Lighthouse Scores Target
- **Performance**: 90+
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 90+

### Optimization Techniques
- Lazy loading components
- Image optimization
- CSS minification
- JavaScript minification
- Caching strategies

---

## Git Workflow

```bash
# Clone repository
git clone <repo-url>

# Create feature branch
git checkout -b feature/room-discovery

# Make changes and commit
git add .
git commit -m "feat: add room filter"

# Push to remote
git push origin feature/room-discovery

# Create pull request on GitHub
```

---

## Support & Feedback

- **Issues**: Create GitHub issue
- **Feedback**: Send email to team
- **Documentation**: Check README.md
- **API Docs**: See backend API_TESTING.md

---

## Version History

### v1.0.0
- ✅ Room discovery and browsing
- ✅ User authentication
- ✅ Favorites system
- ✅ Messaging system
- ✅ Connection requests
- ✅ Host dashboard
- ✅ Responsive design

---

## License

MIT License - Open source and free to use
