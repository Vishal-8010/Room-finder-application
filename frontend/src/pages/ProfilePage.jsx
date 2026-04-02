import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    college: '',
    course: '',
    year: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        college: user.college || '',
        course: user.course || '',
        year: user.year || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-dark">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-primary hover:bg-red-500 text-white px-6 py-2 rounded-lg transition font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="flex items-center mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-bold mr-6">
              {user.firstName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-secondary capitalize">{user.role}</p>
              {user.rating > 0 && (
                <div className="flex items-center mt-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="ml-2 font-medium text-dark">
                    {user.rating.toFixed(1)} ({user.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {user.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      College
                    </label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        Course
                      </label>
                      <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        Year
                      </label>
                      <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-light text-dark font-medium py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-red-500 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-secondary mb-1">First Name</p>
                  <p className="font-medium text-dark">{formData.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Last Name</p>
                  <p className="font-medium text-dark">{formData.lastName}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-secondary mb-1">Email</p>
                <p className="font-medium text-dark">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-secondary mb-1">Phone</p>
                <p className="font-medium text-dark">{formData.phone}</p>
              </div>

              {user.role === 'student' && (
                <>
                  {formData.college && (
                    <div>
                      <p className="text-sm text-secondary mb-1">College</p>
                      <p className="font-medium text-dark">{formData.college}</p>
                    </div>
                  )}
                  {formData.course && (
                    <div>
                      <p className="text-sm text-secondary mb-1">Course</p>
                      <p className="font-medium text-dark">{formData.course}</p>
                    </div>
                  )}
                  {formData.year && (
                    <div>
                      <p className="text-sm text-secondary mb-1">Year</p>
                      <p className="font-medium text-dark">{formData.year}</p>
                    </div>
                  )}
                </>
              )}

              {formData.bio && (
                <div>
                  <p className="text-sm text-secondary mb-1">Bio</p>
                  <p className="font-medium text-dark">{formData.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
