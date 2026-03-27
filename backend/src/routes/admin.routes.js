/**
 * ============================================
 * 👑 ADMIN ROUTES
 * ============================================
 * Admin dashboard and management APIs
 */

import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// ============================================
// 📊 DASHBOARD
// ============================================

router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);

// ============================================
// 🏺 PRODUCTS
// ============================================

router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Product Variants
router.post('/products/:id/variants', adminController.addProductVariant);
router.put('/products/:id/variants/:variantId', adminController.updateProductVariant);
router.delete('/products/:id/variants/:variantId', adminController.deleteProductVariant);

// ============================================
// 📦 ORDERS
// ============================================

router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetails);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.post('/orders/:id/refund', adminController.initiateRefund);

// ============================================
// 👤 USERS
// ============================================

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// ============================================
// ⭐ REVIEWS
// ============================================

router.get('/reviews', adminController.getReviews);
router.put('/reviews/:id/status', adminController.updateReviewStatus);
router.post('/reviews/:id/respond', adminController.respondToReview);
router.delete('/reviews/:id', adminController.deleteReview);

// ============================================
// 🎟️ COUPONS
// ============================================

router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// ============================================
// 📞 CONTACTS
// ============================================

router.get('/contacts', adminController.getContacts);
router.put('/contacts/:id/status', adminController.updateContactStatus);
router.post('/contacts/:id/respond', adminController.respondToContact);

// ============================================
// 🏢 BUSINESS INQUIRIES
// ============================================

router.get('/business-inquiries', adminController.getBusinessInquiries);
router.put('/business-inquiries/:id', adminController.updateBusinessInquiry);
router.post('/business-inquiries/:id/note', adminController.addInquiryNote);

export default router;
