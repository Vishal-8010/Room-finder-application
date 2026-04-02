require("dotenv").config();
const cloudinary = require("./config/cloudinary");
const fs = require("fs");
const path = require("path");

/**
 * Upload all images from local folders to Cloudinary
 */
const uploadAllImages = async () => {
  try {
    console.log("Starting bulk image upload to Cloudinary...");

    const imageFolders = [
      path.join(__dirname, "../images/rooms"),
      path.join(__dirname, "../uploads/documents"),
    ];

    const uploadedImages = {
      rooms: [],
      documents: [],
    };

    for (const folderPath of imageFolders) {
      const folderName = path.basename(folderPath); // 'rooms' or 'documents'
      console.log(`\nProcessing folder: ${folderName}`);

      if (!fs.existsSync(folderPath)) {
        console.log(`Folder ${folderPath} does not exist, skipping...`);
        continue;
      }

      const files = fs.readdirSync(folderPath);
      const imageFiles = files.filter((file) =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
      );

      console.log(`Found ${imageFiles.length} image files in ${folderName}`);

      for (const file of imageFiles) {
        try {
          const filePath = path.join(folderPath, file);
          const relativePath = path
            .relative(path.join(__dirname, ".."), filePath)
            .replace(/\\/g, "/");

          console.log(`Uploading ${file}...`);

          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(filePath, {
            folder: folderName,
            resource_type: "image",
            transformation: [
              { width: 800, height: 600, crop: "limit" },
              { quality: "auto" },
            ],
            public_id: path.parse(file).name, // Use filename without extension as public_id
          });

          uploadedImages[folderName].push({
            originalPath: relativePath,
            cloudinaryUrl: result.secure_url,
            publicId: result.public_id,
            filename: file,
          });

          console.log(`✅ Uploaded ${file} -> ${result.secure_url}`);
        } catch (error) {
          console.error(`❌ Failed to upload ${file}:`, error.message);
        }
      }
    }

    // Save mapping to a JSON file
    const mappingFile = path.join(__dirname, "image-mapping.json");
    fs.writeFileSync(mappingFile, JSON.stringify(uploadedImages, null, 2));
    console.log(`\n📄 Image mapping saved to: ${mappingFile}`);

    // Summary
    console.log("\n📊 Upload Summary:");
    console.log(`Rooms images: ${uploadedImages.rooms.length}`);
    console.log(`Document images: ${uploadedImages.documents.length}`);
    console.log(
      `Total images uploaded: ${uploadedImages.rooms.length + uploadedImages.documents.length}`,
    );

    return uploadedImages;
  } catch (error) {
    console.error("Bulk upload failed:", error.message);
    throw error;
  }
};

// Run the upload
uploadAllImages()
  .then(() => {
    console.log("\n🎉 Bulk upload completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Bulk upload failed:", error);
    process.exit(1);
  });
