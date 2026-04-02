import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function EditRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    locationName: '',
    amenities: [],
    size: '',
    deposit: '',
    availableFrom: '',
    images: [''],
    latitude: '',
    longitude: '',
  });

  // Set current location in form
  const handleSetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    toast('Fetching your current location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        toast.success('Location set!');
      },
      (err) => {
        toast.error('Could not get your location');
      }
    );
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await roomAPI.getRoomById(roomId);
        const room = response.data.room || response.data;
        
        // Check if user owns this room
        if (room.owner._id !== user._id && room.owner !== user._id) {
          toast.error('You do not have permission to edit this room');
          navigate('/host');
          return;
        }

        setFormData({
          title: room.title || '',
          description: room.description || '',
          price: room.price || '',
          locationName: room.locationName || '',
          amenities: room.amenities || [],
          size: room.size || '',
          deposit: room.deposit || '',
          availableFrom: room.availableFrom ? room.availableFrom.split('T')[0] : '',
          images: room.images && room.images.length > 0 ? room.images : [room.image || ''],
          latitude: room.latitude || '',
          longitude: room.longitude || '',
        });
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load room');
        navigate('/host');
      }
    };

    fetchRoom();
  }, [roomId, user, navigate]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image URL change for multiple images
  const handleImageChange = (index, value) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
  };

  const handleAddImage = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAmenityChange = (index, value) => {
    const newAmenities = [...formData.amenities];
    newAmenities[index] = value;
    setFormData((prev) => ({ ...prev, amenities: newAmenities }));
  };

  const handleAddAmenity = () => {
    setFormData((prev) => ({ ...prev, amenities: [...prev.amenities, ''] }));
  };

  const handleRemoveAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price || !formData.locationName) {
      toast.error('Please fill in all required fields');
      return;
    }


    // Validate and convert coordinates
    let latitude = formData.latitude;
    let longitude = formData.longitude;
    if (latitude === '' || longitude === '') {
      toast.error('Please set both latitude and longitude (use the button if needed)');
      setSubmitting(false);
      return;
    }
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);
    if (isNaN(latitude) || isNaN(longitude)) {
      toast.error('Latitude and longitude must be valid numbers');
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    try {
      await roomAPI.updateRoom(roomId, {
        ...formData,
        images: formData.images.filter((img) => img),
        price: parseFloat(formData.price),
        deposit: formData.deposit ? parseFloat(formData.deposit) : 0,
        amenities: formData.amenities.filter((a) => a),
        latitude,
        longitude,
      });
      toast.success('Room updated successfully!');
      navigate('/host');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update room');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-dark mb-6">Edit Room</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Room Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g., Spacious 1BHK near campus"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Describe your room in detail..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleFormChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Location *
              </label>
              <input
                type="text"
                name="locationName"
                value={formData.locationName}
                onChange={handleFormChange}
                placeholder="e.g., Near XYZ University, City"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Room Size
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleFormChange}
                  placeholder="e.g., 300 sq ft"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  Available From
                </label>
                <input
                  type="date"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>



            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Room Images
              </label>
              {formData.images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImage}
                className="mt-2 px-4 py-2 bg-light hover:bg-gray-200 text-dark rounded-lg font-medium transition"
              >
                + Add Image
              </button>
              {/* Preview images */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {formData.images.filter((img) => img).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Room ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Amenities</label>
              <div className="space-y-2">
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={amenity}
                      onChange={(e) => handleAmenityChange(index, e.target.value)}
                      placeholder="e.g., WiFi, AC, Kitchen"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddAmenity}
                className="mt-2 px-4 py-2 bg-light hover:bg-gray-200 text-dark rounded-lg font-medium transition"
              >
                + Add Amenity
              </button>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition"
              >
                {submitting ? 'Updating...' : 'Update Room'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/host')}
                className="flex-1 bg-light hover:bg-gray-200 text-dark font-bold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
