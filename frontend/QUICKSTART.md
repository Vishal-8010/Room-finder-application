# Quick Start Guide - RoomNest Frontend

## 🚀 Get Up & Running in 5 Minutes

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment (Optional)
The `.env` file is pre-configured, but you can modify it:
```bash
# .env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 4: Start Development Server
```bash
npm start
```

✅ App automatically opens at `http://localhost:3000`

---

## 📋 What You Get

### 🏠 Home Page
- Hero section with search
- Features showcase
- Call-to-action buttons

### 🔍 Room Discovery
- Browse all rooms
- Advanced filtering
- Detailed room info
- Owner profiles

### ❤️ Favorites
- Save favorite rooms
- Quick access list
- One-click management

### 💬 Messaging
- Real-time chat
- Conversation history
- Multiple contacts

### 🤝 Connections
- Send inquiries
- Track status
- Schedule viewings

### 🏢 Host Dashboard (Owners Only)
- Create listings
- Manage rooms
- View statistics

### 👤 User Profile
- Edit information
- View stats
- Update preferences

---

## 🎭 Demo Accounts

### Student Account
```
Email:    student@demo.com
Password: demo123
```

### Owner Account
```
Email:    owner@demo.com
Password: demo123
```

---

## 📦 Project Structure

```
frontend/
├── src/
│   ├── pages/              # Main page components
│   ├── components/         # Reusable components
│   ├── context/           # Auth context
│   ├── api.js             # API client
│   ├── App.jsx            # Main app
│   └── index.css          # Global styles
├── index.html             # HTML template
├── package.json           # Dependencies
└── tailwind.config.js     # Tailwind config
```

---

## 🎨 Key Features

✨ **Modern Design**
- Airbnb-style interface
- Clean and minimal
- Smooth animations

📱 **Fully Responsive**
- Mobile-first approach
- Works on all devices
- Touch-friendly

🔐 **Secure Authentication**
- JWT token-based
- Protected routes
- Session management

⚡ **Fast Performance**
- Code splitting
- Image optimization
- Efficient caching

🎯 **Great UX**
- Toast notifications
- Loading states
- Error handling
- Form validation

---

## 🛠️ Available Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from create-react-app (irreversible)
npm run eject
```

---

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Latest |
| Firefox | ✅ Latest |
| Safari  | ✅ Latest |
| Edge    | ✅ Latest |
| Mobile  | ✅ iOS/Android |

---

## 🔧 Configuration

### API Base URL
Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Tailwind Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#FF385C',
  secondary: '#717171',
  dark: '#222222',
  light: '#F7F7F7',
}
```

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
PORT=3001 npm start
```

### Dependencies Issue
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear Cache & Restart
```bash
# Windows
rmdir /s /q node_modules
npm install
npm start

# macOS/Linux
rm -rf node_modules
npm install
npm start
```

### CORS Errors
- Ensure backend is running
- Check API URL in `.env`
- Verify CORS enabled in backend

### Auth Issues
```bash
# Clear localStorage in browser DevTools
# Or programmatically:
localStorage.clear()
```

---

## 📱 Testing Locally

### Test on Mobile
1. Get your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Open browser on phone: `http://<YOUR_IP>:3000`

### Test Responsive Design
1. Open DevTools: F12 or Right-click → Inspect
2. Toggle Device Toolbar: Ctrl+Shift+M
3. Select device or custom size

---

## 🚀 Deployment

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Environment Variables (Production)
```
REACT_APP_API_URL=https://api.yoursite.com/api
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `API_EXAMPLES.md` | API usage examples |
| `ARCHITECTURE.md` | Technical architecture |

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start server: `npm start`
3. ✅ Test login: Use demo accounts
4. ✅ Browse rooms: Explore features
5. ✅ Make changes: Edit and see live updates
6. ✅ Build production: `npm run build`

---

## 💡 Pro Tips

### 1. Use React DevTools
- Download React DevTools extension
- Inspect component props and state
- Track component re-renders

### 2. Use Network Tab
- Monitor API requests/responses
- Check headers and status codes
- Debug API issues

### 3. Use Console
- Check for errors/warnings
- Test API calls manually
- Debug with console.log()

### 4. Hot Reload
- Save files to auto-refresh
- Changes appear instantly
- No manual refresh needed

### 5. Responsive Testing
- Always test on multiple devices
- Use DevTools device emulator
- Check tablet and mobile views

---

## 🎓 Learning Path

**If you're new to React:**
1. Learn React basics
2. Understand hooks (useState, useEffect)
3. Learn React Router
4. Explore context API
5. Study this codebase

**If you're new to Tailwind:**
1. Learn utility-first CSS
2. Understand responsive classes
3. Use spacing and sizing scales
4. Explore animations
5. Build custom components

---

## 🤝 Contributing

Want to improve the frontend?

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create PR

---

## 📞 Need Help?

- 📖 Read documentation files
- 🔍 Check code comments
- 💻 Review component examples
- 🐛 Check browser console
- 🌐 Check network tab

---

## 🎉 You're Ready!

```bash
cd frontend
npm install
npm start
```

🚀 Happy coding!

---

## 📝 Useful Links

- [React Documentation](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)
- [JavaScript MDN](https://developer.mozilla.org)

---

**Last Updated:** January 29, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
