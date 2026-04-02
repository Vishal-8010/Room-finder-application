import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../api';

import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import AdminRoomsMap from '../components/AdminRoomsMap';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchAllRooms();
  }, []);

  const fetchAllRooms = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllRooms({ filter: filter !== 'all' ? filter : undefined });
      setRooms(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRoom = async (roomId) => {
    try {
      await adminAPI.approveRoom(roomId);
      toast.success('Room approved');
      fetchAllRooms();
    } catch (error) {
      toast.error('Failed to approve room');
    }
  };

  const handleRejectRoom = async (roomId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await adminAPI.rejectRoom(roomId, reason);
      toast.success('Room rejected');
      fetchAllRooms();
    } catch (error) {
      toast.error('Failed to reject room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await adminAPI.deleteRoom(roomId);
      toast.success('Room deleted');
      fetchAllRooms();
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (filter === 'all') return true;
    return room.status === filter;
  });

  // Robust image normalization (same as RoomDetailPage)
  function getSafeImage(img) {
    if (!img) return '/images/rooms/placeholder.jpg';
    if (typeof img === 'object') img = img.url || img.path || '';
    if (!img) return '/images/rooms/placeholder.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return img;
    if (img.startsWith('uploads/')) return `/${img}`;
    if (img.startsWith('/uploads/rooms/') || img.startsWith('/uploads/')) return img;
    return `/uploads/rooms/${img}`;
  }

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark mb-2">Rooms Management</h1>
          <p className="text-secondary">Approve, edit, or delete rooms</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white text-dark hover:bg-light'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Advanced Rooms Map Overview */}
        <AdminRoomsMap rooms={filteredRooms} loading={loading} />

        {/* Rooms Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary">Loading rooms...</p>
            </div>
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-dark">Image</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Owner</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRooms.map((room) => {
                    const rawImages = room.images && room.images.length > 0 ? room.images : [room.image || null];
                    const imgSrc = getSafeImage(rawImages[0]);
                    return (
                      <tr key={room._id} className="hover:bg-light transition">
                        <td className="px-4 py-3">
                          <img
                            src={imgSrc}
                            alt={room.title}
                            className="w-16 h-12 object-cover rounded border"
                            onError={e => { e.target.onerror = null; e.target.src = '/images/rooms/placeholder.jpg'; }}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-dark font-medium">{room.title}</td>
                        <td className="px-6 py-4 text-sm text-secondary">{room.locationName}</td>
                        <td className="px-6 py-4 text-sm text-dark font-semibold">₹{room.price}</td>
                        <td className="px-6 py-4 text-sm text-secondary">{room.ownerId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              room.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : room.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {room.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            {room.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveRoom(room._id)}
                                  className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                                  title="Approve"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => handleRejectRoom(room._id)}
                                  className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                  title="Reject"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteRoom(room._id)}
                              className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-secondary">No rooms found</p>
          </div>
        )}
      </div>
    </div>
  );
}
