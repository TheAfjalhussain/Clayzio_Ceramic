// /**
//  * ============================================
//  * 👑 ADMIN CONTROLLER
//  * ============================================
//  * Admin dashboard and management
//  */

/**
 * ============================================
 * 👑 ADMIN CONTROLLER
 * ============================================
 * Admin dashboard and management
 */

import {
  User,
  Product,
  Order,
  Review,
  Coupon,
  Contact,
  BusinessInquiry
} from '../models/index.js';
import * as paymentService from '../services/payment.service.js';
import * as emailService from '../services/email.service.js';

// ============================================
// 📊 DASHBOARD STATS
// ============================================

/**
 * Get dashboard statistics
 * @route GET /api/admin/dashboard
 * @access Admin
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get counts
    const [totalOrders, totalProducts, totalUsers, totalReviews] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Review.countDocuments({ status: 'approved' })
    ]);

    // Revenue stats
    const revenueStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Monthly orders
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Recent orders
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .select('orderId customerName total status createdAt');

    // Pending reviews
    const pendingReviews = await Review.countDocuments({ status: 'pending' });

    // Low stock products
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
      .limit(5)
      .select('name stock lowStockThreshold');

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalProducts,
          totalUsers,
          totalReviews,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          avgOrderValue: Math.round(revenueStats[0]?.avgOrderValue || 0),
          monthlyOrders,
          pendingReviews
        },
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics data
 * @route GET /api/admin/analytics
 * @access Admin
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    const today = new Date();
    
    switch (period) {
      case '7d': startDate = new Date(today.setDate(today.getDate() - 7)); break;
      case '30d': startDate = new Date(today.setDate(today.getDate() - 30)); break;
      case '90d': startDate = new Date(today.setDate(today.getDate() - 90)); break;
      default: startDate = new Date(today.setDate(today.getDate() - 7));
    }

    // Daily revenue chart
    const revenueChart = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $project: { name: '$product.name', totalSold: 1, revenue: 1 } }
    ]);

    res.json({
      success: true,
      data: { revenueChart, topProducts }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🏺 PRODUCT MANAGEMENT
// ============================================

export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Transform products to include both camelCase and snake_case for frontend compatibility
    const transformedProducts = products.map(p => ({
      ...p.toObject(),
      id: p._id,
      short_description: p.shortDescription,
      original_price: p.compareAtPrice,
      stock_quantity: p.stock,
      in_stock: p.stock > 0,
      is_bestseller: p.isBestseller,
      is_new: p.isNewArrival,
      care_instructions: p.careInstructions
    }));

    res.json({
      success: true,
      data: transformedProducts,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    // Map frontend snake_case to backend camelCase
    const productData = {
      name: req.body.name,
      description: req.body.description,
      shortDescription: req.body.short_description || req.body.shortDescription,
      price: req.body.price,
      compareAtPrice: req.body.original_price || req.body.compareAtPrice,
      category: req.body.category,
      images: req.body.images || [],
      stock: req.body.stock_quantity ?? req.body.stock ?? 0,
      isBestseller: req.body.is_bestseller ?? req.body.isBestseller ?? false,
      isNewArrival: req.body.is_new ?? req.body.isNewArrival ?? false,
      careInstructions: req.body.care_instructions || req.body.careInstructions,
      materials: req.body.materials,
      dimensions: req.body.dimensions,
      weight: req.body.weight,
      isActive: true
    };
    
    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    // Map frontend snake_case to backend camelCase
    const updateData = {};
    
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.short_description !== undefined) updateData.shortDescription = req.body.short_description;
    if (req.body.shortDescription !== undefined) updateData.shortDescription = req.body.shortDescription;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.original_price !== undefined) updateData.compareAtPrice = req.body.original_price;
    if (req.body.compareAtPrice !== undefined) updateData.compareAtPrice = req.body.compareAtPrice;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.images !== undefined) updateData.images = req.body.images;
    if (req.body.stock_quantity !== undefined) updateData.stock = req.body.stock_quantity;
    if (req.body.stock !== undefined) updateData.stock = req.body.stock;
    if (req.body.is_bestseller !== undefined) updateData.isBestseller = req.body.is_bestseller;
    if (req.body.isBestseller !== undefined) updateData.isBestseller = req.body.isBestseller;
    if (req.body.is_new !== undefined) updateData.isNewArrival = req.body.is_new;
    if (req.body.isNewArrival !== undefined) updateData.isNewArrival = req.body.isNewArrival;
    if (req.body.care_instructions !== undefined) updateData.careInstructions = req.body.care_instructions;
    if (req.body.careInstructions !== undefined) updateData.careInstructions = req.body.careInstructions;
    if (req.body.materials !== undefined) updateData.materials = req.body.materials;
    if (req.body.dimensions !== undefined) updateData.dimensions = req.body.dimensions;
    if (req.body.weight !== undefined) updateData.weight = req.body.weight;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, message: 'Product deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const addProductVariant = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    product.variants.push(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProductVariant = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    const variant = product.variants.id(req.params.variantId);
    if (!variant) return res.status(404).json({ success: false, error: 'Variant not found' });
    Object.assign(variant, req.body);
    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProductVariant = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    product.variants.id(req.params.variantId).deleteOne();
    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📦 ORDER MANAGEMENT
// ============================================

export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('user', 'name email');

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber, shippingCarrier, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note, updatedBy: req.user.id });
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (shippingCarrier) order.shippingCarrier = shippingCarrier;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    if (status === 'shipped') {
      emailService.sendOrderShipped(order).catch(console.error);
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const initiateRefund = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (!order.razorpayPaymentId) return res.status(400).json({ success: false, error: 'No payment found' });

    const refund = await paymentService.initiateRefund(order.razorpayPaymentId, amount, { order_id: order.orderId, reason });
    order.statusHistory.push({ status: order.status, note: `Refund: ₹${amount || order.total}. Reason: ${reason}`, updatedBy: req.user.id });
    await order.save();

    res.json({ success: true, data: refund });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 👤 USER MANAGEMENT
// ============================================

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).select('-password');
    res.json({ success: true, data: users, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const orders = await Order.find({ user: user._id }).sort('-createdAt').limit(10).select('orderId total status createdAt');
    res.json({ success: true, data: { user, orders } });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone, isActive }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'moderator'].includes(role)) return res.status(400).json({ success: false, error: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ⭐ REVIEW MANAGEMENT
// ============================================

export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query).sort('-createdAt').skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).populate('user', 'name email').populate('product', 'name images');
    res.json({ success: true, data: reviews, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { status, rejectionReason }, { new: true });
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    await Review.calculateProductRating(review.product);
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const respondToReview = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { adminResponse: { comment, respondedAt: new Date(), respondedBy: req.user.id } }, { new: true });
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    const productId = review.product;
    await review.deleteOne();
    await Review.calculateProductRating(productId);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🎟️ COUPON MANAGEMENT
// ============================================

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📞 CONTACT MANAGEMENT
// ============================================

export const getContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query).sort('-createdAt').skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    res.json({ success: true, data: contacts, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

export const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status, assignedTo: req.user.id, ...(status === 'resolved' && { resolvedAt: new Date() }) }, { new: true });
    if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

export const respondToContact = async (req, res, next) => {
  try {
    const { message, sentVia } = req.body;
    const contact = await Contact.findByIdAndUpdate(req.params.id, { $push: { responses: { message, sentBy: req.user.id, sentVia: sentVia || 'email' } }, status: 'in_progress' }, { new: true });
    if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' });
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🏢 BUSINESS INQUIRY MANAGEMENT
// ============================================

export const getBusinessInquiries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, serviceType } = req.query;
    const query = {};
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    const total = await BusinessInquiry.countDocuments(query);
    const inquiries = await BusinessInquiry.find(query).sort('-createdAt').skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    res.json({ success: true, data: inquiries, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

export const updateBusinessInquiry = async (req, res, next) => {
  try {
    const inquiry = await BusinessInquiry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!inquiry) return res.status(404).json({ success: false, error: 'Inquiry not found' });
    res.json({ success: true, data: inquiry });
  } catch (error) {
    next(error);
  }
};

export const addInquiryNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    const inquiry = await BusinessInquiry.findByIdAndUpdate(req.params.id, { $push: { notes: { content, addedBy: req.user.id } } }, { new: true });
    if (!inquiry) return res.status(404).json({ success: false, error: 'Inquiry not found' });
    res.json({ success: true, data: inquiry });
  } catch (error) {
    next(error);
  }
};













// previous code before bug solving



// import {
//   User,
//   Product,
//   Order,
//   Review,
//   Coupon,
//   Contact,
//   BusinessInquiry
// } from '../models/index.js';
// import * as paymentService from '../services/payment.service.js';
// import * as emailService from '../services/email.service.js';

// // ============================================
// // 📊 DASHBOARD STATS
// // ============================================

// /**
//  * Get dashboard statistics
//  * @route GET /api/admin/dashboard
//  * @access Admin
//  */
// export const getDashboardStats = async (req, res, next) => {
//   try {
//     const today = new Date();
//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

