import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../api';
import { FaEdit, FaTrash, FaLock, FaUnlock } from 'react-icons/fa';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, blocked, student, owner

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers({ filter: filter !== 'all' ? filter : undefined });
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await adminAPI.updateUserStatus(userId, newStatus);
      toast.success(`User ${newStatus}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    if (filter === 'active') return user.blocked === false;
    if (filter === 'blocked') return user.blocked === true;
    return user.role === filter;
  });

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dark mb-2">Users Management</h1>
          <p className="text-secondary">View, edit, or block user accounts</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'active', 'blocked', 'student', 'owner'].map((status) => (
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

        {/* Users Table */}
        {filteredUsers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-light transition">
                      <td className="px-6 py-4 text-sm text-dark font-medium">{user.firstName} {user.lastName}</td>
                      <td className="px-6 py-4 text-sm text-secondary">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'owner'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.blocked === false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.blocked === false ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBlockUser(user._id, user.blocked === false ? 'active' : 'blocked')}
                            className={`p-2 rounded transition ${
                              user.blocked === false
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={user.blocked === false ? 'Block' : 'Unblock'}
                          >
                            {user.blocked === false ? <FaLock /> : <FaUnlock />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                            title="Delete"
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
            <p className="text-secondary">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
