# MapView Integration Summary

## Features Implemented

The map is now fully integrated into the `RoomsPage.jsx` and provides the following features:

### 1. **Interactive Map Display**
- Displays above the room listings when rooms are available
- 350px height by default, responsive across devices
- Mapbox Streets basemap with navigation controls

### 2. **Dynamic Room Markers**
- Shows price bubbles (₹ format) for each room
- Markers use custom styling with Airbnb-like appearance
- Supports GeoJSON location data from backend

### 3. **Map-Triggered Fetching (Bounds-Based)**
- When user drags/pans the map, bounds are calculated
- API fetches rooms within visible map area (geospatial query)
- Debounced to avoid excessive API calls (500ms)

### 4. **Rich Popup Cards**
- Click any marker to see:
  - Room image
  - Room title
  - Price per month
  - "View Details" button (links to `/room/:id`)

### 5. **Card-to-Map Interactions**
- **Hover Room Card**: Marker highlights (scales up with shadow)
- **Click Room Card**: Map centers on that marker with smooth animation
- **Hover Map**: Marker responds to user proximity

## How to Use

### Setup
1. **Install Mapbox GL JS in frontend:**
   ```bash
   cd frontend
   npm install mapbox-gl
   ```

2. **Add Mapbox token to `.env` (frontend):**
   ```
   REACT_APP_MAPBOX_TOKEN=your_mapbox_public_token
   ```

3. **Add Mapbox token to `.env` (backend):**
   ```
   MAPBOX_TOKEN=your_mapbox_access_token
   ```

### User Flow
1. User navigates to `/rooms`
2. Initial rooms load from `GET /api/rooms?location=...`
3. Map displays above room grid with initial markers
4. User can:
   - **Drag map**: New rooms fetch automatically for visible bounds
   - **Hover room card**: Marker highlights on map
   - **Click room card**: Map smoothly zooms to that room
   - **Click marker popup**: Opens room details page

## Backend API Endpoints

### Room Creation with Geocoding
```
POST /api/rooms
Body: {
  title, description, price,
  locationName: "123 Main St, Mumbai",  // ← Gets geocoded to coordinates
  amenities, image, etc.
}
Response: Room with location: { type: "Point", coordinates: [lng, lat] }
```

### Bounds-Based Search
```
GET /api/rooms/search/by-bounds?neLat=19.5&neLng=73&swLat=19.0&swLng=72.5
Response: Rooms array within the bounding box
```

### Standard Room Listing
```
GET /api/rooms?location=Mumbai&minPrice=5000&maxPrice=20000
```

## Map Component Props

```javascript
<MapView
  ref={mapRef}                    // For parent to call highlight/center methods
  city={filters.location}         // City name to center map on
  rooms={rooms}                   // Array of room objects with location data
  height={350}                    // Map height in pixels or CSS value
  zoom={11}                       // Initial zoom level
  onBoundsChange={callback}       // Optional callback when bounds change
/>
```

## Room Data Shape

Rooms should have:
```javascript
{
  _id: "...",
  title: "Cozy Studio",
  price: 10000,
  locationName: "Bandra, Mumbai",
  location: {
    type: "Point",
    coordinates: [72.8345, 19.0596]  // [longitude, latitude]
  },
  image: "...",
  images: ["...", "..."]
}
```

## Files Modified/Created

- `frontend/src/components/MapView.jsx` - Map component with interactions
- `frontend/src/components/MapView.css` - Marker and popup styling
- `frontend/src/pages/RoomsPage.jsx` - Integrated MapView into room listings
- `backend/models/Room.js` - Added GeoJSON location field with 2dsphere index
- `backend/controllers/roomController.js` - Geocoding on room create/update
- `backend/routes/roomRoutes.js` - Added `/search/by-bounds` endpoint
- `backend/utils/geocoding.js` - Mapbox geocoding utility with Axios
- `frontend/src/api.js` - Added `searchByBounds()` API method

## Styling

Map styling is in `frontend/src/components/MapView.css`:
- `.rv-price-bubble` - Price display on markers
- `.rv-marker-highlighted` - Highlight effect on hover
- `.rv-popup-card` - Rich popup card styling

All styling uses CSS for maximum compatibility.
