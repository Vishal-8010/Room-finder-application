import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { FaStar, FaHeart, FaRegHeart, FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronLeft, FaChevronRight, FaComment } from 'react-icons/fa';
import { roomAPI, reviewAPI, favoriteAPI, connectionAPI, messageAPI } from '../api';
import { fetchNearbyPlaces } from '../utils/places';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
const MapView = lazy(() => import('../components/MapView'));


export default function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyLoaded, setNearbyLoaded] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [placeFilter, setPlaceFilter] = useState('');
  const [nearbyExpanded, setNearbyExpanded] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const previewLimit = 6;

  const computeDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const toRad = n => n * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  function getCategoryEmoji(cat) {
    if (!cat) return '📍';
    const c = cat.toLowerCase();
    if (c.includes('cafe')) return '☕';
    if (c.includes('restaurant') || c.includes('food')) return '🍴';
    if (c.includes('bank') || c.includes('atm')) return '🏦';
    if (c.includes('pharmacy') || c.includes('drug')) return '💊';
    if (c.includes('hospital') || c.includes('clinic')) return '🏥';
    if (c.includes('school') || c.includes('university')) return '🎓';
    if (c.includes('bus') || c.includes('station') || c.includes('stop')) return '🚌';
    if (c.includes('supermarket') || c.includes('convenience') || c.includes('shop')) return '🛒';
    if (c.includes('bar')) return '🍺';
    return '📍';
  }
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  const [connectData, setConnectData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    moveInDate: '',
    duration: '12 months',
    message: '',
  });

  const fetchRoomDetails = useCallback(async () => {
    setLoading(true);
    try {
      const roomRes = await roomAPI.getRoomById(roomId);

      const roomData = roomRes.data.room;
      setRoom(roomData);

      // Do not fetch reviews or nearby by default to keep initial load light
      // They will be loaded on demand via buttons below

      if (user) {
        const favRes = await favoriteAPI.checkIsFavorite(roomId);
        setIsFavorite(favRes.data.isFavorite);
      }
    } catch (error) {
      toast.error('Failed to load room details');
    } finally {
      setLoading(false);
    }
  }, [roomId, user]);

  useEffect(() => {
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  const handleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoriteAPI.removeFromFavorites(roomId);
      } else {
        await favoriteAPI.addToFavorites(roomId);
      }
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await connectionAPI.createConnection({
        roomId,
        ...connectData,
      });
      toast.success('Connection request sent!');
      setShowConnectModal(false);
      setConnectData({
        studentName: '',
        studentEmail: '',
        studentPhone: '',
        moveInDate: '',
        duration: '12 months',
        message: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send connection request');
    }
  };

  const loadReviews = useCallback(async () => {
    try {
      const reviewRes = await reviewAPI.getRoomReviews(roomId);
      setReviews(reviewRes.data.reviews || []);
      setReviewsLoaded(true);
    } catch (error) {
      toast.error('Failed to load reviews');
    }
  }, [roomId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!reviewForm.title || !reviewForm.comment) {
      toast.error('Please fill in all review fields');
      return;
    }

    setSubmitReviewLoading(true);
    try {
      await reviewAPI.createReview({
        roomId,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      toast.success('Review submitted successfully!');
      setReviewForm({
        rating: 5,
        title: '',
        comment: '',
      });
      // Refresh reviews
      await loadReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitReviewLoading(false);
    }
  };

  const handleMessageOwner = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Send an initial message to start the conversation
      await messageAPI.sendMessage(room.owner._id, `Hi! I'm interested in your room: ${room.title}`);
      toast.success('Message sent! Check your messages to continue the conversation.');
      navigate('/messages');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const loadNearbyPlaces = useCallback(async () => {
    if (!room) {
      console.warn('No room data available');
      toast.error('Room data not available');
      return;
    }
    
    // Get latitude and longitude from various possible formats
    let lat = room.latitude;
    let lon = room.longitude;
    
    // Try locationCoords format [lon, lat]
    if (!lat && room.locationCoords && room.locationCoords.length >= 2) {
      lat = room.locationCoords[1];
      lon = room.locationCoords[0];
    }
    
    // Try location.coordinates format {type: 'Point', coordinates: [lon, lat]}
    if (!lat && room.location && room.location.coordinates && room.location.coordinates.length >= 2) {
      lat = room.location.coordinates[1];
      lon = room.location.coordinates[0];
    }
    
    // Validate coordinates
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      console.warn('Invalid coordinates', { lat, lon });
      toast.error('Room location coordinates invalid');
      return;
    }
    
    try {
      console.log('Loading nearby places for:', { lat, lon });
      const places = await fetchNearbyPlaces(parseFloat(lat), parseFloat(lon), 3000, 40);
      
      if (!places || !Array.isArray(places)) {
        console.warn('Unexpected places response format:', places);
        setNearbyPlaces([]);
        setNearbyLoaded(true);
        return;
      }
      
      setNearbyPlaces(places);
      setNearbyLoaded(true);
      
      if (places.length === 0) {
        console.info('No nearby places found for area');
      } else {
        console.info(`Loaded ${places.length} nearby places`);
      }
    } catch (err) {
      console.error('Error loading nearby places:', err);
      setNearbyPlaces([]);
      setNearbyLoaded(true);
      toast.error('Failed to load nearby places: ' + (err.message || 'Unknown error'));
    }
  }, [room]);

  const nextImage = () => {
    const images = room?.images || (room?.image ? [room.image] : []);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = room?.images || (room?.image ? [room.image] : []);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark mb-4">Room not found</h1>
          <button
            onClick={() => navigate('/rooms')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-500 transition"
          >
            Back to rooms
          </button>
        </div>
      </div>
    );
  }

  // Normalize images to absolute safe URLs (handle filenames, partial paths, or objects)
  const rawImages = room.images && room.images.length > 0 ? room.images : [room.image || null];
  const getSafeImage = (img) => {
    if (!img) return '/images/rooms/placeholder.jpg';
    // support objects with url field
    if (typeof img === 'object') img = img.url || img.path || '';
    if (!img) return '/images/rooms/placeholder.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return img;
    if (img.startsWith('uploads/')) return `/${img}`;
    if (img.startsWith('/uploads/rooms/') || img.startsWith('/uploads/')) return img;
    return `/uploads/rooms/${img}`;
  };
  const images = rawImages.map(getSafeImage);

  return (
    <div className="min-h-screen bg-light py-8 px-4 room-detail-bg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary hover:text-red-500 font-medium mb-6 transition px-3 py-2 rounded-lg"
        >
          <FaChevronLeft className="mr-2" /> Back
        </button>

        {/* Image Gallery */}
        <div className="relative nb-card overflow-hidden mb-8 aspect-video room-detail-card">
          <img
            src={images[currentImageIndex]}
            alt="Room"
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = '/images/rooms/placeholder.jpg'; }}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-dark p-2 rounded-full transition z-10"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-dark p-2 rounded-full transition z-10"
              >
                <FaChevronRight />
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Map Section: Show map for this room with direction button (lazy-loaded) */}
        <div className="mb-8 nb-card overflow-hidden room-detail-card">
          {!mapVisible ? (
            <div className="h-80 grid place-items-center bg-gray-100 rounded-md p-6">
              <div className="text-center">
                <p className="mb-3 text-sm text-secondary">Map and nearby places are lazy-loaded to improve page speed.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={async () => { setMapVisible(true); if (!nearbyLoaded) await loadNearbyPlaces(); }} className="btn-nb">Show map</button>
                  {!nearbyLoaded && <button onClick={loadNearbyPlaces} className="px-3 py-2 border rounded text-sm">Load nearby</button>}
                </div>
              </div>
            </div>
          ) : (
            <Suspense fallback={<div className="h-80 grid place-items-center">Loading map...</div>}>
              <MapView
                rooms={[room]}
                places={nearbyPlaces}
                height={350}
                zoom={15}
                onPlaceClick={(place) => setSelectedPlaceId(place.id)}
                selectedPlaceId={selectedPlaceId}
              />
            </Suspense>
          )}

          {/* Nearby Places Section - Only show when loaded */}
          {nearbyLoaded && nearbyPlaces.length > 0 && (
            <>
              <div className="mt-2 text-sm text-secondary">{nearbyLoaded ? `${nearbyPlaces.length} nearby places shown (within 3 km)` : 'Nearby places not loaded'}</div>

              {/* Nearby Places UI - concise preview with expand */}
              <div className="bg-white p-4 rounded-b-lg room-detail-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-dark">Nearby Places</h3>
                  <div className="text-sm text-secondary">{nearbyLoaded ? `${nearbyPlaces.length} places • within 3 km` : 'Not loaded'}</div>
                </div>

                {/** Compute filtered set once **/}
                {(() => {
                  const filtered = nearbyPlaces.filter(p => !placeFilter || (p.category||'').toLowerCase() === placeFilter.toLowerCase());
              if (!nearbyExpanded) {
                return (
                  <>
                    <div className="nearby-compact-list mb-3">
                      {filtered.slice(0, previewLimit).map((p) => {
                        const distMeters = computeDistance(
                          room.latitude || (room.locationCoords && room.locationCoords[1]),
                          room.longitude || (room.locationCoords && room.locationCoords[0]),
                          p.lat, p.lon
                        );
                        const distText = distMeters == null ? '' : (distMeters > 1000 ? `${(distMeters/1000).toFixed(2)} km` : `${Math.round(distMeters)} m`);
                        return (
                          <div key={p.id} className={`nearby-compact-item ${selectedPlaceId === p.id ? 'ring-2 ring-primary' : ''}`}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <div className="nearby-emoji">{getCategoryEmoji(p.category)}</div>
                                <div className="nearby-compact-name">{p.name}</div>
                              </div>
                              <div className="text-xs text-secondary">{distText}</div>
                            </div>
                            <div className="w-full flex gap-2 mt-2">
                              <button
                                onClick={async () => { if (!mapVisible) setMapVisible(true); if (!nearbyLoaded) await loadNearbyPlaces(); setSelectedPlaceId(p.id); }}
                                className="flex-1 btn-nb text-sm py-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition"
                              >
                                Show
                              </button>
                              <a
                                target="_blank"
                                rel="noreferrer"
                                href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}`}
                                className="px-3 py-1 rounded border text-sm nb-pill bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                              >
                                Open
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {filtered.length > previewLimit && (
                      <div className="flex justify-center">
                        <button onClick={() => setNearbyExpanded(true)} className="text-sm text-primary font-semibold">Show more ({filtered.length - previewLimit})</button>
                      </div>
                    )}
                  </>
                );
              }

              // Expanded: show filters + grid (more compact than before)
              return (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button onClick={() => setPlaceFilter('')} className={`px-3 py-1 rounded-full border ${placeFilter === '' ? 'bg-primary text-white' : 'bg-light text-dark'} text-sm`}>All</button>
                    {Array.from(new Set(nearbyPlaces.map(p => p.category || 'other'))).slice(0,8).map(cat => (
                      <button key={cat} onClick={() => setPlaceFilter(cat)} className={`px-3 py-1 rounded-full border ${placeFilter === cat ? 'bg-primary text-white' : 'bg-light text-dark'} text-sm`}>{cat}</button>
                    ))}
                    <div className="ml-auto">
                      <button onClick={() => setNearbyExpanded(false)} className="text-sm text-secondary">Show less</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filtered.map((p) => {
                      const distMeters = computeDistance(
                        room.latitude || (room.locationCoords && room.locationCoords[1]),
                        room.longitude || (room.locationCoords && room.locationCoords[0]),
                        p.lat, p.lon
                      );
                      const distText = distMeters == null ? '' : (distMeters > 1000 ? `${(distMeters/1000).toFixed(2)} km` : `${Math.round(distMeters)} m`);
                      return (
                        <div key={p.id} className={`p-2 rounded-lg border bg-light flex flex-col justify-between ${selectedPlaceId === p.id ? 'ring-2 ring-primary' : ''}`}>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold text-dark text-sm flex items-center gap-2"><span className="nearby-emoji">{getCategoryEmoji(p.category)}</span>{p.name}</div>
                              <div className="text-xs text-secondary">{distText}</div>
                            </div>
                            <div className="text-xs text-secondary mb-2">{p.category}</div>
                          </div>
                          <div className="flex items-center gap-2">
                              <button
                                onClick={async () => { if (!mapVisible) setMapVisible(true); if (!nearbyLoaded) await loadNearbyPlaces(); setSelectedPlaceId(p.id); }}
                                className="flex-1 btn-nb text-sm font-semibold py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
                              >
                                Show on map
                              </button>
                              <a
                                target="_blank"
                                rel="noreferrer"
                                href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}`}
                                className="px-3 py-2 rounded-lg border text-sm nb-pill bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                              >
                                Open
                              </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

              </div>
            </>
          )}

          {/* Show loading state when nearby not yet loaded */}
          {mapVisible && !nearbyLoaded && (
            <div className="bg-light p-4 rounded-lg text-center mt-6">
              <p className="text-secondary">Loading nearby places...</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 room-detail-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-dark mb-2 room-detail-title">{room.title}</h1>
                  <div className="flex items-center text-secondary room-detail-secondary">
                    <FaMapMarkerAlt className="mr-2" />
                    {room.locationName}
                  </div>
                </div>
                <button
                  onClick={handleFavorite}
                  className="bg-light hover:bg-gray-100 text-primary p-3 rounded-full transition text-xl"
                >
                  {isFavorite ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {room.rating > 0 ? (
                  <>
                    <FaStar className="text-yellow-400 mr-2" />
                    <span className="text-lg font-bold mr-2">{room.rating.toFixed(1)}</span>
                    <span className="text-secondary">({room.reviewCount} reviews)</span>
                  </>
                ) : (
                  <span className="text-secondary">No reviews yet</span>
                )}
              </div>

              {/* Price */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-3xl font-bold text-dark room-detail-title">
                  ₹{room.price} <span className="text-lg text-secondary font-normal room-detail-secondary">per month</span>
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-bold text-dark mb-2 room-detail-title">About this room</h3>
                <p className="text-secondary leading-relaxed room-detail-secondary">{room.description}</p>
              </div>
            </div>

            {/* Room Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 room-detail-card">
              <h3 className="text-xl font-bold text-dark mb-4 room-detail-title">Room Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {room.size && (
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">📐</span>
                    <div>
                      <p className="text-sm text-secondary room-detail-secondary">Size</p>
                      <p className="font-semibold text-dark room-detail-title">{room.size}</p>
                    </div>
                  </div>
                )}
                {room.deposit && (
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">💰</span>
                    <div>
                      <p className="text-sm text-secondary room-detail-secondary">Deposit</p>
                      <p className="font-semibold text-dark room-detail-title">₹{room.deposit}</p>
                    </div>
                  </div>
                )}
                {room.availableFrom && (
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">📅</span>
                    <div>
                      <p className="text-sm text-secondary room-detail-secondary">Available From</p>
                      <p className="font-semibold text-dark room-detail-title">
                        {new Date(room.availableFrom).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-3xl mr-3">✔️</span>
                  <div>
                    <p className="text-sm text-secondary room-detail-secondary">Verified</p>
                    <p className="font-semibold text-dark room-detail-title">{room.verified ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 room-detail-card">
                <h3 className="text-xl font-bold text-dark mb-4 room-detail-title">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center bg-light p-3 rounded-lg room-detail-card">
                      <span className="text-primary mr-2">✓</span>
                      <span className="text-dark">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6 room-detail-card">
              <h3 className="text-xl font-bold text-dark mb-4 room-detail-title">
                Reviews ({reviewsLoaded ? reviews.length : (room.reviewCount || 0)})
              </h3>

              {/* Review Submission Form */}
              <div className="bg-light rounded-lg p-6 mb-6 room-detail-card">
                <h4 className="text-lg font-semibold text-dark mb-4 room-detail-title">Leave a Review</h4>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2 room-detail-title">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          className="text-3xl transition"
                        >
                          <FaStar
                            className={star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2 room-detail-title">Review Title</label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Summary of your experience"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2 room-detail-title">Your Review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this room..."
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitReviewLoading}
                    className="w-full bg-primary hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {submitReviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              {!reviewsLoaded ? (
                <div className="text-center">
                  <button onClick={loadReviews} className="btn-nb">Load reviews</button>
                  <p className="text-sm text-secondary mt-2">Reviews are loaded on demand to improve initial page load.</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-dark">
                            {review.reviewer?.firstName} {review.reviewer?.lastName}
                          </p>
                          <p className="text-sm text-secondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span className="font-bold">{review.rating}/5</span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-dark mb-1">{review.title}</h4>
                      <p className="text-secondary">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
            <div className="lg:col-span-1">
            {/* Owner Info */}
            {room.owner && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24 room-detail-card">
                <h3 className="text-lg font-bold text-dark mb-4 room-detail-title">Hosted by</h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-lg font-bold mr-3">
                    {room.owner.firstName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-dark room-detail-title">
                      {room.owner.firstName} {room.owner.lastName}
                    </p>
                    {room.owner.rating > 0 && (
                      <div className="flex items-center text-sm">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span>{room.owner.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  {room.owner.phone && (
                    <a
                      href={`tel:${room.owner.phone}`}
                      className="flex items-center text-dark hover:text-primary transition"
                    >
                      <FaPhone className="mr-3 text-primary" />
                      {room.owner.phone}
                    </a>
                  )}
                  {room.owner.email && (
                    <a
                      href={`mailto:${room.owner.email}`}
                      className="flex items-center text-dark hover:text-primary transition text-sm break-all"
                    >
                      <FaEnvelope className="mr-3 text-primary flex-shrink-0" />
                      {room.owner.email}
                    </a>
                  )}
                </div>

                {/* Connect Button */}
                {user && user._id !== room.owner._id ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="w-full bg-primary hover:bg-red-500 text-white font-bold py-3 rounded-lg transition"
                    >
                      Connect with Owner
                    </button>
                    <button
                      onClick={handleMessageOwner}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <FaComment className="text-sm" />
                      Message Owner
                    </button>
                  </div>
                ) : user && user._id === room.owner._id ? (
                  <p className="text-center text-secondary room-detail-secondary">This is your room</p>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-primary hover:bg-red-500 text-white font-bold py-3 rounded-lg transition"
                  >
                    Login to Connect
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 room-detail-modal">
            <h2 className="text-2xl font-bold text-dark mb-4 room-detail-title">Connect with Owner</h2>
            
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2 room-detail-title">
                  Your Name
                </label>
                <input
                  type="text"
                  value={connectData.studentName}
                  onChange={(e) =>
                    setConnectData({ ...connectData, studentName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2 room-detail-title">
                  Your Email
                </label>
                <input
                  type="email"
                  value={connectData.studentEmail}
                  onChange={(e) =>
                    setConnectData({ ...connectData, studentEmail: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2 room-detail-title">
                  Your Phone
                </label>
                <input
                  type="tel"
                  value={connectData.studentPhone}
                  onChange={(e) =>
                    setConnectData({ ...connectData, studentPhone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2 room-detail-title">
                  Move-in Date
                </label>
                <input
                  type="date"
                  value={connectData.moveInDate}
                  onChange={(e) =>
                    setConnectData({ ...connectData, moveInDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2 room-detail-title">
                  Duration
                </label>
                <select
                  value={connectData.duration}
                  onChange={(e) =>
                    setConnectData({ ...connectData, duration: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                >
                  <option>6 months</option>
                  <option>12 months</option>
                  <option>2 years</option>
                  <option>3 years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2 room-detail-title">
                  Message (optional)
                </label>
                <textarea
                  value={connectData.message}
                  onChange={(e) =>
                    setConnectData({ ...connectData, message: e.target.value })
                  }
                  placeholder="Tell the owner about yourself..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 bg-light text-dark font-medium py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-red-500 text-white font-medium py-2 rounded-lg transition"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
