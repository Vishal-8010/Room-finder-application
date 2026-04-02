// Routing machine for directions
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import MapSkeleton from './MapSkeleton';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import './MapView.css';

function formatPriceINR(price) {
    if (price == null) return '';
    try {
        return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price);
    } catch (e) {
        return `₹${price}`;
    }
}

const MapView = forwardRef(function MapView({ city = '', rooms = [], places = [], height = 400, zoom = 11, onPlaceClick = null, selectedPlaceId = null, loading = false }, ref) {
            const mapContainer = useRef(null);
            const mapRef = useRef(null);
            const markersRef = useRef([]); // { marker, roomId }
            const placesRef = useRef([]); // { marker, placeId }
            const [center] = useState([20.5937, 78.9629]);
            const [userLocation, setUserLocation] = useState(null);

            // Haversine distance helper (meters)
            function computeDistance(lat1, lon1, lat2, lon2) {
                function toRad(n) { return n * Math.PI / 180; }
                const R = 6371000;
                const dLat = toRad(lat2 - lat1);
                const dLon = toRad(lon2 - lon1);
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            }

            useImperativeHandle(ref, () => ({
                highlightMarker: (roomId) => {
                    markersRef.current.forEach(({ marker, roomId: id }) => {
                        if (!marker || !marker._icon) return;
                        if (id === roomId) marker._icon.classList.add('rv-marker-highlighted');
                        else marker._icon.classList.remove('rv-marker-highlighted');
                    });
                },
                clearHighlight: () => {
                    markersRef.current.forEach(({ marker }) => {
                        if (marker && marker._icon) marker._icon.classList.remove('rv-marker-highlighted');
                    });
                },
                centerOnMarker: (roomId) => {
                    const m = markersRef.current.find(({ roomId: id }) => id === roomId);
                    if (m && m.marker && mapRef.current) mapRef.current.setView(m.marker.getLatLng(), 14, { animate: true });
                }
            }), []);

            // Initialize map
            useEffect(() => {
                if (mapRef.current) return;
                if (!mapContainer.current) return; // Safety check: container must exist

                // Determine initial center/zoom
                let initialCenter = center;
                let initialZoom = zoom;
                if (rooms && rooms.length === 1) {
                    const r = rooms[0];
                    let coords = null;
                    if (r.coordinates && Array.isArray(r.coordinates) && r.coordinates.length >= 2) coords = [r.coordinates[1], r.coordinates[0]];
                    else if (r.locationCoords && Array.isArray(r.locationCoords) && r.locationCoords.length >= 2) coords = [r.locationCoords[1], r.locationCoords[0]];
                    else if (r.latitude != null && r.longitude != null) coords = [parseFloat(r.latitude), parseFloat(r.longitude)];
                    if (coords) {
                        initialCenter = coords;
                        initialZoom = 15;
                    }
                }

                mapRef.current = L.map(mapContainer.current).setView(initialCenter, initialZoom);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(mapRef.current);

                return () => {
                    try {
                        if (mapRef.current) {
                            mapRef.current.remove();
                            mapRef.current = null;
                        }
                    } catch (err) {
                        console.warn('Error removing map', err);
                    }
                };
            }, []); // eslint-disable-line

            // Update room markers and user marker
            useEffect(() => {
                if (!mapRef.current) return;

                // Clear existing markers
                markersRef.current.forEach(({ marker }) => { try { marker.remove(); } catch (e) {} });
                markersRef.current = [];

                // Add room markers
                (rooms || []).forEach((room) => {
                    let coords = null;
                    if (room.coordinates && Array.isArray(room.coordinates) && room.coordinates.length >= 2) coords = [room.coordinates[1], room.coordinates[0]];
                    else if (room.locationCoords && Array.isArray(room.locationCoords) && room.locationCoords.length >= 2) coords = [room.locationCoords[1], room.locationCoords[0]];
                    else if (room.latitude != null && room.longitude != null) coords = [parseFloat(room.latitude), parseFloat(room.longitude)];
                    if (!coords) return;

                    const icon = L.divIcon({ className: 'rv-marker', html: `<div class="rv-price-bubble">${formatPriceINR(room.price)}</div>` });
                    const marker = L.marker(coords, { icon }).addTo(mapRef.current);

                    let imgUrl = room.images && room.images.length > 0 ? room.images[0] : (room.image || '');
                    let safeImg = '/images/rooms/placeholder.jpg';
                    if (imgUrl) {
                        if (imgUrl.startsWith('http')) safeImg = imgUrl;
                        else if (imgUrl.startsWith('/uploads/rooms/')) safeImg = imgUrl;
                        else if (imgUrl.startsWith('/')) safeImg = imgUrl;
                        else safeImg = `/uploads/rooms/${imgUrl}`;
                    }

                    const popupHTML = `
        <div class="rv-popup-card">
          <img src="${safeImg}" alt="${room.title || 'Listing'}" class="rv-popup-image" onerror="this.onerror=null;this.src='/images/rooms/placeholder.jpg';" />
          <div class="rv-popup-content">
            <h3 class="rv-popup-title">${room.title || 'Listing'}</h3>
            <div class="rv-popup-price">${formatPriceINR(room.price)}<span>/month</span></div>
            <a href="/room/${room._id}" class="rv-popup-button">View Details</a>
          </div>
        </div>
      `;

                    marker.bindPopup(popupHTML);
                    markersRef.current.push({ marker, roomId: room._id });
                });

                // User location marker
                if (userLocation) {
                    const um = L.marker(userLocation, {
                        icon: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] })
                    }).addTo(mapRef.current);
                    um.bindPopup('<b>Your Location</b>');
                    markersRef.current.push({ marker: um, roomId: 'user' });
                }

                // Optionally fit bounds when we have both rooms and user location
                if ((rooms || []).length > 0 && userLocation) {
                    const pts = (rooms || []).map(r => {
                        if (r.coordinates && Array.isArray(r.coordinates) && r.coordinates.length >= 2) return [r.coordinates[1], r.coordinates[0]];
                        if (r.locationCoords && Array.isArray(r.locationCoords) && r.locationCoords.length >= 2) return [r.locationCoords[1], r.locationCoords[0]];
                        if (r.latitude != null && r.longitude != null) return [parseFloat(r.latitude), parseFloat(r.longitude)];
                        return null;
                    }).filter(Boolean);
                    const bounds = L.latLngBounds([...pts, userLocation]);
                    try { mapRef.current.fitBounds(bounds, { padding: [40, 40] }); } catch (e) {}
                }

            }, [rooms, userLocation]);

            // Render nearby places
            useEffect(() => {
                        if (!mapRef.current) return;

                        placesRef.current.forEach(m => { try { m.marker.remove(); } catch (e) {} });
                        placesRef.current = [];
                        if (!places || places.length === 0) return;

                        // Reference point for distance: room center or user
                        let refPoint = null;
                        if (rooms && rooms.length > 0) {
                            const r = rooms[0];
                            if (r.coordinates && Array.isArray(r.coordinates)) refPoint = [r.coordinates[1], r.coordinates[0]];
                            else if (r.locationCoords && Array.isArray(r.locationCoords)) refPoint = [r.locationCoords[1], r.locationCoords[0]];
                            else if (r.latitude != null && r.longitude != null) refPoint = [parseFloat(r.latitude), parseFloat(r.longitude)];
                        }
                        if (!refPoint && userLocation) refPoint = userLocation;

                        (places || []).forEach(place => {
                                    if (place.lat == null || place.lon == null) return;
                                    const marker = L.circleMarker([place.lat, place.lon], { radius: 8, color: '#007bff', fillColor: '#007bff', fillOpacity: 0.9, weight: 1 }).addTo(mapRef.current);
                                    const distMeters = refPoint ? Math.round(computeDistance(refPoint[0], refPoint[1], place.lat, place.lon)) : null;
                                    const distText = distMeters == null ? '' : (distMeters > 1000 ? `${(distMeters / 1000).toFixed(2)} km` : `${distMeters} m`);
                                    const label = place.name || (place.tags && (place.tags.name || place.tags.amenity)) || 'Place';
                                    const cat = place.category || (place.tags && (place.tags.amenity || place.tags.shop || place.tags.tourism || ''));
                                    const popup = `<div style="max-width:240px"><strong style="font-size:14px">${label}</strong><div style="color:#666;margin-top:6px">${cat}${distText ? ` • <small>${distText}</small>` : ''}</div></div>`;
      marker.bindPopup(popup);

      // keep id and click handler
      marker.on('click', () => {
        try { marker.openPopup(); } catch (e) {}
        if (onPlaceClick) onPlaceClick(place);
      });

      placesRef.current.push({ marker, placeId: place.id, place });
    });

    // Handle programmatic selection highlight
    if (selectedPlaceId) {
      placesRef.current.forEach(({ marker, placeId }) => {
        if (!marker) return;
        if (placeId === selectedPlaceId) {
          try {
            marker.setStyle({ radius: 12, color: '#ff5a5f', fillColor: '#ff5a5f', fillOpacity: 1 });
            marker.openPopup();
            if (mapRef.current) mapRef.current.setView(marker.getLatLng(), Math.max(mapRef.current.getZoom(), 15), { animate: true });
          } catch (e) {}
        } else {
          try { marker.setStyle({ radius: 8, color: '#007bff', fillColor: '#007bff', fillOpacity: 0.9 }); } catch (e) {}
        }
      });
    } else {
      // ensure default style
      placesRef.current.forEach(({ marker }) => { try { marker.setStyle({ radius: 8, color: '#007bff', fillColor: '#007bff', fillOpacity: 0.9 }); } catch (e) {} });
    }

    return () => { placesRef.current.forEach(p => { try { if (p.marker && p.marker.off) p.marker.off(); if (p.marker && p.marker.remove) p.marker.remove(); } catch (e) {} }); placesRef.current = []; };
  }, [places, rooms, userLocation, onPlaceClick, selectedPlaceId]);

  // Routing
  const [routingControl, setRoutingControl] = useState(null);
  const [routingError, setRoutingError] = useState(null);
  const [travelMode, setTravelMode] = useState('car');
  const [liveNavActive, setLiveNavActive] = useState(false);
  const [remainingDistance, setRemainingDistance] = useState(null);
  const watchIdRef = useRef(null);

  function getProfile(mode) { return mode === 'foot' ? 'foot' : mode === 'bike' ? 'bike' : 'car'; }

  // Patch _clearLines defensively
  useEffect(() => {
    try {
      if (!L || !L.Routing || !L.Routing.Control || !L.Routing.Control.prototype) return;
      const proto = L.Routing.Control.prototype;
      if (!proto.__safeClearLinesPatched) {
        const orig = proto._clearLines;
        proto._clearLines = function () {
          if (!this._map) return;
          try { return orig.apply(this, arguments); } catch (err) { console.warn('Safe _clearLines caught', err); }
        };
        proto.__safeClearLinesPatched = true;
      }
    } catch (err) { /* ignore */ }
  }, []);

  const handleShowRoute = () => {
    if (!mapRef.current || !rooms || rooms.length === 0) return;
    let coords = null;
    const r = rooms[0];
    if (r.coordinates && Array.isArray(r.coordinates) && r.coordinates.length >= 2) coords = [r.coordinates[1], r.coordinates[0]];
    else if (r.locationCoords && Array.isArray(r.locationCoords) && r.locationCoords.length >= 2) coords = [r.locationCoords[1], r.locationCoords[0]];
    else if (r.latitude != null && r.longitude != null) coords = [parseFloat(r.latitude), parseFloat(r.longitude)];
    if (!coords) { setRoutingError('Room location not available'); return; }

    const doRouting = (userLatLng) => {
      setRoutingError(null);
      try { if (routingControl && mapRef.current) mapRef.current.removeControl(routingControl); } catch (e) {}

      const control = L.Routing.control({
        waypoints: [L.latLng(userLatLng[0], userLatLng[1]), L.latLng(coords[0], coords[1])],
        router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: getProfile(travelMode) }),
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: () => null,
      }).addTo(mapRef.current);

      setRoutingControl(control);

      control.on('routesfound', (e) => {
        if (e.routes && e.routes[0] && e.routes[0].summary) {
          setRemainingDistance(e.routes[0].summary.totalDistance);
        }
      });

      control.on('routingerror', () => {
        setRoutingError('Could not calculate route');
        setRemainingDistance(null);
      });
    };

    if (userLocation) doRouting(userLocation);
    else if (!navigator.geolocation) setRoutingError('Geolocation not supported');
    else {
      navigator.geolocation.getCurrentPosition((pos) => { const ul = [pos.coords.latitude, pos.coords.longitude]; setUserLocation(ul); doRouting(ul); }, () => setRoutingError('Could not get your location'));
    }
  };

  // Cleanup routing control and geolocation on unmount/change
  useEffect(() => {
    return () => {
      if (routingControl) {
        try {
          if (mapRef.current) mapRef.current.removeControl(routingControl);
          else if (typeof routingControl._clearLines === 'function') routingControl._clearLines();
        } catch (err) { console.warn('Error during routing cleanup', err); }
      }
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [routingControl]);

  if (loading) {
    return <MapSkeleton />;
  }
  return (
    <div className="rv-map-wrapper" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      <div ref={mapContainer} className="rv-map-container" />

      {rooms && rooms.length > 0 && (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={travelMode} onChange={e => setTravelMode(e.target.value)} title="Travel Mode" style={{ borderRadius: 6, padding: '6px 10px', fontWeight: 600, border: '1px solid #ccc', outline: 'none', background: 'white', color: '#222' }}>
            <option value="car">Driving</option>
            <option value="foot">Walking</option>
            <option value="bike">Cycling</option>
          </select>
          <button onClick={handleShowRoute} style={{ background: '#ff5a5f', color: 'white', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}>
            Show Route from My Location
          </button>
          {routingControl && !liveNavActive && (
            <button onClick={() => {
              setLiveNavActive(true);
              if (navigator.geolocation) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                  pos => {
                    const ul = [pos.coords.latitude, pos.coords.longitude];
                    setUserLocation(ul);
                    // Update remaining distance
                    if (routingControl && routingControl._routes && routingControl._routes[0]) {
                      const dest = routingControl._routes[0].waypoints[routingControl._routes[0].waypoints.length - 1].latLng;
                      const dist = computeDistance(ul[0], ul[1], dest.lat, dest.lng);
                      setRemainingDistance(dist);
                    }
                  },
                  err => setRoutingError('Live navigation error'),
                  { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
                );
              }
            }} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}>
              Start Live Navigation
            </button>
          )}
          {liveNavActive && (
            <button onClick={() => {
              setLiveNavActive(false);
              if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
              }
            }} style={{ background: '#aaa', color: 'white', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}>
              Stop Live Navigation
            </button>
          )}
        </div>
      )}

      {routingError && (
        <div style={{ position: 'absolute', top: 60, right: 10, zIndex: 1000, background: '#fff0f0', color: '#b00020', border: '1px solid #b00020', borderRadius: 6, padding: '8px 14px', fontWeight: 600 }}>
          {routingError}
        </div>
      )}

      {routingControl && remainingDistance != null && (
        <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 1000, background: 'white', color: '#222', border: '1px solid #007bff', borderRadius: 6, padding: '12px 18px', fontWeight: 700, minWidth: 220 }}>
          Remaining Distance: {remainingDistance > 1000 ? `${(remainingDistance / 1000).toFixed(2)} km` : `${Math.round(remainingDistance)} m`}
        </div>
      )}

    </div>
  );
});

export default MapView;