//     // Get counts
//     const [totalOrders, totalProducts, totalUsers, totalReviews] = await Promise.all([
//       Order.countDocuments(),
//       Product.countDocuments({ isActive: true }),
//       User.countDocuments({ isActive: true }),
//       Review.countDocuments({ status: 'approved' })
//     ]);

//     // Revenue stats
//     const revenueStats = await Order.aggregate([
//       { $match: { paymentStatus: 'paid' } },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: '$total' },
//           avgOrderValue: { $avg: '$total' }
//         }
//       }
//     ]);

//     // Monthly orders
//     const monthlyOrders = await Order.countDocuments({
//       createdAt: { $gte: startOfMonth }
//     });

//     // Recent orders
//     const recentOrders = await Order.find()
//       .sort('-createdAt')
//       .limit(5)
//       .select('orderId customerName total status createdAt');

//     // Pending reviews
//     const pendingReviews = await Review.countDocuments({ status: 'pending' });

//     // Low stock products
//     const lowStockProducts = await Product.find({
//       isActive: true,
//       $expr: { $lte: ['$stock', '$lowStockThreshold'] }
//     })
//       .limit(5)
//       .select('name stock lowStockThreshold');

//     res.json({
//       success: true,
//       data: {
//         stats: {
//           totalOrders,
//           totalProducts,
//           totalUsers,
//           totalReviews,
//           totalRevenue: revenueStats[0]?.totalRevenue || 0,
//           avgOrderValue: Math.round(revenueStats[0]?.avgOrderValue || 0),
//           monthlyOrders,
//           pendingReviews
//         },
//         recentOrders,
//         lowStockProducts
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * Get analytics data
//  * @route GET /api/admin/analytics
//  * @access Admin
//  */
// export const getAnalytics = async (req, res, next) => {
//   try {
//     const { period = '7d' } = req.query;
    
