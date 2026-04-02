require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("./models/Room");
const fs = require("fs");
const path = require("path");

const assignImagesToRooms = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database");

    // Load the image mapping
    const mappingFile = path.join(__dirname, "image-mapping.json");
    if (!fs.existsSync(mappingFile)) {
      throw new Error(
        "Image mapping file not found. Run upload-all-images.js first.",
      );
    }

    const imageMapping = JSON.parse(fs.readFileSync(mappingFile, "utf8"));
    const roomImages = imageMapping.rooms.filter(
      (img) => img.filename !== "avatar.jpg",
    ); // Exclude avatar

    console.log(`Found ${roomImages.length} room images to assign`);

    // Get all rooms
    const rooms = await Room.find({});
    console.log(`Found ${rooms.length} rooms to update`);

    if (rooms.length === 0) {
      console.log("No rooms found in database");
      return;
    }

    // Assign images to rooms
    // For simplicity, assign images in round-robin fashion
    let imageIndex = 0;

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const imagesForRoom = [];

      // Assign 2-4 images per room
      const numImages = Math.min(
        4,
        Math.max(2, roomImages.length - imageIndex),
      );
      for (let j = 0; j < numImages && imageIndex < roomImages.length; j++) {
        imagesForRoom.push(roomImages[imageIndex].cloudinaryUrl);
        imageIndex++;
      }

      // Update the room with images
      await Room.findByIdAndUpdate(room._id, {
        images: imagesForRoom,
      });

      console.log(
        `✅ Updated room "${room.title}" with ${imagesForRoom.length} images`,
      );
    }

    console.log("\n🎉 Successfully assigned images to all rooms!");
    console.log(`Total images assigned: ${imageIndex}`);
  } catch (error) {
    console.error("Error assigning images to rooms:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
};

// Run the assignment
assignImagesToRooms();
