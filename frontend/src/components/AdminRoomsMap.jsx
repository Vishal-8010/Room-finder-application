import React, { useState, useEffect } from 'react';
import MapView from './MapView';
import { fetchNearbyPlaces } from '../utils/places';

export default function AdminRoomsMap({ rooms, loading }) {
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Load nearby places for the first room in admin map
  useEffect(() => {
    const loadPlacesForAdmin = async () => {
      if (!rooms || rooms.length === 0) {
        setNearbyPlaces([]);
        return;
      }
      try {
        const room = rooms[0];
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
        console.error('Error loading nearby places for admin map:', err);
        setNearbyPlaces([]);
      }
    };
    loadPlacesForAdmin();
  }, [rooms]);

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold text-dark mb-4">Rooms Map Overview</h2>
      <MapView 
        rooms={rooms} 
        places={nearbyPlaces}
        height={400} 
        loading={loading} 
      />
      {/* Add advanced controls here: filter, cluster toggle, etc. */}
    </div>
  );
}
