/**
 * ============================================
 * 💳 PAYMENT CONTROLLER
 * ============================================
 * Razorpay payment processing
 */

import crypto from 'crypto';
import Order from '../models/Order.model.js';
import * as paymentService from '../services/payment.service.js';
import * as emailService from '../services/email.service.js';
import * as invoiceService from '../services/invoice.service.js';

// ============================================
// 📝 CREATE PAYMENT ORDER
// ============================================

/**
 * Create Razorpay payment order
 * @route POST /api/payments/create-order
 * @access Public
 */
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, orderId, customerInfo } = req.body;

    const result = await paymentService.createOrder(amount, orderId, customerInfo);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ✅ VERIFY PAYMENT
// ============================================

/**
 * Verify Razorpay payment signature
 * @route POST /api/payments/verify
 * @access Public
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Verify signature
    const isValid = paymentService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

    // Update order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      note: 'Payment received'
    });
    await order.save();

    // Generate invoice
    try {
      const invoiceResult = await invoiceService.generateInvoice(order, true);
      order.invoiceUrl = invoiceResult.cloudinaryUrl || invoiceResult.localUrl;
      order.invoiceGeneratedAt = new Date();
      await order.save();
    } catch (invoiceError) {
      console.error('Invoice generation failed:', invoiceError);
    }

    // Send confirmation emails
    emailService.sendOrderConfirmation(order).catch(console.error);
    emailService.sendAdminOrderNotification(order).catch(console.error);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: order.orderId,
        paymentId: razorpay_payment_id,
        status: order.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📋 GET PAYMENT STATUS
// ============================================

/**
 * Get payment status
 * @route GET /api/payments/status/:paymentId
 * @access Public
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentDetails(req.params.paymentId);

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🔔 HANDLE WEBHOOK
// ============================================

/**
 * Handle Razorpay webhook events
 * @route POST /api/payments/webhook
 * @access Public (verified by signature)
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const { payload } = event;

    console.log('📥 Razorpay webhook received:', event.event);

    // Handle different events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;

      case 'refund.created':
        await handleRefundCreated(payload.refund.entity);
        break;

      case 'refund.processed':
        await handleRefundProcessed(payload.refund.entity);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// ============================================
// 🔧 WEBHOOK HANDLERS
// ============================================

/**
 * Handle payment captured event
 */
const handlePaymentCaptured = async (payment) => {
  try {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    
    if (order && order.paymentStatus !== 'paid') {
      order.razorpayPaymentId = payment.id;
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        note: 'Payment captured via webhook'
      });
      await order.save();

      // Send emails
      await emailService.sendOrderConfirmation(order);
      await emailService.sendAdminOrderNotification(order);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
};

/**
 * Handle payment failed event
 */
const handlePaymentFailed = async (payment) => {
  try {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    
    if (order) {
      order.paymentStatus = 'failed';
      order.statusHistory.push({
        status: order.status,
        note: `Payment failed: ${payment.error_description || 'Unknown error'}`
      });
      await order.save();
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

/**
 * Handle refund created event
 */
const handleRefundCreated = async (refund) => {
  try {
    const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
    
    if (order) {
      order.statusHistory.push({
        status: order.status,
        note: `Refund initiated: ₹${refund.amount / 100}`
      });
      await order.save();
    }
  } catch (error) {
    console.error('Error handling refund created:', error);
  }
};

/**
 * Handle refund processed event
 */
const handleRefundProcessed = async (refund) => {
  try {
    const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
    
    if (order) {
      // Check if full or partial refund
      if (refund.amount === order.total * 100) {
        order.paymentStatus = 'refunded';
      } else {
        order.paymentStatus = 'partially_refunded';
      }
      
      order.statusHistory.push({
        status: order.status,
        note: `Refund processed: ₹${refund.amount / 100}`
      });
      await order.save();
    }
  } catch (error) {
    console.error('Error handling refund processed:', error);
  }
};

export default {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  handleWebhook
};
