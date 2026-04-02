import React, { useRef, useEffect } from 'react';
import { reverseGeocode } from '../utils/geocode';
import { geocodeByName } from '../utils/geocode';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapLocationPicker({ latitude, longitude, locationName, onLocationChange }) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('location-picker-map').setView([latitude || 20.5937, longitude || 78.9629], latitude && longitude ? 15 : 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapRef.current);
            mapRef.current.on('click', async function(e) {
                const { lat, lng } = e.latlng;
                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                } else {
                    markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
                    markerRef.current.on('dragend', async function(ev) {
                        const pos = ev.target.getLatLng();
                        const locationName = await reverseGeocode(pos.lat, pos.lng);
                        onLocationChange(pos.lat, pos.lng, locationName);
                    });
                }
                const locationName = await reverseGeocode(lat, lng);
                onLocationChange(lat, lng, locationName);
            });

            // If there's a locationName provided but no numeric coords, try geocoding it now
            if (locationName && (!latitude || !longitude)) {
                (async() => {
                    try {
                        const geo = await geocodeByName(locationName);
                        if (geo && mapRef.current) {
                            mapRef.current.setView([geo.latitude, geo.longitude], 15);
                            if (markerRef.current) {
                                markerRef.current.setLatLng([geo.latitude, geo.longitude]);
                            } else {
                                markerRef.current = L.marker([geo.latitude, geo.longitude], { draggable: true }).addTo(mapRef.current);
                                markerRef.current.on('dragend', async function(ev) {
                                    const pos = ev.target.getLatLng();
                                    const locName = await reverseGeocode(pos.lat, pos.lng);
                                    onLocationChange(pos.lat, pos.lng, locName);
                                });
                            }
                            // Update parent state with resolved coordinates (use display_name if available)
                            onLocationChange(geo.latitude, geo.longitude, geo.display_name || locationName);
                        }
                    } catch (err) {
                        console.error('Error geocoding initial locationName:', err);
                    }
                })();
            }
        }
        if (latitude && longitude && mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
            if (markerRef.current) {
                markerRef.current.setLatLng([latitude, longitude]);
            } else {
                markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(mapRef.current);
                markerRef.current.on('dragend', async function(ev) {
                    const pos = ev.target.getLatLng();
                    const locationName = await reverseGeocode(pos.lat, pos.lng);
                    onLocationChange(pos.lat, pos.lng, locationName);
                });
            }
        }
        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, [latitude, longitude, onLocationChange, locationName]);

    // Refresh marker when locationName changes (debounced)
    useEffect(() => {
        let timeoutId;
        async function updateMarkerByLocationName() {
            // Quick exit if there's no location name or map isn't ready yet
            if (!locationName) return;
            if (!mapRef.current) return;
            try {
                const geo = await geocodeByName(locationName);
                // If component unmounted while awaiting, mapRef.current may have been cleared
                if (!geo || !mapRef.current) return;
                mapRef.current.setView([geo.latitude, geo.longitude], 15);
                if (markerRef.current) {
                    markerRef.current.setLatLng([geo.latitude, geo.longitude]);
                } else {
                    markerRef.current = L.marker([geo.latitude, geo.longitude], { draggable: true }).addTo(mapRef.current);
                    markerRef.current.on('dragend', async function(ev) {
                        const pos = ev.target.getLatLng();
                        const locationName = await reverseGeocode(pos.lat, pos.lng);
                        onLocationChange(pos.lat, pos.lng, locationName);
                    });
                }
                // Notify parent that we resolved a geocode (use display_name if available)
                onLocationChange(geo.latitude, geo.longitude, geo.display_name || locationName);
            } catch (err) {
                console.error('Error updating marker by location name:', err);
            }
        }
        if (locationName) {
            timeoutId = setTimeout(updateMarkerByLocationName, 500);
        }
        return () => clearTimeout(timeoutId);
    }, [locationName]);

    return <div id = "location-picker-map"
    style = {
        { width: '100%', height: '100%' }
    } > < /div>;
}