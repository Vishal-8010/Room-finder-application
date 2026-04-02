import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function HomePage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-red-500 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Room
            </h1>
            <p className="text-lg md:text-xl text-red-100 mb-8">
              Discover amazing rooms near you. Fast, safe, and trusted.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:gap-4">
              {/* Location Input */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-dark mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, area, or college name..."
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition text-black"
                />
              </div>

              {/* Min Price */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-dark mb-2">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition text-black"
                />
              </div>

              {/* Max Price */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-dark mb-2">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition text-black"
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-primary hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                >
                  <FaSearch /> Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-dark">
            Why Choose RoomNest?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏠',
                title: 'Verified Rooms',
                description: 'All rooms are verified and checked by our team for quality and safety.',
              },
              {
                icon: '✨',
                title: 'Easy Booking',
                description: 'Simple and quick booking process. Get in touch with owners instantly.',
              },
              {
                icon: '🛡️',
                title: 'Safe & Secure',
                description: 'Your safety is our priority. We ensure secure transactions and payments.',
              },
              {
                icon: '⭐',
                title: 'Real Reviews',
                description: 'Read honest reviews from real students who have booked rooms.',
              },
              {
                icon: '💬',
                title: 'Direct Chat',
                description: 'Chat directly with room owners to discuss details and negotiate.',
              },
              {
                icon: '🎯',
                title: 'Perfect Match',
                description: 'Find rooms that match your budget, location, and preferences.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-dark mb-2">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-dark text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to find your perfect room?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of students finding their ideal accommodation.
          </p>
          <button
            onClick={() => navigate('/rooms')}
            className="bg-primary hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-lg"
          >
            Explore Rooms Now
          </button>
        </div>
      </section>
    </div>
  );
}
