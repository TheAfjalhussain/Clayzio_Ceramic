/**
 * ============================================
 * 💳 PAYMENT ROUTES
 * ============================================
 * Razorpay payment processing
 */

import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import * as paymentController from '../controllers/payment.controller.js';

const router = express.Router();

// ============================================
// 📋 VALIDATION RULES
// ============================================

const createOrderValidation = [
  body('amount')
    .isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('orderId')
    .notEmpty().withMessage('Order ID is required')
];

const verifyPaymentValidation = [
  body('razorpay_order_id')
    .notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .notEmpty().withMessage('Razorpay signature is required'),
  body('orderId')
    .notEmpty().withMessage('Order ID is required')
];

// ============================================
// 🛣️ ROUTES
// ============================================

// Create Razorpay order
router.post('/create-order', optionalAuth, createOrderValidation, validate, paymentController.createPaymentOrder);

// Verify payment
router.post('/verify', optionalAuth, verifyPaymentValidation, validate, paymentController.verifyPayment);

// Get payment status
router.get('/status/:paymentId', paymentController.getPaymentStatus);

// Razorpay webhook (raw body for signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

export default router;
