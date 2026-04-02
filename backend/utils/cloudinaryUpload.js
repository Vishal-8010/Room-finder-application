const cloudinary = require("../config/cloudinary");

/**
 * Upload an image to Cloudinary
 * @param {string} imageUrl - URL of the image to upload
 * @param {string} folder - Cloudinary folder to upload to (default: 'rooms')
 * @returns {Promise<string>} - Cloudinary URL of uploaded image
 */
const uploadImageToCloudinary = async (imageUrl, folder = "rooms") => {
  try {
    // If it's already a Cloudinary URL, return as is
    if (imageUrl.includes("cloudinary.com")) {
      return imageUrl;
    }

    // If it's a local upload path, construct full URL
    let fullImageUrl = imageUrl;
    if (imageUrl.startsWith("/uploads/")) {
      fullImageUrl = `${process.env.BASE_URL || "http://localhost:5000"}${imageUrl}`;
    } else if (!imageUrl.startsWith("http")) {
      // Assume it's a relative path to uploads
      fullImageUrl = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/rooms/${imageUrl}`;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fullImageUrl, {
      folder: folder,
      resource_type: "image",
      transformation: [
        { width: 800, height: 600, crop: "limit" }, // Resize to max 800x600
        { quality: "auto" }, // Auto quality optimization
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {string[]} imageUrls - Array of image URLs to upload
 * @param {string} folder - Cloudinary folder to upload to (default: 'rooms')
 * @returns {Promise<string[]>} - Array of Cloudinary URLs
 */
const uploadImagesToCloudinary = async (imageUrls, folder = "rooms") => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return [];
  }

  const uploadPromises = imageUrls
    .filter((url) => url && url.trim()) // Filter out empty URLs
    .map((url) => uploadImageToCloudinary(url, folder));

  try {
    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls;
  } catch (error) {
    console.error("Error uploading images to Cloudinary:", error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} imageUrl - Cloudinary URL of the image to delete
 */
const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
      return; // Not a Cloudinary URL, skip
    }

    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = `rooms/${publicIdWithExtension.split(".")[0]}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    // Don't throw error for delete failures
  }
};

module.exports = {
  uploadImageToCloudinary,
  uploadImagesToCloudinary,
  deleteImageFromCloudinary,
};
