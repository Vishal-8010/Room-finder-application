require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("./models/Room");
const { uploadImagesToCloudinary } = require("./utils/cloudinaryUpload");

const migrateRoomImages = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database");

    // Get all rooms
    const allRooms = await Room.find({});
    console.log(`Total rooms in database: ${allRooms.length}`);

    // Get all rooms with any images (including local paths)
    const rooms = await Room.find({
      $or: [
        { images: { $exists: true, $ne: [] } },
        { image: { $exists: true, $ne: null, $ne: "" } },
      ],
    });

    console.log(`Found ${rooms.length} rooms with any image data`);

    // Also check for rooms that might have local image paths
    const roomsWithLocalImages = allRooms.filter((room) => {
      const hasLocalImages =
        (room.images &&
          room.images.some(
            (img) =>
              img &&
              (img.includes("/uploads/") ||
                img.includes("images/") ||
                !img.includes("http")),
          )) ||
        (room.image &&
          (room.image.includes("/uploads/") ||
            room.image.includes("images/") ||
            !room.image.includes("http")));
      return hasLocalImages;
    });

    console.log(
      `Found ${roomsWithLocalImages.length} rooms with local image paths`,
    );

    // Combine both queries
    const allRoomsToProcess = [...new Set([...rooms, ...roomsWithLocalImages])];

    console.log(`Total rooms to process: ${allRoomsToProcess.length}`);

    // Log some sample rooms for debugging
    if (allRooms.length > 0) {
      console.log("Sample rooms:");
      allRooms.slice(0, 3).forEach((room) => {
        console.log(
          `  - ${room._id}: ${room.title}, images: ${room.images?.length || 0}, image: ${room.image ? "yes" : "no"}`,
        );
      });
    }

    let successCount = 0;
    let errorCount = 0;

    for (const room of allRoomsToProcess) {
      try {
        console.log(`Processing room: ${room._id} - ${room.title}`);

        const imagesToUpload = [];

        // Collect all images to upload
        if (room.images && Array.isArray(room.images)) {
          imagesToUpload.push(
            ...room.images.filter(
              (img) => img && !img.includes("cloudinary.com"),
            ),
          );
        }
        if (room.image && !room.image.includes("cloudinary.com")) {
          imagesToUpload.push(room.image);
        }

        if (imagesToUpload.length === 0) {
          console.log(`  No images to upload for room ${room._id}`);
          continue;
        }

        console.log(`  Uploading ${imagesToUpload.length} images...`);

        // Upload images to Cloudinary
        const uploadedUrls = await uploadImagesToCloudinary(
          imagesToUpload,
          "rooms",
        );

        // Update room with new Cloudinary URLs
        const updateData = {};

        if (room.images && Array.isArray(room.images)) {
          // Replace old URLs with new Cloudinary URLs
          const newImages = room.images.map((img) => {
            if (img.includes("cloudinary.com")) return img;
            const index = imagesToUpload.indexOf(img);
            return index !== -1 ? uploadedUrls.shift() : img;
          });
          updateData.images = newImages;
        }

        if (room.image && !room.image.includes("cloudinary.com")) {
          updateData.image = uploadedUrls.shift() || room.image;
        }

        await Room.findByIdAndUpdate(room._id, updateData);
        console.log(`  Successfully updated room ${room._id}`);
        successCount++;
      } catch (error) {
        console.error(`  Error processing room ${room._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`  Successfully migrated: ${successCount} rooms`);
    console.log(`  Errors: ${errorCount} rooms`);
  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
};

// Run migration
migrateRoomImages();
