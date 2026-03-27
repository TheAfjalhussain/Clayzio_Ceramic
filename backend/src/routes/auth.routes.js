/**
 * ============================================
 * 🔐 AUTHENTICATION ROUTES
 * ============================================
 * User registration, login, and account management
 */

import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

// ============================================
// 📋 VALIDATION RULES
// ============================================

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid Indian phone number')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// ============================================
// 🛣️ ROUTES
// ============================================

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, changePasswordValidation, validate, authController.changePassword);
router.post('/logout', protect, authController.logout);

export default router;
