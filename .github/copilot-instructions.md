# Copilot Instructions for Room Rental Application

## Project Overview

- **Full-stack web app** for room rentals: Node.js/Express backend, MongoDB database, HTML/CSS/JS frontend.
- API client (`api.js`) connects frontend to backend via REST endpoints.
- All business logic is in backend controllers; frontend is thin and event-driven.

## Architecture & Data Flow

- **Backend**: `backend/` contains Express server, models, controllers, routes, middleware, and config.
  - Models: Mongoose schemas for User, Room, Connection, Message, Review.
  - Controllers: Handle business logic, validation, and DB operations.
  - Routes: RESTful endpoints grouped by resource (auth, rooms, connections, etc).
  - Middleware: JWT authentication, error handling, input validation.
- **Frontend**: HTML pages + JS files. `api.js` abstracts all API calls.
  - API base URL is set in `api.js` (default: `http://localhost:5000/api`).
  - UI updates are driven by API responses.

## Developer Workflows

- **Setup**:
  - Install backend deps: `cd backend && npm install`
  - Start MongoDB: `mongod` (local) or use Atlas URI in `.env`
  - Start backend: `npm run dev` (in `backend/`)
  - Start frontend: `python -m http.server 8000` (in project root)
- **Testing**:
  - Health check: `GET http://localhost:5000/api/health`
  - Use demo accounts: `student@demo.com` / `owner@demo.com` (password: `demo123`)
  - API can be tested via Postman or browser DevTools.
- **Debugging**:
  - Check backend logs for errors.
  - Use browser network tab to inspect API calls.
  - CORS is enabled by default.

## Project-Specific Patterns

- **API client**: All frontend API calls go through `api.js` (do not use fetch directly).
- **JWT tokens**: Stored in `localStorage` by frontend; sent as `Authorization: Bearer <token>`.
- **Role-based access**: Backend enforces student/owner permissions via middleware.
- **Error handling**: Controllers send structured error responses; frontend displays messages from API.
- **Environment config**: Use `.env` in `backend/` for secrets and DB URI.
- **Room filtering**: API supports query params for location, price, amenities.

## Integration Points

- **MongoDB**: All data is persisted; no mock data.
- **Postman**: Recommended for API testing (see `API_TESTING.md`).
- **Frontend-backend**: Communicate via REST; no direct DB access from frontend.

## Key Files & Directories

- `backend/server.js`: Express app entry point
- `backend/models/`: Mongoose schemas
- `backend/controllers/`: Business logic
- `backend/routes/`: API endpoints
- `backend/middleware/`: Auth & validation
- `api.js`: Frontend API client
- `README.md`, `API_TESTING.md`, `SETUP_GUIDE.md`: Documentation

## Example Patterns

- To fetch rooms: `getAllRooms({ location, minPrice, maxPrice })` in `api.js`
- To create a connection: `createConnection({...})` in `api.js`
- To check health: `GET /api/health` (returns status)

## Conventions

- Use async/await for all API calls.
- All backend routes are prefixed with `/api/`.
- Use provided demo accounts for initial testing.
- Update `API_BASE_URL` in `api.js` if backend runs on a different port.

---

For more details, see `README.md`, `API_TESTING.md`, and `SETUP_GUIDE.md`.
