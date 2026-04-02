import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/MapView';
import TopLocationsAdvanced from '../components/TopLocationsAdvanced';
import { FaUsers, FaHome, FaStar, FaLink, FaChartBar, FaCog, FaCheck, FaClock, FaTimes, FaArrowUp, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { adminAPI, roomAPI } from '../api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalUsers: 0,
    totalConnections: 0,
    totalReviews: 0,
    pendingApprovals: 0,
  });
  const [roomAnalytics, setRoomAnalytics] = useState({
    activeRooms: 0,
    inactiveRooms: 0,
    pendingRooms: 0,
    approvedRooms: 0,
    rejectedRooms: 0,
    averageRating: 0,
    totalLocations: 0,
    topLocations: [],
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    requireEmailVerification: false,
    maxRoomsPerOwner: 50,
    platformFeePercentage: 10,
  });

  useEffect(() => {
    fetchStats();
    fetchRoomAnalytics();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats({
        totalRooms: response.data.data?.totalRooms || 0,
        totalUsers: response.data.data?.totalUsers || 0,
        totalConnections: response.data.data?.totalConnections || 0,
        totalReviews: response.data.data?.totalReviews || 0,
        pendingApprovals: response.data.data?.pendingApprovals || 0,
      });
    } catch (error) {
      toast.error('Failed to fetch stats');
      console.error('Error:', error);
    }
  };

  const fetchRoomAnalytics = async () => {
    try {
      const response = await roomAPI.getAllRooms({ limit: 1000, admin: 'true' });
      const rooms = response.data.rooms || [];
      
      // Calculate analytics
      const activeRooms = rooms.filter(r => r.active).length;
      const inactiveRooms = rooms.filter(r => !r.active).length;
      const pendingRooms = rooms.filter(r => r.status === 'pending').length;
      const approvedRooms = rooms.filter(r => r.status === 'approved').length;
      const rejectedRooms = rooms.filter(r => r.status === 'rejected').length;
      
      const avgRating = rooms.length > 0 
        ? (rooms.reduce((sum, r) => sum + (r.rating || 0), 0) / rooms.length).toFixed(2)
        : 0;

      // Get top locations
      const locationMap = {};
      rooms.forEach(room => {
        if (room.locationName) {
          locationMap[room.locationName] = (locationMap[room.locationName] || 0) + 1;
        }
      });
      
      const topLocations = Object.entries(locationMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([location, count]) => ({ location, count }));

      setRoomAnalytics({
        activeRooms,
        inactiveRooms,
        pendingRooms,
        approvedRooms,
        rejectedRooms,
        averageRating: parseFloat(avgRating),
        totalLocations: Object.keys(locationMap).length,
        topLocations,
      });
    } catch (error) {
      console.error('Error fetching room analytics:', error);
      toast.error('Failed to load room analytics');
    }
  };

  const handleSettingChange = (key, value) => {
    setSiteSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would send settings to the backend
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    toast.success('Site settings updated successfully');
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">Admin Dashboard</h1>
          <p className="text-secondary">Manage website properties and user activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-sm mb-1">Total Rooms</p>
                <p className="text-3xl font-bold text-dark">{stats.totalRooms}</p>
              </div>
              <div className="text-4xl text-primary opacity-20">
                <FaHome />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-dark">{stats.totalUsers}</p>
              </div>
              <div className="text-4xl text-blue-500 opacity-20">
                <FaUsers />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-sm mb-1">Connections</p>
                <p className="text-3xl font-bold text-dark">{stats.totalConnections}</p>
              </div>
              <div className="text-4xl text-green-500 opacity-20">
                <FaLink />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-sm mb-1">Reviews</p>
                <p className="text-3xl font-bold text-dark">{stats.totalReviews}</p>
              </div>
              <div className="text-4xl text-yellow-500 opacity-20">
                <FaStar />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary text-sm mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-red-600">{stats.pendingApprovals}</p>
              </div>
              <div className="text-4xl text-red-500 opacity-20">
                <FaCog />
              </div>
            </div>
          </div>
        </div>

        {/* Room Analytics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark mb-4">Room Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active Rooms */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm mb-1">Active Rooms</p>
                  <p className="text-3xl font-bold text-dark">{roomAnalytics.activeRooms}</p>
                  <p className="text-xs text-secondary mt-2">
                    {roomAnalytics.activeRooms > 0 ? 
                      `${((roomAnalytics.activeRooms / stats.totalRooms) * 100).toFixed(1)}% of total` : 
                      'No active rooms'}
                  </p>
                </div>
                <div className="text-4xl text-green-500 opacity-20">
                  <FaCheck />
                </div>
              </div>
            </div>

            {/* Pending Rooms */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm mb-1">Pending Approval</p>
                  <p className="text-3xl font-bold text-dark">{roomAnalytics.pendingRooms}</p>
                  <p className="text-xs text-secondary mt-2">Awaiting review</p>
                </div>
                <div className="text-4xl text-yellow-500 opacity-20">
                  <FaClock />
                </div>
              </div>
            </div>

            {/* Approved Rooms */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm mb-1">Approved</p>
                  <p className="text-3xl font-bold text-dark">{roomAnalytics.approvedRooms}</p>
                  <p className="text-xs text-secondary mt-2">Ready to list</p>
                </div>
                <div className="text-4xl text-blue-500 opacity-20">
                  <FaCheck />
                </div>
              </div>
            </div>

            {/* Rejected Rooms */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-dark">{roomAnalytics.rejectedRooms}</p>
                  <p className="text-xs text-secondary mt-2">Did not meet criteria</p>
                </div>
                <div className="text-4xl text-red-500 opacity-20">
                  <FaTimes />
                </div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm mb-1">Avg. Rating</p>
                  <p className="text-3xl font-bold text-dark">{roomAnalytics.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-secondary mt-2">Out of 5.0</p>
                </div>
                <div className="text-4xl text-purple-500 opacity-20">
                  <FaStar />
                </div>
              </div>
            </div>

            {/* Total Locations */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm mb-1">Active Locations</p>
                  <p className="text-3xl font-bold text-dark">{roomAnalytics.totalLocations}</p>
                  <p className="text-xs text-secondary mt-2">Cities with rooms</p>
                </div>
                <div className="text-4xl text-indigo-500 opacity-20">
                  <FaChartBar />
                </div>
              </div>
            </div>

            {/* Inactive Rooms */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm mb-1">Inactive</p>
                  <p className="text-3xl font-bold text-dark">{roomAnalytics.inactiveRooms}</p>
                  <p className="text-xs text-secondary mt-2">Currently unavailable</p>
                </div>
                <div className="text-4xl text-gray-400 opacity-20">
                  <FaTimes />
                </div>
              </div>
            </div>

            {/* Growth Indicator */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm mb-1">Trend</p>
                  <p className="text-3xl font-bold text-dark">
                    {roomAnalytics.approvedRooms > roomAnalytics.pendingRooms ? '📈' : '📊'}
                  </p>
                  <p className="text-xs text-secondary mt-2">
                    {roomAnalytics.approvedRooms > roomAnalytics.pendingRooms ? 'Growth up' : 'Reviewing'}
                  </p>
                </div>
                <div className="text-4xl text-teal-500 opacity-20">
                  <FaArrowUp />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Locations - advanced summary and interactive map */}
        {roomAnalytics.topLocations.length > 0 && (
          <TopLocationsAdvanced
            topLocations={roomAnalytics.topLocations}
            rooms={roomAnalytics.rooms || []}
          />
        )}

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rooms Management */}
          <Link to="/admin/rooms" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-center mb-4">
                <div className="text-3xl text-primary mr-4">
                  <FaHome />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">Rooms Management</h2>
                  <p className="text-sm text-secondary">Approve, edit, or delete rooms</p>
                </div>
              </div>
              <button className="mt-4 bg-primary hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Manage Rooms
              </button>
            </div>
          </Link>

          {/* Users Management */}
          <Link to="/admin/users" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-center mb-4">
                <div className="text-3xl text-blue-500 mr-4">
                  <FaUsers />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">Users Management</h2>
                  <p className="text-sm text-secondary">View, edit, or block users</p>
                </div>
              </div>
              <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Manage Users
              </button>
            </div>
          </Link>

          {/* Reviews Management */}
          <Link to="/admin/reviews" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-center mb-4">
                <div className="text-3xl text-yellow-500 mr-4">
                  <FaStar />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">Reviews Management</h2>
                  <p className="text-sm text-secondary">Monitor and remove inappropriate reviews</p>
                </div>
              </div>
              <button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Manage Reviews
              </button>
            </div>
          </Link>

          {/* Connections Management */}
          <Link to="/admin/connections" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-center mb-4">
                <div className="text-3xl text-green-500 mr-4">
                  <FaLink />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">Connections Management</h2>
                  <p className="text-sm text-secondary">View and manage user connections</p>
                </div>
              </div>
              <button className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Manage Connections
              </button>
            </div>
          </Link>

          {/* Site Settings */}
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <div className="flex items-center mb-4">
              <div className="text-3xl text-gray-600 mr-4">
                <FaCog />
              </div>
              <div>
                <h2 className="text-xl font-bold text-dark">Site Settings</h2>
                <p className="text-sm text-secondary">Configure website features</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Configure Settings
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-dark mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/admin/rooms" className="block p-3 hover:bg-light rounded-lg transition text-primary hover:text-red-600">
              ➜ View all rooms pending approval
            </Link>
            <Link to="/admin/users" className="block p-3 hover:bg-light rounded-lg transition text-primary hover:text-red-600">
              ➜ Manage user accounts
            </Link>
            <Link to="/admin/reviews" className="block p-3 hover:bg-light rounded-lg transition text-primary hover:text-red-600">
              ➜ Check reported reviews
            </Link>
          </div>
        </div>
      </div>

      {/* Site Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-3xl font-bold text-dark mb-6">Site Settings</h2>
            
            <div className="space-y-6">
              {/* Maintenance Mode */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-dark">Maintenance Mode</h3>
                  <p className="text-sm text-secondary">Temporarily disable the site for maintenance</p>
                </div>
                <button
                  onClick={() => handleSettingChange('maintenanceMode', !siteSettings.maintenanceMode)}
                  className="text-3xl transition"
                >
                  {siteSettings.maintenanceMode ? (
                    <FaToggleOn className="text-primary" />
                  ) : (
                    <FaToggleOff className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* Registration Enabled */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-dark">Allow Registration</h3>
                  <p className="text-sm text-secondary">Enable new user registrations</p>
                </div>
                <button
                  onClick={() => handleSettingChange('registrationEnabled', !siteSettings.registrationEnabled)}
                  className="text-3xl transition"
                >
                  {siteSettings.registrationEnabled ? (
                    <FaToggleOn className="text-primary" />
                  ) : (
                    <FaToggleOff className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-dark">Email Notifications</h3>
                  <p className="text-sm text-secondary">Send notifications to users</p>
                </div>
                <button
                  onClick={() => handleSettingChange('emailNotifications', !siteSettings.emailNotifications)}
                  className="text-3xl transition"
                >
                  {siteSettings.emailNotifications ? (
                    <FaToggleOn className="text-primary" />
                  ) : (
                    <FaToggleOff className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* Email Verification */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-dark">Require Email Verification</h3>
                  <p className="text-sm text-secondary">Verify email before account activation</p>
                </div>
                <button
                  onClick={() => handleSettingChange('requireEmailVerification', !siteSettings.requireEmailVerification)}
                  className="text-3xl transition"
                >
                  {siteSettings.requireEmailVerification ? (
                    <FaToggleOn className="text-primary" />
                  ) : (
                    <FaToggleOff className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* Max Rooms Per Owner */}
              <div className="pb-4 border-b border-gray-200">
                <label className="text-lg font-semibold text-dark block mb-2">
                  Max Rooms Per Owner
                </label>
                <p className="text-sm text-secondary mb-2">Limit number of rooms each owner can post</p>
                <input
                  type="number"
                  value={siteSettings.maxRoomsPerOwner}
                  onChange={(e) => handleSettingChange('maxRoomsPerOwner', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Platform Fee */}
              <div className="pb-4">
                <label className="text-lg font-semibold text-dark block mb-2">
                  Platform Fee Percentage (%)
                </label>
                <p className="text-sm text-secondary mb-2">Commission taken from room bookings</p>
                <input
                  type="number"
                  value={siteSettings.platformFeePercentage}
                  onChange={(e) => handleSettingChange('platformFeePercentage', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSaveSettings}
                className="flex-1 bg-primary hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
              >
                Save Settings
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
