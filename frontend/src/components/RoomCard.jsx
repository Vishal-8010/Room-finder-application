import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { favoriteAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function RoomCard({ room, onFavoriteChange, onMouseEnter, onMouseLeave, onClick }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, [room._id]);

  const checkFavorite = async () => {
    if (!user) return;
    try {
      const response = await favoriteAPI.checkIsFavorite(room._id);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await favoriteAPI.removeFromFavorites(room._id);
      } else {
        await favoriteAPI.addToFavorites(room._id);
      }
      setIsFavorite(!isFavorite);
      onFavoriteChange?.();
    } catch (error) {
      console.error('Error updating favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/room/${room._id}`} className="group cursor-pointer">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-200 aspect-square">
          <img
            src={(() => {
              let imgUrl = room.images && room.images.length > 0 ? room.images[0] : (room.image || '');
              let safeImg = '/images/rooms/placeholder.jpg';
              if (imgUrl) {
                if (imgUrl.startsWith('http')) safeImg = imgUrl;
                else if (imgUrl.startsWith('/uploads/rooms/')) safeImg = imgUrl;
                else if (imgUrl.startsWith('/uploads/')) safeImg = imgUrl;
                else if (imgUrl.startsWith('/')) safeImg = imgUrl;
                else safeImg = `/uploads/rooms/${imgUrl}`;
              }
              return safeImg;
            })()}
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            style={{ borderRadius: '8px' }}
            onError={e => { e.target.onerror = null; e.target.src = '/images/rooms/placeholder.jpg'; }}
          />
          <button
            onClick={handleFavorite}
            disabled={loading}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition z-10"
          >
            {isFavorite ? (
              <FaHeart className="text-primary text-lg" />
            ) : (
              <FaRegHeart className="text-gray-600 text-lg" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-dark text-lg line-clamp-2 flex-1">
              {room.title}
            </h3>
          </div>

          <p className="text-sm text-secondary mb-3 line-clamp-1">
            {room.locationName}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            {room.rating > 0 ? (
              <>
                <FaStar className="text-yellow-400 text-sm mr-1" />
                <span className="text-sm font-medium">{room.rating.toFixed(1)}</span>
                <span className="text-sm text-secondary ml-1">
                  ({room.reviewCount} reviews)
                </span>
              </>
            ) : (
              <span className="text-sm text-secondary">No reviews yet</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-dark">
              ₹{room.price}
            </span>
            <span className="text-sm text-secondary ml-1">per month</span>
          </div>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {room.amenities.slice(0, 2).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-light text-secondary px-2 py-1 rounded"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 2 && (
                <span className="text-xs bg-light text-secondary px-2 py-1 rounded">
                  +{room.amenities.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
