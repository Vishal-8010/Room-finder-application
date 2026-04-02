import React, { useState, useEffect } from 'react';
import { favoriteAPI } from '../api';
import RoomCard from '../components/RoomCard';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoriteAPI.getUserFavorites();
      setFavorites(response.data.favorites || []);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-dark mb-2">My Favorites</h1>
        <p className="text-secondary mb-8">
          {favorites.length} room{favorites.length !== 1 ? 's' : ''} saved
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary">Loading favorites...</p>
            </div>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((room) => (
              <RoomCard key={room._id} room={room} onFavoriteChange={fetchFavorites} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-4xl mb-4">❤️</div>
            <h2 className="text-xl font-bold text-dark mb-2">No favorites yet</h2>
            <p className="text-secondary">
              Start adding rooms to your favorites to keep track of your interests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
