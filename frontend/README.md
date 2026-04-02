# RoomNest Frontend

A fully responsive Airbnb-style room rental frontend built with React.js and Tailwind CSS.

## Features

✨ **Modern & Responsive Design**
- Mobile-first approach
- Fully responsive on all devices
- Smooth animations and transitions
- Clean, minimal UI inspired by Airbnb

🏠 **Room Discovery**
- Browse all available rooms
- Advanced filtering by location, price, and amenities
- Room detail pages with images and reviews
- Save rooms to favorites

👤 **User Management**
- Student and owner account types
- User profile management
- Role-based access control

💬 **Communication**
- Real-time messaging between users
- Connection requests to room owners
- Conversation history

⭐ **Reviews & Ratings**
- Leave reviews for rooms
- View owner and room ratings
- Build trust through transparent reviews

🏢 **Host Dashboard**
- Manage your rooms
- Create and edit listings
- Track connections and inquiries
- View room statistics

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── context/          # React context (Auth)
│   ├── api.js            # API client
│   ├── App.jsx           # Main app component
│   ├── index.css         # Global styles
│   └── index.js          # Entry point
├── public/
│   └── index.html        # HTML template
├── package.json          # Dependencies
└── tailwind.config.js    # Tailwind config
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Backend server running on http://localhost:5000

### Steps

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL**
   - Edit `.env` and set `REACT_APP_API_URL` if backend runs on different port

3. **Start development server**
   ```bash
   npm start
   ```
   - App opens at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from create-react-app (irreversible)

## API Integration

All API calls are made through `src/api.js`:

```javascript
import { roomAPI, authAPI, favoriteAPI, messageAPI, connectionAPI, reviewAPI } from './api';

// Examples
await roomAPI.getAllRooms({ location: 'Delhi', minPrice: 5000 });
await authAPI.login('email@example.com', 'password');
await favoriteAPI.addToFavorites(roomId);
await messageAPI.sendMessage(userId, 'Hello!');
```

## Authentication

- JWT tokens stored in localStorage
- Automatic token refresh on API calls
- Redirects to login on 401 responses
- Demo accounts available on login page

## Demo Accounts

- **Student**: student@demo.com / demo123
- **Owner**: owner@demo.com / demo123

## Responsive Design

- **Mobile** (< 768px) - Single column, optimized touch
- **Tablet** (768px - 1024px) - Two columns
- **Desktop** (> 1024px) - Three columns, full features

## Key Components

### Header
- Navigation menu
- Search bar
- User profile dropdown
- Mobile menu

### RoomCard
- Room image
- Title and location
- Price and rating
- Quick favorite button

### Filters
- Location search
- Price range
- Amenities filter
- Active on mobile and desktop

## Color Scheme

- **Primary**: #FF385C (Airbnb red)
- **Secondary**: #717171 (Gray)
- **Dark**: #222222 (Text)
- **Light**: #F7F7F7 (Background)

## Best Practices Implemented

✅ Component-based architecture
✅ Context API for state management
✅ Reusable components
✅ Error handling with toast notifications
✅ Loading states
✅ Responsive design
✅ Clean code organization
✅ API abstraction layer
✅ Protected routes
✅ Proper form validation

## Performance Optimizations

- Code splitting with React Router
- Lazy loading with Suspense
- Image optimization
- Memoization of components
- Efficient API calls
- CSS minification with Tailwind

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Future Enhancements

- [ ] Real-time notifications
- [ ] Payment integration
- [ ] Video tours
- [ ] Advanced search filters
- [ ] User verification
- [ ] Document upload
- [ ] Admin dashboard
- [ ] Analytics

## Troubleshooting

**CORS errors**: Ensure backend has CORS enabled
**API 404**: Check API_BASE_URL in .env
**Auth issues**: Clear localStorage and login again
**Styling issues**: Run `npm install` and restart dev server

## Support

For issues or questions, please contact the development team.

## License

MIT License - feel free to use this project
