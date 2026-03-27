/**
 * ============================================
 * 📞 CONTACT ROUTES
 * ============================================
 * Contact form and newsletter
 */

import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';
import * as contactController from '../controllers/contact.controller.js';

const router = express.Router();

// ============================================
// 📋 VALIDATION RULES
// ============================================

const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 5000 }).withMessage('Message cannot exceed 5000 characters'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid Indian phone number'),
  body('subject')
    .optional()
    .isIn(['general', 'order', 'product', 'partnership', 'feedback', 'other']).withMessage('Invalid subject')
];

const newsletterValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail()
];

// ============================================
// 🛣️ ROUTES
// ============================================

// Submit contact form
router.post('/', contactValidation, validate, contactController.submitContact);

// Subscribe to newsletter
router.post('/newsletter', newsletterValidation, validate, contactController.subscribeNewsletter);

export default router;
