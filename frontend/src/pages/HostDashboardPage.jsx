import React, { useState, useEffect } from "react";
import MapLocationPicker from "../components/MapLocationPicker";
import { roomAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus, FaEye, FaStar } from "react-icons/fa";

export default function HostDashboardPage() {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationRoomId, setLocationRoomId] = useState(null);
  const [locationCoords, setLocationCoords] = useState({
    latitude: "",
    longitude: "",
  });
  // Add locationName to locationCoords state

  const handleOpenLocationModal = (room) => {
    setLocationRoomId(room._id);
    setLocationCoords({
      latitude: room.latitude || "",
      longitude: room.longitude || "",
      locationName: room.locationName || "",
    });
    setShowLocationModal(true);
  };

  const handleSaveLocation = async () => {
    if (!locationRoomId) return;
    try {
      await roomAPI.updateRoom(locationRoomId, {
        latitude: locationCoords.latitude,
        longitude: locationCoords.longitude,
        locationName: locationCoords.locationName,
      });
      toast.success("Location updated!");
      setShowLocationModal(false);
      fetchOwnerRooms();
    } catch (error) {
      toast.error("Failed to update location");
    }
  };
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    locationName: "",
    amenities: [],
    size: "",
    deposit: "",
    availableFrom: "",
    images: [""],
  });
  useEffect(() => {
    if (user) {
      fetchOwnerRooms();
    }
  }, [user]);

  // Handle image URL change for multiple images
  const handleImageChange = (index, value) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
  };

  const handleAddImage = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const fetchOwnerRooms = async () => {
    setLoading(true);
    try {
      const response = await roomAPI.getOwnerRooms(user._id);
      setRooms(response.data.rooms || []);
    } catch (error) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.locationName
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await roomAPI.createRoom({
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
        deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
        amenities: formData.amenities.filter((a) => a),
      });
      toast.success("Room created successfully!");
      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        price: "",
        locationName: "",
        amenities: [],
        size: "",
        deposit: "",
        availableFrom: "",
        images: [""],
      });
      fetchOwnerRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create room");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await roomAPI.deleteRoom(roomId);
      toast.success("Room deleted successfully!");
      fetchOwnerRooms();
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  return (
    <div className="min-h-screen bg-light py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark">Host Dashboard</h1>
            <p className="text-secondary">Manage your rooms and bookings</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
          >
            <FaPlus /> Add New Room
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-secondary text-sm mb-2">Total Rooms</p>
            <p className="text-3xl font-bold text-dark">{rooms.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-secondary text-sm mb-2">Active Rooms</p>
            <p className="text-3xl font-bold text-primary">
              {rooms.filter((r) => r.active).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-secondary text-sm mb-2">Average Rating</p>
            <p className="text-3xl font-bold text-yellow-500">
              {user?.rating?.toFixed(1) || "N/A"}
            </p>
          </div>
        </div>
        {/* Rooms List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary">Loading your rooms...</p>
            </div>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              // Get image - support both single image and images array
              const getImageUrl = (room) => {
                // Try images array first
                if (room.images && room.images.length > 0 && room.images[0]) {
                  let img = room.images[0];
                  // Handle relative paths
                  if (typeof img === "string") {
                    if (img.startsWith("http")) return img;
                    if (img.startsWith("/")) return img;
                    if (img.startsWith("uploads/")) return `/${img}`;
                    return `/uploads/rooms/${img}`;
                  }
                  return img;
                }
                // Fall back to single image
                if (room.image) {
                  if (room.image.startsWith("http")) return room.image;
                  if (room.image.startsWith("/")) return room.image;
                  if (room.image.startsWith("uploads/"))
                    return `/${room.image}`;
                  return `/uploads/rooms/${room.image}`;
                }
                // Placeholder
                return "https://via.placeholder.com/300?text=Room";
              };

              const imageUrl = getImageUrl(room);

              return (
                <div
                  key={room._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  {/* Image */}
                  <div className="relative bg-gray-200 aspect-video overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={room.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300?text=Room";
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      ₹{room.price}
                    </div>
                    {!room.active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold">Inactive</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <button
                      className="mb-2 w-full bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg font-medium transition"
                      onClick={() => handleOpenLocationModal(room)}
                    >
                      Set Location in Map
                    </button>
                    <h3 className="font-bold text-dark text-lg mb-2 line-clamp-2">
                      {room.title}
                    </h3>
                    <p className="text-sm text-secondary mb-3">
                      {room.locationName}
                    </p>

                    {/* Rating */}
                    {room.rating > 0 && (
                      <div className="flex items-center mb-3">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="text-sm font-medium mr-2">
                          {room.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-secondary">
                          ({room.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/room/${room._id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-light hover:bg-gray-200 text-dark px-3 py-2 rounded-lg font-medium transition"
                      >
                        <FaEye className="text-sm" /> View
                      </Link>
                      <Link
                        to={`/host/edit/${room._id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-medium transition"
                      >
                        <FaEdit className="text-sm" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteRoom(room._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg font-medium transition"
                      >
                        <FaTrash className="text-sm" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-4xl mb-4">🏠</div>
            <h2 className="text-xl font-bold text-dark mb-2">No rooms yet</h2>
            <p className="text-secondary mb-6">
              Start hosting by adding your first room.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-red-500 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Add Your First Room
            </button>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg my-8 z-[10000]">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-dark">Set Room Location</h2>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-2xl text-secondary hover:text-dark"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div
                style={{
                  width: "100%",
                  height: "300px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "16px",
                }}
              >
                <MapLocationPicker
                  latitude={locationCoords.latitude}
                  longitude={locationCoords.longitude}
                  locationName={locationCoords.locationName}
                  onLocationChange={(lat, lng, name) =>
                    setLocationCoords({
                      latitude: lat,
                      longitude: lng,
                      locationName: name,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs text-secondary mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={locationCoords.locationName || ""}
                  onChange={(e) =>
                    setLocationCoords({
                      ...locationCoords,
                      locationName: e.target.value,
                    })
                  }
                  placeholder="e.g., Near XYZ University, City"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full mb-2"
                />
                <label className="block text-xs text-secondary mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  value={locationCoords.latitude}
                  onChange={(e) =>
                    setLocationCoords({
                      ...locationCoords,
                      latitude: e.target.value,
                    })
                  }
                  placeholder="Latitude"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full mb-2"
                />
                <label className="block text-xs text-secondary mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  value={locationCoords.longitude}
                  onChange={(e) =>
                    setLocationCoords({
                      ...locationCoords,
                      longitude: e.target.value,
                    })
                  }
                  placeholder="Longitude"
                  className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                />
              </div>
              <button
                className="mt-2 w-full bg-primary hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition"
                onClick={handleSaveLocation}
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl my-8 z-[10000]">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-dark">Create New Room</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-2xl text-secondary hover:text-dark"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-96 overflow-y-auto"
            >
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
                  placeholder="Describe your room..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Price (₹/month) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="15000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
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
                    placeholder="City, Area"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Size
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleFormChange}
                    placeholder="e.g., 250 sq ft"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Deposit (₹)
                  </label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleFormChange}
                    placeholder="5000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
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
                  {formData.images
                    .filter((img) => img)
                    .map((img, idx) => (
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
                <label className="block text-sm font-medium text-dark mb-3">
                  Amenities
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "WiFi",
                    "AC",
                    "Bed",
                    "Table",
                    "Chair",
                    "Kitchen",
                    "Bathroom",
                    "Parking",
                    "TV",
                    "Wardrobe",
                    "Balcony",
                    "Water Heater",
                  ].map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              amenities: [...prev.amenities, amenity],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              amenities: prev.amenities.filter(
                                (a) => a !== amenity,
                              ),
                            }));
                          }
                        }}
                        className="mr-2 w-4 h-4 accent-primary"
                      />
                      <span className="text-sm text-dark">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-light text-dark font-medium py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-red-500 text-white font-medium py-2 rounded-lg transition"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mobile quick actions bar for message, connection, favorite */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex md:hidden z-[9999]">
        <a
          href="/messages"
          className="flex-1 flex flex-col items-center justify-center py-2 text-primary hover:text-red-500"
        >
          <FaEye className="text-lg mb-1" />
          <span className="text-xs">Messages</span>
        </a>
        <a
          href="/connections"
          className="flex-1 flex flex-col items-center justify-center py-2 text-primary hover:text-red-500"
        >
          <FaPlus className="text-lg mb-1" />
          <span className="text-xs">Connections</span>
        </a>
        <a
          href="/favorites"
          className="flex-1 flex flex-col items-center justify-center py-2 text-primary hover:text-red-500"
        >
          <FaStar className="text-lg mb-1" />
          <span className="text-xs">Favorites</span>
        </a>
      </div>
    </div>
  );
}
