/**
 * ============================================
 * 📦 ORDER ROUTES
 * ============================================
 * Order creation, tracking, and management
 */

import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import * as orderController from '../controllers/order.controller.js';

const router = express.Router();

// ============================================
// 📋 VALIDATION RULES
// ============================================

const createOrderValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product')
    .notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('customerName')
    .trim()
    .notEmpty().withMessage('Customer name is required'),
  body('customerEmail')
    .trim()
    .isEmail().withMessage('Valid email is required'),
  body('customerPhone')
    .notEmpty().withMessage('Phone number is required'),
  body('shippingAddress')
    .isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street')
    .notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city')
    .notEmpty().withMessage('City is required'),
  body('shippingAddress.state')
    .notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode')
    .notEmpty().withMessage('Pincode is required')
    .matches(/^\d{6}$/).withMessage('Invalid pincode'),
  body('paymentMethod')
    .isIn(['razorpay', 'cod', 'upi', 'card', 'netbanking']).withMessage('Invalid payment method')
];

// ============================================
// 🛣️ ROUTES
// ============================================

// Create order (guest checkout allowed)
router.post('/', optionalAuth, createOrderValidation, validate, orderController.createOrder);

// User's orders (requires login)
router.get('/my-orders', protect, orderController.getMyOrders);

// Order tracking (public with order ID)
router.get('/track/:orderId', orderController.trackOrder);

// Order details
router.get('/:orderId', optionalAuth, orderController.getOrderDetails);

// Cancel order (requires login)
router.post('/:orderId/cancel', protect, orderController.cancelOrder);

// Invoice
router.get('/:orderId/invoice', orderController.getInvoice);
router.post('/:orderId/invoice/generate', orderController.generateInvoice);

export default router;
