/**
 * ============================================
 * ☁️ CLOUDINARY CONFIGURATION
 * ============================================
 * Cloud storage for images and PDFs
 */

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// 📸 IMAGE UPLOAD STORAGE
// ============================================

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'clayzio/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
    ]
  }
});

// ============================================
// 📄 PDF UPLOAD STORAGE
// ============================================

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'clayzio/documents',
    allowed_formats: ['pdf'],
    resource_type: 'raw'
  }
});

// ============================================
// 🖼️ AVATAR UPLOAD STORAGE
// ============================================

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'clayzio/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }
    ]
  }
});

// ============================================
// 📤 MULTER UPLOAD HANDLERS
// ============================================

export const uploadProductImages = multer({ 
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const uploadPDF = multer({ 
  storage: pdfStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'clayzio/misc',
        resource_type: options.resourceType || 'auto',
        ...options
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, raw, video)
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw error;
  }
};

/**
 * Get optimized image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
export const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  });
};

export { cloudinary };
export default cloudinary;
