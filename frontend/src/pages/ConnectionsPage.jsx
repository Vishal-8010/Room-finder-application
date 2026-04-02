import React, { useState, useEffect } from 'react';
import { connectionAPI, roomAPI } from '../api';
import VisitBookingModal from '../components/VisitBookingModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedRoomForVisit, setSelectedRoomForVisit] = useState(null);

  useEffect(() => {
    fetchConnections();
    fetchMyVisits();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await connectionAPI.getUserConnections();
      setConnections(response.data.connections || []);
    } catch (error) {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const [myVisits, setMyVisits] = useState([]);
  const fetchMyVisits = async () => {
    try {
      const res = await (await import('../api')).visitsAPI.getMyVisits();
      setMyVisits(res.data.visits || []);
    } catch (err) {
      console.error('Failed to load my visits', err);
    }
  };

  const handleUpdateStatus = async (connectionId, status) => {
    try {
      await connectionAPI.updateConnectionStatus(connectionId, status);
      toast.success(`Connection ${status}!`);
      fetchConnections();
    } catch (error) {
      toast.error('Failed to update connection');
    }
  };

  const filteredConnections = connections.filter((conn) => {
    if (filter === 'all') return true;
    return conn.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <FaCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-dark mb-8">My Connections</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'pending', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white text-dark border border-gray-200 hover:border-primary'
              }`}
            >
              {status === 'all'
                ? 'All Connections'
                : `${status} (${connections.filter((c) => c.status === status).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary">Loading connections...</p>
            </div>
          </div>
        ) : filteredConnections.length > 0 ? (
          <div className="space-y-4">
            {filteredConnections.map((conn) => (
              <div key={conn._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  {/* Room Info */}
                  <div>
                    <h3 className="font-semibold text-dark mb-2">Room</h3>
                    <p className="text-dark font-medium">{conn.room?.title}</p>
                    <p className="text-sm text-secondary">{conn.room?.locationName}</p>
                  </div>

                  {/* Student Info */}
                  <div>
                    <h3 className="font-semibold text-dark mb-2">
                      {user?.role === 'owner' ? 'Student' : 'Owner'}
                    </h3>
                    <p className="text-dark font-medium">
                      {user?.role === 'owner'
                        ? conn.student?.firstName
                        : conn.owner?.firstName}
                    </p>
                    <p className="text-sm text-secondary">
                      {user?.role === 'owner'
                        ? conn.studentEmail
                        : conn.owner?.email}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <h3 className="font-semibold text-dark mb-2">Status</h3>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        conn.status
                      )}`}
                    >
                      {getStatusIcon(conn.status)}
                      {conn.status.charAt(0).toUpperCase() +
                        conn.status.slice(1)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div>
                    {user?.role === 'owner' && conn.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateStatus(conn._id, 'accepted')
                          }
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(conn._id, 'rejected')
                          }
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Student side: Schedule Visit button for accepted connections */}
                    {user?.role === 'student' && conn.status === 'accepted' && (
                      <div className="mt-2">
                        <button
                          onClick={() => { setSelectedRoomForVisit(conn.room); setShowVisitModal(true); }}
                          className="w-full bg-primary hover:bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Schedule Visit
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-secondary mb-1">Move-in Date</p>
                    <p className="font-medium text-dark">
                      {new Date(conn.moveInDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary mb-1">Visit</p>
                    <p className="font-medium text-dark">
                      {myVisits.some(v => v.room && v.room._id === conn.room._id && v.status === 'pending') || myVisits.some(v => v.room && v.room._id && v.room._id.toString() === conn.room._id.toString() && v.status === 'pending') ? 'Visit Requested (Pending)' : myVisits.some(v => v.room && v.room._id && v.room._id.toString() === conn.room._id.toString() && v.status === 'approved') ? 'Visit Approved' : 'No visit'}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary mb-1">Duration</p>
                    <p className="font-medium text-dark">{conn.duration}</p>
                  </div>
                  <div>
                    <p className="text-secondary mb-1">Phone</p>
                    <p className="font-medium text-dark">{conn.studentPhone}</p>
                  </div>
                  <div>
                    <p className="text-secondary mb-1">Connected</p>
                    <p className="font-medium text-dark">
                      {new Date(conn.connectedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {conn.message && (
                  <div className="mt-4 p-3 bg-light rounded-lg">
                    <p className="text-sm text-secondary mb-1">Message:</p>
                    <p className="text-dark">{conn.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-4xl mb-4">🤝</div>
            <h2 className="text-xl font-bold text-dark mb-2">No connections yet</h2>
            <p className="text-secondary">
              {user?.role === 'owner'
                ? 'Students will appear here once they connect with your rooms.'
                : 'Connect with room owners to start the process.'}
            </p>
          </div>
        )}
      </div>

      {showVisitModal && (
        <VisitBookingModal
          isOpen={showVisitModal}
          onClose={() => { setShowVisitModal(false); setSelectedRoomForVisit(null); }}
          room={selectedRoomForVisit}
          onSuccess={() => { /* refresh visits or connections */ }}
        />
      )}
    </div>
  );
}
