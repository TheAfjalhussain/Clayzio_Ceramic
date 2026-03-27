// /**
//  * ============================================
//  * 🏺 PRODUCT ROUTES
//  * ============================================
//  * Product catalog and search endpoints
//  */


/**
 * ============================================
 * 🏺 PRODUCT ROUTES
 * ============================================
 * Product catalog and search endpoints
 */

import express from 'express';
import { optionalAuth } from '../middleware/auth.middleware.js';
import * as productController from '../controllers/product.controller.js';

const router = express.Router();

// ============================================
// 🛣️ PUBLIC ROUTES
// ============================================

// List & Filter
router.get('/', optionalAuth, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/bestsellers', productController.getBestsellers);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/categories', productController.getCategories);
router.get('/search', productController.searchProducts);

// Single Product
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:id/variants', productController.getProductVariants);

export default router;








// import express from 'express';
// import { optionalAuth } from '../middleware/auth.middleware.js';
// import * as productController from '../controllers/product.controller.js';

// const router = express.Router();

// // ============================================
// // 🛣️ PUBLIC ROUTES
// // ============================================

// // List & Filter
// router.get('/', optionalAuth, productController.getProducts);
// router.get('/featured', productController.getFeaturedProducts);
// router.get('/bestsellers', productController.getBestsellers);
// router.get('/new-arrivals', productController.getNewArrivals);
// router.get('/categories', productController.getCategories);
// router.get('/search', productController.searchProducts);

// // Single Product
// router.get('/slug/:slug', productController.getProductBySlug);
// router.get('/:id', productController.getProductById);
// router.get('/:id/related', productController.getRelatedProducts);

// export default router;
