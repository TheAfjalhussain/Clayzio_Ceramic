/**
 * ============================================
 * 📤 UPLOAD ROUTES
 * ============================================
 * File uploads to Cloudinary
 */

import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { 
  uploadProductImages, 
  uploadPDF, 
  uploadAvatar 
} from '../config/cloudinary.js';

const router = express.Router();

// ============================================
// 🖼️ PRODUCT IMAGES
// ============================================

/**
 * Upload product images (admin only)
 * POST /api/upload/product-images
 */
router.post(
  '/product-images',
  protect,
  adminOnly,
  uploadProductImages.array('images', 10), // Max 10 images
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No images uploaded'
        });
      }

      const imageUrls = req.files.map(file => file.path);

      res.json({
        success: true,
        message: `${req.files.length} image(s) uploaded successfully`,
        data: {
          images: imageUrls
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================
// 📄 PDF DOCUMENTS
// ============================================

/**
 * Upload PDF document (admin only)
 * POST /api/upload/document
 */
router.post(
  '/document',
  protect,
  adminOnly,
  uploadPDF.single('document'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No document uploaded'
        });
      }

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          url: req.file.path,
          filename: req.file.originalname
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// ============================================
// 👤 USER AVATAR
// ============================================

/**
 * Upload user avatar
 * POST /api/upload/avatar
 */
router.post(
  '/avatar',
  protect,
  uploadAvatar.single('avatar'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image uploaded'
        });
      }

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatarUrl: req.file.path
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

export default router;
