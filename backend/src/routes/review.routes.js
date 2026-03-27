// /**
//  * ============================================
//  * ⭐ REVIEW ROUTES
//  * ============================================
//  * Product reviews and ratings
//  */


/**
 * ============================================
 * ⭐ REVIEW ROUTES
 * ============================================
 * Product reviews and ratings
 */

import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import * as reviewController from '../controllers/review.controller.js';

const router = express.Router();

// ============================================
// 📋 VALIDATION RULES
// ============================================

const createReviewValidation = [
  body('product')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ max: 2000 }).withMessage('Comment cannot exceed 2000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('reviewerName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('reviewerEmail')
    .optional()
    .isEmail().withMessage('Invalid email format')
];

// ============================================
// 🛣️ ROUTES
// ============================================

// Get product reviews (public)
router.get('/product/:productId', optionalAuth, reviewController.getProductReviews);

// Create review (optional auth - allows guest reviews)
router.post('/', optionalAuth, createReviewValidation, validate, reviewController.createReview);

// Update review (requires login)
router.put('/:id', protect, reviewController.updateReview);

// Delete review (requires login)
router.delete('/:id', protect, reviewController.deleteReview);

// Mark review as helpful (requires login)
router.post('/:id/helpful', protect, reviewController.markHelpful);

export default router;






// import express from 'express';
// import { body } from 'express-validator';
// import { validate } from '../middleware/validate.middleware.js';
// import { protect, optionalAuth } from '../middleware/auth.middleware.js';
// import * as reviewController from '../controllers/review.controller.js';

// const router = express.Router();

// // ============================================
// // 📋 VALIDATION RULES
// // ============================================

// const createReviewValidation = [
//   body('product')
//     .notEmpty().withMessage('Product ID is required')
//     .isMongoId().withMessage('Invalid product ID'),
//   body('rating')
//     .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
//   body('comment')
//     .trim()
//     .notEmpty().withMessage('Review comment is required')
//     .isLength({ max: 2000 }).withMessage('Comment cannot exceed 2000 characters'),
//   body('title')
//     .optional()
//     .trim()
//     .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters')
// ];

// // ============================================
// // 🛣️ ROUTES
// // ============================================

// // Get product reviews (public)
// router.get('/product/:productId', optionalAuth, reviewController.getProductReviews);

// // Create review (requires login)
// router.post('/', protect,  validate, reviewController.createReview);

// // Update review (requires login)
// router.put('/:id', protect, reviewController.updateReview);

// // Delete review (requires login)
// router.delete('/:id', protect, reviewController.deleteReview);

// // Mark review as helpful (requires login)
// router.post('/:id/helpful', protect, reviewController.markHelpful);

// export default router;
