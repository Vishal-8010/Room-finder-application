import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { roomAPI } from '../api';
import RoomCard from '../components/RoomCard';
import MapView from '../components/MapView';
import { FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { fetchNearbyPlaces } from '../utils/places';

export default function RoomsPage() {
    const [searchParams] = useSearchParams();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const mapRef = useRef(null);
    const [filters, setFilters] = useState({
        location: searchParams.get('location') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        amenities: [],
    });

    // Sync filters with searchParams when URL changes
    useEffect(() => {
        setFilters({
            location: searchParams.get('location') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            amenities: [],
        });
    }, [searchParams]);

    const fetchRooms = useCallback(async() => {
        setLoading(true);
        try {
            const params = {
                location: filters.location || undefined,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
                amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
            };
            const response = await roomAPI.getAllRooms(params);
            setRooms(response.data.rooms || []);
        } catch (error) {
            toast.error('Failed to fetch rooms');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Fetch rooms when filters change
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({...prev, [name]: value }));
    };

    const amenitiesList = ['WiFi', 'AC', 'Bed', 'Table', 'Chair', 'Kitchen', 'Bathroom', 'Parking'];

    const toggleAmenity = (amenity) => {
        setFilters((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity) ?
                prev.amenities.filter((a) => a !== amenity) :
                [...prev.amenities, amenity],
        }));
    };

    const handleApplyFilters = () => {
        fetchRooms();
        setShowFilters(false);
    };

    const handleReset = () => {
        setFilters({
            location: '',
            minPrice: '',
            maxPrice: '',
            amenities: [],
        });
    };

    const handleCardHover = (roomId) => {
        mapRef.current?.highlightMarker(roomId);
    };

    const handleCardLeave = () => {
        mapRef.current?.clearHighlight();
    };

    const handleCardClick = (roomId) => {
        mapRef.current?.centerOnMarker(roomId);
    };

    // Load nearby places for the first room in results
    useEffect(() => {
        const loadPlacesForResults = async () => {
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
                console.error('Error loading nearby places for results:', err);
                setNearbyPlaces([]);
            }
        };
        loadPlacesForResults();
    }, [rooms]);

    return (
        <div className="min-h-screen bg-light py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Map Section */}
                {rooms.length > 0 && (
                    <div className="mb-8 rounded-lg overflow-hidden shadow-md">
                        <MapView
                            ref={mapRef}
                            city={filters.location}
                            rooms={rooms}
                            places={nearbyPlaces}
                            height={350}
                            zoom={11}
                        />
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full md:w-64">
                        <div className={`bg-white rounded-lg shadow-md p-6 sticky top-20 ${showFilters ? 'block' : 'hidden md:block'}`}>
                            <div className="flex justify-between items-center mb-6 md:hidden">
                                <h2 className="text-lg font-bold">Filters</h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-secondary hover:text-dark"
                                >
                                    ✕
                                </button>
                            </div>

                            <h2 className="text-lg font-bold text-dark mb-4 hidden md:block">Filters</h2>

                            {/* Location Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-dark mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                    placeholder="Search location..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
                                />
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-dark mb-2">
                                    Price Range (₹)
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        name="minPrice"
                                        value={filters.minPrice}
                                        onChange={handleFilterChange}
                                        placeholder="Min"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
                                    />
                                    <input
                                        type="number"
                                        name="maxPrice"
                                        value={filters.maxPrice}
                                        onChange={handleFilterChange}
                                        placeholder="Max"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
                                    />
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-dark mb-3">
                                    Amenities
                                </label>
                                <div className="space-y-2">
                                    {amenitiesList.map((amenity) => (
                                        <label key={amenity} className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.amenities.includes(amenity)}
                                                onChange={() => toggleAmenity(amenity)}
                                                className="mr-2 w-4 h-4 accent-primary"
                                            />
                                            <span className="text-sm text-secondary">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Buttons */}
                            <div className="space-y-2">
                                <button
                                    onClick={handleApplyFilters}
                                    className="w-full bg-primary hover:bg-red-500 text-white font-medium py-2 rounded-lg transition"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full bg-light hover:bg-gray-200 text-dark font-medium py-2 rounded-lg border border-gray-300 transition"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden w-full mb-6 bg-primary hover:bg-red-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition"
                        >
                            <FaFilter /> Filters
                        </button>
                    </div>

                    {/* Rooms Grid */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-dark">
                                {filters.location ? `Rooms in ${filters.location}` : 'All Rooms'}
                            </h1>
                            <p className="text-secondary mt-2">
                                {rooms.length} room{rooms.length !== 1 ? 's' : ''} found
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-secondary">Loading rooms...</p>
                                </div>
                            </div>
                        ) : rooms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rooms.map((room) => (
                                    <RoomCard
                                        key={room._id}
                                        room={room}
                                        onFavoriteChange={fetchRooms}
                                        onMouseEnter={handleCardHover}
                                        onMouseLeave={handleCardLeave}
                                        onClick={handleCardClick}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <div className="text-4xl mb-4">🔍</div>
                                <h2 className="text-xl font-bold text-dark mb-2">No rooms found</h2>
                                <p className="text-secondary mb-6">
                                    Try adjusting your filters or search for a different location.
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="bg-primary hover:bg-red-500 text-white font-medium py-2 px-6 rounded-lg transition"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}