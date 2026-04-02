import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../api';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

export default function AdminConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllConnections({ filter: filter !== 'all' ? filter : undefined });
      setConnections(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch connections');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (connId) => {
    try {
      await adminAPI.updateConnectionStatus(connId, 'accepted');
      toast.success('Connection approved');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to approve connection');
    }
  };

  const handleReject = async (connId) => {
    try {
      await adminAPI.updateConnectionStatus(connId, 'rejected');
      toast.success('Connection rejected');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to reject connection');
    }
  };

  const handleDelete = async (connId) => {
    if (!window.confirm('Delete this connection?')) return;
    try {
      await adminAPI.deleteConnection(connId);
      toast.success('Connection deleted');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to delete connection');
    }
  };

  const filteredConnections = connections.filter(
    (c) => filter === 'all' || c.status === filter
  );

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark mb-2">Connections Management</h1>
          <p className="text-secondary">View and manage user connections</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === status ? 'bg-primary text-white' : 'bg-white text-dark hover:bg-light'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Connections Table */}
        {filteredConnections.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Student</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Owner</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Room</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredConnections.map((conn) => (
                    <tr key={conn._id} className="hover:bg-light transition">
                      <td className="px-6 py-4 text-sm text-dark">{conn.studentName}</td>
                      <td className="px-6 py-4 text-sm text-dark">{conn.ownerName}</td>
                      <td className="px-6 py-4 text-sm text-secondary">{conn.roomTitle}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            conn.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : conn.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {conn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {conn.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(conn._id)}
                                className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleReject(conn._id)}
                                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(conn._id)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-secondary">No connections found</p>
          </div>
        )}
      </div>
    </div>
  );
}
