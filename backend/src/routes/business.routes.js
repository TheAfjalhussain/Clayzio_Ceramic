/**
 * ============================================
 * 🏢 BUSINESS ROUTES
 * ============================================
 * B2B inquiries and partnerships
 */

import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';
import * as businessController from '../controllers/business.controller.js';

const router = express.Router();

// ============================================
// 📋 VALIDATION RULES
// ============================================

const businessInquiryValidation = [
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required'),
  body('contactPerson')
    .trim()
    .notEmpty().withMessage('Contact person name is required'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone')
    .notEmpty().withMessage('Phone is required'),
  body('serviceType')
    .isIn(['bulk_orders', 'manufacturing', 'customization', 'hotel_restaurant', 'corporate_gifting', 'other'])
    .withMessage('Invalid service type'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 5000 }).withMessage('Message cannot exceed 5000 characters')
];

// ============================================
// 🛣️ ROUTES
// ============================================

// Submit business inquiry
router.post('/inquiry', businessInquiryValidation, validate, businessController.submitInquiry);

// Get business services info
router.get('/services', businessController.getServices);

export default router;