//     let startDate;
//     const today = new Date();
    
//     switch (period) {
//       case '7d': startDate = new Date(today.setDate(today.getDate() - 7)); break;
//       case '30d': startDate = new Date(today.setDate(today.getDate() - 30)); break;
//       case '90d': startDate = new Date(today.setDate(today.getDate() - 90)); break;
//       default: startDate = new Date(today.setDate(today.getDate() - 7));
//     }

//     // Daily revenue chart
//     const revenueChart = await Order.aggregate([
//       { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
//       {
//         $group: {
//           _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//           revenue: { $sum: '$total' },
//           orders: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);

//     // Top products
//     const topProducts = await Order.aggregate([
//       { $match: { createdAt: { $gte: startDate } } },
//       { $unwind: '$items' },
//       {
//         $group: {
//           _id: '$items.product',
//           totalSold: { $sum: '$items.quantity' },
//           revenue: { $sum: '$items.total' }
//         }
//       },
//       { $sort: { totalSold: -1 } },
//       { $limit: 5 },
//       {
//         $lookup: {
//           from: 'products',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'product'
//         }
//       },
//       { $unwind: '$product' },
//       { $project: { name: '$product.name', totalSold: 1, revenue: 1 } }
//     ]);

//     res.json({
//       success: true,
//       data: { revenueChart, topProducts }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 🏺 PRODUCT MANAGEMENT
// // ============================================

// export const getProducts = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20, search, category, status } = req.query;

//     const query = {};
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { sku: { $regex: search, $options: 'i' } }
//       ];
//     }
//     if (category) query.category = category;
//     if (status === 'active') query.isActive = true;
//     if (status === 'inactive') query.isActive = false;

//     const total = await Product.countDocuments(query);
//     const products = await Product.find(query)
//       .sort('-createdAt')
//       .skip((Number(page) - 1) * Number(limit))
//       .limit(Number(limit));

