import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    college: '',
    course: '',
    year: '',
    propertyCount: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        ...formData,
        role,
      });
      login(response.data.user, response.data.token);
      toast.success('Account created successfully!');
      navigate(role === 'student' ? '/rooms' : '/host');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-dark mb-2">
            Create your account
          </h1>
          <p className="text-center text-secondary mb-8">
            Join RoomNest and find your perfect room
          </p>

          {/* Role Selection */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                role === 'student'
                  ? 'bg-primary text-white'
                  : 'bg-light text-dark border border-gray-300'
              }`}
            >
              I'm a Student
            </button>
            <button
              onClick={() => setRole('owner')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                role === 'owner'
                  ? 'bg-primary text-white'
                  : 'bg-light text-dark border border-gray-300'
              }`}
            >
              I'm an Owner
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
              />
            </div>

            {role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    College/University
                  </label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Your college name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
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
                      placeholder="BTech / BCA"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
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
                      placeholder="1st / 2nd / 3rd / 4th"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'owner' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Properties Count
                    </label>
                    <input
                      type="number"
                      name="propertyCount"
                      value={formData.propertyCount}
                      onChange={handleChange}
                      placeholder="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Experience (years)
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="5+ years"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-red-500 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition duration-300"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
