const Room = require("../models/Room");
const User = require("../models/User");
const { geocodeAddress, buildGeoJSONPoint } = require("../utils/geocoding");
const { uploadImagesToCloudinary } = require("../utils/cloudinaryUpload");

// Helper function to clean up room images
const cleanupRoomImages = (room) => {
  if (!room) return room;

  const roomObj = room.toObject ? room.toObject() : room;

  // Clean up images array - remove empty strings and ensure proper format
  if (roomObj.images && Array.isArray(roomObj.images)) {
    roomObj.images = roomObj.images
      .filter((img) => img && img.trim()) // Remove empty/whitespace strings
      .map((img) => {
        // Normalize paths: ensure they start with /uploads/rooms/ if they're not full URLs
        if (img.startsWith("http")) return img;
        if (img.startsWith("/uploads/")) return img;
        if (img.startsWith("/")) return img;
        // If it's just a filename, add the path
        return `/uploads/rooms/${img}`;
      });
  }

  // If no valid images, remove the array
  if (!roomObj.images || roomObj.images.length === 0) {
    roomObj.images = [];
  }

  return roomObj;
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, amenities, search, admin } =
      req.query;
    let filter = {};

    // Only filter by active status if not an admin query
    if (!admin || admin !== "true") {
      filter.active = true;
    }

    if (location) {
      filter.locationName = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      filter.amenities = { $in: amenitiesArray };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { locationName: { $regex: search, $options: "i" } },
      ];
    }

    let rooms = await Room.find(filter).populate(
      "owner",
      "firstName lastName rating verified",
    );

    // Clean up images for all rooms
    rooms = rooms.map(cleanupRoomImages);

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search rooms by map bounds (geospatial query)
exports.searchByBounds = async (req, res) => {
  try {
    const { neLat, neLng, swLat, swLng } = req.query;

    // Validate bounds parameters
    if (!neLat || !neLng || !swLat || !swLng) {
      return res.status(400).json({
        success: false,
        message:
          "Missing bounds parameters: neLat, neLng, swLat, swLng required",
      });
    }

    const neLng_num = parseFloat(neLng);
    const neLat_num = parseFloat(neLat);
    const swLng_num = parseFloat(swLng);
    const swLat_num = parseFloat(swLat);

    // Build $geoWithin polygon for the bounding box
    // GeoJSON Polygon: exterior ring with coordinates [lng, lat]
    const polygon = {
      type: "Polygon",
      coordinates: [
        [
          [swLng_num, swLat_num], // southwest
          [neLng_num, swLat_num], // southeast
          [neLng_num, neLat_num], // northeast
          [swLng_num, neLat_num], // northwest
          [swLng_num, swLat_num], // close polygon
        ],
      ],
    };

    const rooms = await Room.find({
      active: true,
      location: {
        $geoWithin: {
          $geometry: polygon,
        },
      },
    }).populate("owner", "firstName lastName rating verified");

    // Clean up images for all rooms
    const cleanedRooms = rooms.map(cleanupRoomImages);

    res.status(200).json({
      success: true,
      count: cleanedRooms.length,
      rooms: cleanedRooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    let room = await Room.findById(roomId).populate(
      "owner",
      "firstName lastName rating verified reviewCount avatar bio",
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Clean up images
    room = cleanupRoomImages(room);

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create room (owner only)
// Search rooms near a point (geospatial $near)
exports.searchNearbyRooms = async (req, res) => {
  try {
    const { lat, lng, radius, minPrice, maxPrice, type } = req.query;
    if (!lat || !lng || !radius) {
      return res
        .status(400)
        .json({ success: false, message: "lat, lng, and radius are required" });
    }
    const filter = { active: true };

    // Optional filters
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    if (type) filter.type = type;

    filter.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(radius), // in meters
      },
    };

    const rooms = await Room.find(filter).populate(
      "owner",
      "firstName lastName rating verified",
    );

    // Clean up images for all rooms
    const cleanedRooms = rooms.map(cleanupRoomImages);

    res
      .status(200)
      .json({ success: true, count: cleanedRooms.length, rooms: cleanedRooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.createRoom = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      locationName,
      amenities,
      size,
      deposit,
      availableFrom,
      image,
      images,
      latitude,
      longitude,
    } = req.body;

    if (!title || !description || !price || !locationName) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: title, description, price, locationName",
      });
    }

    // Geocode the address to get coordinates. Allow fallback to provided latitude/longitude or default.
    const mapboxToken = process.env.MAPBOX_TOKEN;
    let location = null;

    if (mapboxToken) {
      const coords = await geocodeAddress(locationName, mapboxToken);
      if (coords) {
        location = buildGeoJSONPoint(coords.longitude, coords.latitude);
      } else if (latitude && longitude) {
        // Use client-provided coords as a fallback
        location = buildGeoJSONPoint(
          parseFloat(longitude),
          parseFloat(latitude),
        );
      } else {
        console.warn(
          `Could not geocode address: ${locationName}. Using default coordinates.`,
        );
        // Use default coordinates for India (will show on map but may not be precise)
        location = buildGeoJSONPoint(77.1025, 28.7041);
      }
    } else if (latitude && longitude) {
      // No Mapbox token configured, but client provided coordinates
      location = buildGeoJSONPoint(parseFloat(longitude), parseFloat(latitude));
    } else {
      // No Mapbox token and no coordinates provided - use default
      console.warn(
        `Mapbox token not configured and no coordinates provided. Using default coordinates.`,
      );
      location = buildGeoJSONPoint(77.1025, 28.7041);
    }

    // Support both single image and multiple images (array)
    let imagesArray =
      images && Array.isArray(images) ? images.filter(Boolean) : [];
    if ((!imagesArray || imagesArray.length === 0) && image) {
      imagesArray = [image];
    }

    // Upload images to Cloudinary if provided
    let cloudinaryImages = [];
    if (imagesArray.length > 0) {
      try {
        console.log(`Uploading ${imagesArray.length} images to Cloudinary...`);
        cloudinaryImages = await uploadImagesToCloudinary(imagesArray, "rooms");
        console.log("Images uploaded successfully to Cloudinary");
      } catch (uploadError) {
        console.error("Failed to upload images to Cloudinary:", uploadError);
        // Continue with original URLs if Cloudinary upload fails
        cloudinaryImages = imagesArray;
      }
    }

    const room = await Room.create({
      title,
      description,
      price,
      locationName,
      location,
      amenities: amenities || [],
      size,
      deposit,
      availableFrom,
      images: cloudinaryImages,
      owner: req.userId,
      latitude: latitude
        ? parseFloat(latitude)
        : location
          ? location.coordinates[1]
          : undefined,
      longitude: longitude
        ? parseFloat(longitude)
        : location
          ? location.coordinates[0]
          : undefined,
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update room (owner only)
exports.updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const {
      title,
      description,
      price,
      locationName,
      amenities,
      size,
      deposit,
      availableFrom,
      image,
      images,
      active,
      latitude,
      longitude,
    } = req.body;

    let room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check if user is owner
    if (room.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this room",
      });
    }

    // If locationName is provided and different, re-geocode
    // Support both single image and multiple images (array)
    let imagesArray =
      images && Array.isArray(images) ? images.filter(Boolean) : [];
    if ((!imagesArray || imagesArray.length === 0) && image) {
      imagesArray = [image];
    }

    // Upload images to Cloudinary if provided
    let cloudinaryImages = [];
    if (imagesArray.length > 0) {
      try {
        console.log(`Uploading ${imagesArray.length} images to Cloudinary...`);
        cloudinaryImages = await uploadImagesToCloudinary(imagesArray, "rooms");
        console.log("Images uploaded successfully to Cloudinary");
      } catch (uploadError) {
        console.error("Failed to upload images to Cloudinary:", uploadError);
        // Continue with original URLs if Cloudinary upload fails
        cloudinaryImages = imagesArray;
      }
    }

    // Only include images in updateData if they were provided in the request
    let updateData = {
      title,
      description,
      price,
      amenities,
      size,
      deposit,
      availableFrom,
      active,
    };
    if (images || image) {
      updateData.images = cloudinaryImages;
    }
    // Always update latitude/longitude if provided
    if (latitude && longitude) {
      updateData.latitude = parseFloat(latitude);
      updateData.longitude = parseFloat(longitude);
    } else if (room.location && Array.isArray(room.location.coordinates)) {
      updateData.latitude = room.location.coordinates[1];
      updateData.longitude = room.location.coordinates[0];
    }

    if (locationName && locationName !== room.locationName) {
      const mapboxToken = process.env.MAPBOX_TOKEN;
      if (mapboxToken) {
        const coords = await geocodeAddress(locationName, mapboxToken);
        if (coords) {
          updateData.locationName = locationName;
          updateData.location = buildGeoJSONPoint(
            coords.longitude,
            coords.latitude,
          );
        } else if (latitude && longitude) {
          updateData.locationName = locationName;
          updateData.location = buildGeoJSONPoint(
            parseFloat(longitude),
            parseFloat(latitude),
          );
        } else {
          // Use default coordinates for India if geocoding fails
          console.warn(
            `Could not geocode address: ${locationName}. Using default coordinates.`,
          );
          updateData.locationName = locationName;
          updateData.location = buildGeoJSONPoint(77.1025, 28.7041);
        }
      } else if (latitude && longitude) {
        updateData.locationName = locationName;
        updateData.location = buildGeoJSONPoint(
          parseFloat(longitude),
          parseFloat(latitude),
        );
      } else {
        // No Mapbox token and no coordinates provided - use default
        updateData.locationName = locationName;
        updateData.location = buildGeoJSONPoint(77.1025, 28.7041);
      }
    } else if (locationName) {
      updateData.locationName = locationName;
    }

    room = await Room.findByIdAndUpdate(roomId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete room (owner only)
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this room",
      });
    }

    await Room.findByIdAndDelete(roomId);

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get rooms by owner
exports.getOwnerRooms = async (req, res) => {
  try {
    const { ownerId } = req.params;

    let rooms = await Room.find({ owner: ownerId });

    // Clean up images for all rooms
    rooms = rooms.map(cleanupRoomImages);

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
