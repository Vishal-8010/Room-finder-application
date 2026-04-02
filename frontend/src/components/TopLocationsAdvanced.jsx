import React, { useState, useRef, useEffect } from 'react';
import MapView from './MapView';
import { fetchNearbyPlaces } from '../utils/places';

export default function TopLocationsAdvanced({ topLocations, rooms }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('count');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const mapRef = useRef();

  // Filter and sort locations
  let filtered = topLocations.filter(loc => loc.location.toLowerCase().includes(search.toLowerCase()));
  if (sortBy === 'count') filtered = filtered.sort((a, b) => b.count - a.count);
  else filtered = filtered.sort((a, b) => a.location.localeCompare(b.location));

  // Highlight rooms for selected location
  const highlightRooms = selectedLocation
    ? rooms.filter(r => r.locationName === selectedLocation)
    : rooms;

  // Load nearby places for the first highlighted room
  useEffect(() => {
    const loadPlacesForLocation = async () => {
      if (!highlightRooms || highlightRooms.length === 0) {
        setNearbyPlaces([]);
        return;
      }
      try {
        const room = highlightRooms[0];
        let lat, lon;
        if (room.coordinates && Array.isArray(room.coordinates)) {
          lat = room.coordinates[1];
          lon = room.coordinates[0];
        } else if (room.locationCoords && Array.isArray(room.locationCoords)) {
          lat = room.locationCoords[1];
          lon = room.locationCoords[0];
        } else if (room.latitude != null && room.longitude != null) {
          lat = parseFloat(room.latitude);
          lon = parseFloat(room.longitude);
        }
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) return;
        const places = await fetchNearbyPlaces(lat, lon, 3000, 40);
        setNearbyPlaces(places || []);
      } catch (err) {
        console.error('Error loading nearby places for location:', err);
        setNearbyPlaces([]);
      }
    };
    loadPlacesForLocation();
  }, [highlightRooms]);

  return (
    <div className="mb-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-dark mb-4">Top Locations by Room Count</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-lg w-48"
            />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="count">Sort by Count</option>
              <option value="location">Sort by Name</option>
            </select>
          </div>
          <ul className="divide-y divide-gray-200">
            {filtered.map((item, idx) => (
              <li
                key={idx}
                className={`py-3 flex items-center justify-between cursor-pointer transition ${selectedLocation === item.location ? 'bg-primary/10' : ''}`}
                onClick={() => setSelectedLocation(item.location)}
              >
                <span className="font-medium text-dark">{item.location}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-light rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(item.count / filtered[0].count) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-dark">{item.count}</span>
                </div>
              </li>
            ))}
          </ul>
          {selectedLocation && (
            <button className="mt-4 px-4 py-2 bg-gray-300 rounded-lg text-dark font-semibold" onClick={() => setSelectedLocation(null)}>
              Clear Highlight
            </button>
          )}
        </div>
        <div className="flex-1 min-w-[300px]">
          {/* Interactive Map: highlights selected location's rooms */}
          <MapView
            ref={mapRef}
            rooms={highlightRooms}
            places={nearbyPlaces}
            height={340}
            zoom={selectedLocation ? 10 : 6}
            loading={false}
            city={selectedLocation || ''}
          />
        </div>
      </div>
    </div>
  );
}