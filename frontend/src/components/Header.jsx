import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaUser, FaFileAlt, FaHome, FaSignOutAlt, FaHeart, FaComments, FaHandshake, FaCar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { authAPI } from '../api';

export default function Header() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showRouteButton, setShowRouteButton] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      toast.error('Please enter email and password');
      return;
    }

    setAdminLoading(true);
    try {
      const response = await authAPI.login(adminEmail, adminPassword);
      if (response.data.user.role === 'admin') {
        // Log in the user with AuthContext
        login(response.data.user, response.data.token);
        toast.success('Admin login successful');
        setIsAdminModalOpen(false);
        setAdminEmail('');
        setAdminPassword('');
        navigate('/admin');
      } else {
        toast.error('You do not have admin privileges');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/rooms?location=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleShowRoute = () => {
    setShowRouteButton(!showRouteButton);
    if (!showRouteButton) {
      toast.success('Route mode activated. View maps to see driving directions.');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header Top - Logo & Menu Toggle */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - Mobile optimized */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setIsMenuOpen(false)}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md">
              RN
            </div>
            <div className="hidden xs:flex flex-col leading-none">
              <div className="text-base sm:text-lg font-bold text-dark">RoomNest</div>
            </div>
          </Link>

          {/* Desktop Search - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 justify-center px-4">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl">
              <label htmlFor="site-search" className="sr-only">Search locations</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition">
                <FaSearch className="text-gray-400 text-sm mr-3" />
                <input
                  id="site-search"
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-dark"
                />
                <button type="submit" className="ml-3 bg-primary text-white px-4 py-1 rounded-full text-xs sm:text-sm font-medium hover:bg-red-600 transition">
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4">
            <Link to="/host" className="text-xs lg:text-sm text-dark hover:text-primary transition font-medium">
              For Hosts
            </Link>
            <Link to="/about" className="text-xs lg:text-sm text-dark hover:text-primary transition font-medium">
              About
            </Link>

            {user?.role === 'owner' && (
              <Link to="/host" className="flex items-center gap-1.5 text-xs lg:text-sm text-primary font-bold hover:text-red-600 transition">
                <FaHome className="text-base" />
                Host
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={isProfileOpen}
                  className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 hover:shadow-md transition"
                >
                  <FaUser className="text-gray-600 text-sm" />
                  <span className="text-xs lg:text-sm truncate max-w-[100px]">
                    {user.name?.split(' ')[0] || user.email.split('@')[0]}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-dark hover:bg-light transition" onClick={() => setIsProfileOpen(false)}>
                      <FaUser className="text-gray-500 text-xs" /> Profile
                    </Link>
                    <Link to="/favorites" className="flex items-center gap-2 px-4 py-3 text-sm text-dark hover:bg-light transition" onClick={() => setIsProfileOpen(false)}>
                      <FaHeart className="text-gray-500 text-xs" /> Favorites
                    </Link>
                    <Link to="/messages" className="flex items-center gap-2 px-4 py-3 text-sm text-dark hover:bg-light transition" onClick={() => setIsProfileOpen(false)}>
                      <FaComments className="text-gray-500 text-xs" /> Messages
                    </Link>
                    <Link to="/connections" className="flex items-center gap-2 px-4 py-3 text-sm text-dark hover:bg-light transition" onClick={() => setIsProfileOpen(false)}>
                      <FaHandshake className="text-gray-500 text-xs" /> Connections
                    </Link>
                    <Link to="/documents" className="flex items-center gap-2 px-4 py-3 text-sm text-dark hover:bg-light transition" onClick={() => setIsProfileOpen(false)}>
                      <FaFileAlt className="text-gray-500 text-xs" /> Documents
                    </Link>
                    {user.role === 'owner' && (
                      <Link to="/host" className="flex items-center gap-2 px-4 py-3 text-sm text-primary font-medium hover:bg-light transition" onClick={() => setIsProfileOpen(false)}>
                        <FaHome className="text-sm" /> Host Dashboard
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button 
                      onClick={() => { handleLogout(); setIsProfileOpen(false); }} 
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-light transition"
                    >
                      <FaSignOutAlt className="text-sm" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsAdminModalOpen(true)} 
                  className="text-xs text-secondary hover:text-dark transition font-medium"
                >
                  Admin
                </button>
                <Link to="/login" className="text-xs text-dark hover:text-primary transition font-medium">
                  Login
                </Link>
                <Link to="/signup" className="text-xs bg-primary text-white px-4 py-2 rounded-full hover:bg-red-600 transition font-bold">
                  Sign up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-light transition flex items-center justify-center"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>

        {/* Mobile Search Bar - Below header on mobile */}
        {isMobile && !isMenuOpen && (
          <form onSubmit={handleSearchSubmit} className="pb-3">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 gap-2">
              <FaSearch className="text-gray-400 text-sm flex-shrink-0" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-dark placeholder-gray-400"
              />
              {searchQuery && (
                <button type="submit" className="text-primary hover:text-red-600 transition flex-shrink-0">
                  <FaSearch className="text-xs" />
                </button>
              )}
            </div>
          </form>
        )}

        {/* Show Route Button - Below menu */}
        {isMobile && (
          <div className="px-3 py-2 border-t border-gray-200 bg-white z-0 relative">
            <button
              onClick={handleShowRoute}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition ${
                showRouteButton
                  ? 'bg-primary text-white hover:bg-red-600'
                  : 'bg-light text-dark hover:bg-gray-200'
              }`}
            >
              <FaCar className="text-base" />
              {showRouteButton ? 'Hide Route' : 'Show Route from My Location'}
            </button>
          </div>
        )}

        {/* Mobile Menu - Slide-in drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white mobile-menu">
            <nav className="px-2 py-3 space-y-1 max-h-[calc(100vh-60px)] overflow-y-auto">
              {/* Search in menu */}
              <form onSubmit={handleSearchSubmit} className="mb-3">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 gap-2">
                  <FaSearch className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm text-dark"
                  />
                </div>
              </form>

              <hr className="my-2" />

              {/* Navigation Links */}
              <Link
                to="/host"
                className="block px-3 py-2.5 rounded-lg text-sm text-dark hover:bg-light transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                For Hosts
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2.5 rounded-lg text-sm text-dark hover:bg-light transition font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

              <hr className="my-2" />

              {user ? (
                <>
                  {/* User Menu Items */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark hover:bg-light transition font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="text-primary text-base" />
                    Profile
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark hover:bg-light transition font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaHeart className="text-red-500 text-base" />
                    Favorites
                  </Link>
                  <Link
                    to="/messages"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark hover:bg-light transition font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaComments className="text-blue-500 text-base" />
                    Messages
                  </Link>
                  <Link
                    to="/connections"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark hover:bg-light transition font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaHandshake className="text-green-500 text-base" />
                    Connections
                  </Link>
                  <Link
                    to="/documents"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark hover:bg-light transition font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaFileAlt className="text-orange-500 text-base" />
                    Documents
                  </Link>

                  {user.role === 'owner' && (
                    <>
                      <hr className="my-2" />
                      <Link
                        to="/host"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary hover:bg-light transition font-bold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaHome className="text-base" />
                        Host Dashboard
                      </Link>
                    </>
                  )}

                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-light transition font-medium text-left"
                  >
                    <FaSignOutAlt className="text-base" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Guest Menu Items */}
                  <button
                    onClick={() => {
                      setIsAdminModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-secondary hover:bg-light transition font-medium text-left"
                  >
                    Admin Login
                  </button>
                  <Link
                    to="/login"
                    className="block px-3 py-2.5 rounded-lg text-sm text-dark hover:bg-light transition font-medium text-center border border-primary text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2.5 rounded-lg text-sm bg-primary text-white text-center transition font-bold hover:bg-red-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-dark mb-2">Admin Portal</h2>
            <p className="text-secondary text-sm mb-6">Enter your admin credentials to access the admin panel</p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full bg-primary hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
              >
                {adminLoading ? 'Logging in...' : 'Login as Admin'}
              </button>
            </form>

            <button
              onClick={() => {
                setIsAdminModalOpen(false);
                setAdminEmail('');
                setAdminPassword('');
              }}
              className="w-full mt-4 px-4 py-2 text-sm text-secondary hover:text-dark transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
