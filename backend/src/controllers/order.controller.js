/**
 * ============================================
 * 📦 ORDER CONTROLLER
 * ============================================
 * Order creation and management
 */

import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import Coupon from '../models/Coupon.model.js';
import * as emailService from '../services/email.service.js';
import * as invoiceService from '../services/invoice.service.js';
import * as paymentService from '../services/payment.service.js';

// ============================================
// 📝 CREATE ORDER
// ============================================

/**
 * Create a new order
 * @route POST /api/orders
 * @access Public (guest checkout allowed)
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      customerNote
    } = req.body;

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product not found: ${item.product}`
        });
      }

      // Handle variants
      let price = product.price;
      let variantData = null;

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (variant?.isActive) {
          if (variant.stock < item.quantity) {
            return res.status(400).json({
              success: false,
              error: `Insufficient stock for ${product.name} - ${variant.name}`
            });
          }
          price = variant.price;
          variantData = {
            id: variant._id,
            name: variant.name,
            sku: variant.sku
          };
        }
      } else if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}`
        });
      }

      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.thumbnail || product.images[0],
        variant: variantData,
        quantity: item.quantity,
        price,
        total
      });
    }

    // Apply coupon discount
    let discount = 0;
    let discountCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      
      if (coupon) {
        const isFirstOrder = req.user 
          ? (await Order.countDocuments({ user: req.user.id })) === 0
          : true;
        
        const validation = coupon.isValid(req.user?.id, subtotal, isFirstOrder);
        
        if (validation.valid) {
          discount = coupon.calculateDiscount(subtotal);
          discountCode = coupon.code;
          
          // Update coupon usage
          coupon.usageCount += 1;
          if (req.user) {
            coupon.usedBy.push({ user: req.user.id, usedAt: new Date() });
          }
          await coupon.save();
        }
      }
    }

    // Calculate shipping (free above ₹999)
    const shippingCost = subtotal >= 999 ? 0 : 99;

    // Calculate total
    const total = subtotal - discount + shippingCost;

    // Create order
    const order = await Order.create({
      user: req.user?.id,
      items: orderItems,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      discountCode,
      shippingCost,
      total,
      customerNote,
      status: 'pending',
      paymentStatus: 'pending',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Generate invoice number
    order.invoiceNumber = await Order.generateInvoiceNumber();
    await order.save();

    // Update product stock
    for (const item of items) {
      if (item.variantId) {
        await Product.findOneAndUpdate(
          { _id: item.product, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': -item.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    // Create Razorpay order if online payment
    let razorpayOrder = null;
    if (paymentMethod === 'razorpay') {
      razorpayOrder = await paymentService.createOrder(total, order.orderId, {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      });

      order.razorpayOrderId = razorpayOrder.order.id;
      await order.save();
    }

    // For COD orders, confirm immediately
    if (paymentMethod === 'cod') {
      order.status = 'confirmed';
      await order.save();

      // Send confirmation emails
      emailService.sendOrderConfirmation(order).catch(console.error);
      emailService.sendAdminOrderNotification(order).catch(console.error);
    }

    res.status(201).json({
      success: true,
      data: {
        order: {
          id: order._id,
          orderId: order.orderId,
          total: order.total,
          status: order.status,
          paymentMethod: order.paymentMethod
        },
        razorpay: razorpayOrder
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📋 GET MY ORDERS
// ============================================

/**
 * Get current user's orders
 * @route GET /api/orders/my-orders
 * @access Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Order.countDocuments({ user: req.user.id });
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('orderId status paymentStatus total items createdAt');

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📍 TRACK ORDER
// ============================================

/**
 * Track order by order ID
 * @route GET /api/orders/track/:orderId
 * @access Public
 */
export const trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .select('orderId status statusHistory trackingNumber shippingCarrier estimatedDelivery deliveredAt createdAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📄 GET ORDER DETAILS
// ============================================

/**
 * Get order details
 * @route GET /api/orders/:orderId
 * @access Private/Public (with orderId)
 */
export const getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('items.product', 'name images slug');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Verify ownership if logged in
    if (req.user && order.user && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ❌ CANCEL ORDER
// ============================================

/**
 * Cancel order
 * @route POST /api/orders/:orderId/cancel
 * @access Private
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ 
      orderId: req.params.orderId,
      user: req.user.id 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Only allow cancellation of pending/confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel order in current status'
      });
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      note: req.body.reason || 'Cancelled by customer'
    });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      if (item.variant?.id) {
        await Product.findOneAndUpdate(
          { _id: item.product, 'variants._id': item.variant.id },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    // Initiate refund if paid
    if (order.paymentStatus === 'paid' && order.razorpayPaymentId) {
      try {
        await paymentService.initiateRefund(order.razorpayPaymentId, null, {
          order_id: order.orderId,
          reason: 'Customer requested cancellation'
        });
        order.paymentStatus = 'refunded';
        await order.save();
      } catch (refundError) {
        console.error('Refund failed:', refundError);
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🧾 GET INVOICE
// ============================================

/**
 * Get order invoice
 * @route GET /api/orders/:orderId/invoice
 * @access Public (with orderId)
 */
export const getInvoice = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (!order.invoiceUrl) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not generated yet'
      });
    }

    res.redirect(order.invoiceUrl);
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📄 GENERATE INVOICE
// ============================================

/**
 * Generate order invoice
 * @route POST /api/orders/:orderId/invoice/generate
 * @access Public
 */
export const generateInvoice = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const result = await invoiceService.generateInvoice(order, true);

    order.invoiceUrl = result.cloudinaryUrl || result.localUrl;
    order.invoiceGeneratedAt = new Date();
    await order.save();

    res.json({
      success: true,
      data: {
        invoiceUrl: order.invoiceUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getMyOrders,
  trackOrder,
  getOrderDetails,
  cancelOrder,
  getInvoice,
  generateInvoice
};