//     res.json({
//       success: true,
//       data: products,
//       pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const createProduct = async (req, res, next) => {
//   try {
//     const product = await Product.create(req.body);
//     res.status(201).json({ success: true, data: product });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateProduct = async (req, res, next) => {
//   try {
//     const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
//     res.json({ success: true, data: product });
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteProduct = async (req, res, next) => {
//   try {
//     const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
//     if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
//     res.json({ success: true, message: 'Product deactivated successfully' });
//   } catch (error) {
//     next(error);
//   }
// };

// export const addProductVariant = async (req, res, next) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
//     product.variants.push(req.body);
//     await product.save();
//     res.status(201).json({ success: true, data: product });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateProductVariant = async (req, res, next) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
//     const variant = product.variants.id(req.params.variantId);
//     if (!variant) return res.status(404).json({ success: false, error: 'Variant not found' });
//     Object.assign(variant, req.body);
//     await product.save();
//     res.json({ success: true, data: product });
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteProductVariant = async (req, res, next) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
//     product.variants.id(req.params.variantId).deleteOne();
//     await product.save();
//     res.json({ success: true, data: product });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 📦 ORDER MANAGEMENT
// // ============================================

// export const getOrders = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
//     const query = {};
//     if (status) query.status = status;
//     if (paymentStatus) query.paymentStatus = paymentStatus;
//     if (search) {
//       query.$or = [
//         { orderId: { $regex: search, $options: 'i' } },
//         { customerEmail: { $regex: search, $options: 'i' } },
//         { customerName: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const total = await Order.countDocuments(query);
//     const orders = await Order.find(query)
//       .sort('-createdAt')
//       .skip((Number(page) - 1) * Number(limit))
//       .limit(Number(limit))
//       .populate('user', 'name email');

//     res.json({
//       success: true,
//       data: orders,
//       pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getOrderDetails = async (req, res, next) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('user', 'name email phone')
//       .populate('items.product', 'name images');
//     if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
//     res.json({ success: true, data: order });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateOrderStatus = async (req, res, next) => {
//   try {
//     const { status, note, trackingNumber, shippingCarrier, estimatedDelivery } = req.body;
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

//     order.status = status;
//     order.statusHistory.push({ status, note, updatedBy: req.user.id });
//     if (trackingNumber) order.trackingNumber = trackingNumber;
//     if (shippingCarrier) order.shippingCarrier = shippingCarrier;
//     if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
//     if (status === 'delivered') order.deliveredAt = new Date();
//     await order.save();

//     if (status === 'shipped') {
//       emailService.sendOrderShipped(order).catch(console.error);
//     }

//     res.json({ success: true, data: order });
//   } catch (error) {
//     next(error);
//   }
// };

// export const initiateRefund = async (req, res, next) => {
//   try {
//     const { amount, reason } = req.body;
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
//     if (!order.razorpayPaymentId) return res.status(400).json({ success: false, error: 'No payment found' });

//     const refund = await paymentService.initiateRefund(order.razorpayPaymentId, amount, { order_id: order.orderId, reason });
//     order.statusHistory.push({ status: order.status, note: `Refund: ₹${amount || order.total}. Reason: ${reason}`, updatedBy: req.user.id });
//     await order.save();

//     res.json({ success: true, data: refund });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 👤 USER MANAGEMENT
// // ============================================

// export const getUsers = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20, role, search } = req.query;
//     const query = {};
//     if (role) query.role = role;
//     if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

//     const total = await User.countDocuments(query);
//     const users = await User.find(query).sort('-createdAt').skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).select('-password');
//     res.json({ success: true, data: users, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getUserDetails = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password');
//     if (!user) return res.status(404).json({ success: false, error: 'User not found' });
//     const orders = await Order.find({ user: user._id }).sort('-createdAt').limit(10).select('orderId total status createdAt');
//     res.json({ success: true, data: { user, orders } });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateUser = async (req, res, next) => {
//   try {
//     const { name, phone, isActive } = req.body;
//     const user = await User.findByIdAndUpdate(req.params.id, { name, phone, isActive }, { new: true, runValidators: true }).select('-password');
//     if (!user) return res.status(404).json({ success: false, error: 'User not found' });
//     res.json({ success: true, data: user });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateUserRole = async (req, res, next) => {
//   try {
//     const { role } = req.body;
//     if (!['user', 'admin', 'moderator'].includes(role)) return res.status(400).json({ success: false, error: 'Invalid role' });
//     const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
//     if (!user) return res.status(404).json({ success: false, error: 'User not found' });
//     res.json({ success: true, data: user });
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteUser = async (req, res, next) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
//     if (!user) return res.status(404).json({ success: false, error: 'User not found' });
//     res.json({ success: true, message: 'User deactivated successfully' });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // ⭐ REVIEW MANAGEMENT
// // ============================================

// export const getReviews = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20, status } = req.query;
//     const query = {};
//     if (status) query.status = status;

//     const total = await Review.countDocuments(query);
//     const reviews = await Review.find(query).sort('-createdAt').skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).populate('user', 'name email').populate('product', 'name images');
//     res.json({ success: true, data: reviews, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateReviewStatus = async (req, res, next) => {
//   try {
//     const { status, rejectionReason } = req.body;
//     const review = await Review.findByIdAndUpdate(req.params.id, { status, rejectionReason }, { new: true });
//     if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
//     await Review.calculateProductRating(review.product);
//     res.json({ success: true, data: review });
//   } catch (error) {
//     next(error);
//   }
// };

// export const respondToReview = async (req, res, next) => {
//   try {
//     const { comment } = req.body;
//     const review = await Review.findByIdAndUpdate(req.params.id, { adminResponse: { comment, respondedAt: new Date(), respondedBy: req.user.id } }, { new: true });
//     if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
//     res.json({ success: true, data: review });
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteReview = async (req, res, next) => {
//   try {
//     const review = await Review.findById(req.params.id);
//     if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
//     const productId = review.product;
//     await review.deleteOne();
//     await Review.calculateProductRating(productId);
//     res.json({ success: true, message: 'Review deleted successfully' });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 🎟️ COUPON MANAGEMENT
// // ============================================

// export const getCoupons = async (req, res, next) => {
//   try {
//     const coupons = await Coupon.find().sort('-createdAt');
//     res.json({ success: true, data: coupons });
//   } catch (error) {
//     next(error);
//   }
// };

// export const createCoupon = async (req, res, next) => {
//   try {
//     const coupon = await Coupon.create(req.body);
//     res.status(201).json({ success: true, data: coupon });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateCoupon = async (req, res, next) => {
//   try {
//     const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
//     res.json({ success: true, data: coupon });
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteCoupon = async (req, res, next) => {
//   try {
//     const coupon = await Coupon.findByIdAndDelete(req.params.id);
//     if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
//     res.json({ success: true, message: 'Coupon deleted successfully' });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 📞 CONTACT MANAGEMENT
// // ============================================

// export const getContacts = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20, status } = req.query;
//     const query = {};
//     if (status) query.status = status;

//     const total = await Contact.countDocuments(query);
//     const contacts = await Contact.find(query).sort('-createdAt').skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
//     res.json({ success: true, data: contacts, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateContactStatus = async (req, res, next) => {
//   try {
//     const { status } = req.body;
//     const contact = await Contact.findByIdAndUpdate(req.params.id, { status, assignedTo: req.user.id, ...(status === 'resolved' && { resolvedAt: new Date() }) }, { new: true });
//     if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' });
//     res.json({ success: true, data: contact });
//   } catch (error) {
//     next(error);
//   }
// };

// export const respondToContact = async (req, res, next) => {
//   try {
//     const { message, sentVia } = req.body;
//     const contact = await Contact.findByIdAndUpdate(req.params.id, { $push: { responses: { message, sentBy: req.user.id, sentVia: sentVia || 'email' } }, status: 'in_progress' }, { new: true });
//     if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' });
//     res.json({ success: true, data: contact });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 🏢 BUSINESS INQUIRY MANAGEMENT
// // ============================================

// export const getBusinessInquiries = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 20, status, serviceType } = req.query;
//     const query = {};
//     if (status) query.status = status;
//     if (serviceType) query.serviceType = serviceType;

//     const total = await BusinessInquiry.countDocuments(query);
//     const inquiries = await BusinessInquiry.find(query).sort('-createdAt').skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
//     res.json({ success: true, data: inquiries, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateBusinessInquiry = async (req, res, next) => {
//   try {
//     const inquiry = await BusinessInquiry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!inquiry) return res.status(404).json({ success: false, error: 'Inquiry not found' });
//     res.json({ success: true, data: inquiry });
//   } catch (error) {
//     next(error);
//   }
// };

// export const addInquiryNote = async (req, res, next) => {
//   try {
//     const { content } = req.body;
//     const inquiry = await BusinessInquiry.findByIdAndUpdate(req.params.id, { $push: { notes: { content, addedBy: req.user.id } } }, { new: true });
//     if (!inquiry) return res.status(404).json({ success: false, error: 'Inquiry not found' });
//     res.json({ success: true, data: inquiry });
//   } catch (error) {
//     next(error);
//   }
// };
