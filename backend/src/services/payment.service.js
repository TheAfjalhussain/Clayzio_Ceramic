/**
 * ============================================
 * 💳 PAYMENT SERVICE
 * ============================================
 * Razorpay payment integration
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ============================================
// 📝 CREATE ORDER
// ============================================

/**
 * Create a Razorpay order for payment
 * @param {number} amount - Amount in INR
 * @param {string} orderId - Internal order ID
 * @param {Object} customerInfo - Customer details
 * @returns {Promise<Object>} Razorpay order details
 */
export const createOrder = async (amount, orderId, customerInfo = {}) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: orderId,
      notes: {
        order_id: orderId,
        customer_name: customerInfo.name || '',
        customer_email: customerInfo.email || '',
        customer_phone: customerInfo.phone || ''
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    console.log('✅ Razorpay order created:', razorpayOrder.id);
    
    return {
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status
      },
      key_id: process.env.RAZORPAY_KEY_ID
    };
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
};

// ============================================
// ✅ VERIFY PAYMENT
// ============================================

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Payment signature
 * @returns {boolean} Verification result
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + '|' + paymentId;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === signature;
    
    if (!isValid) {
      console.error('❌ Payment signature verification failed');
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Error verifying payment signature:', error);
    return false;
  }
};

// ============================================
// 📋 GET PAYMENT DETAILS
// ============================================

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    
    return {
      id: payment.id,
      amount: payment.amount / 100, // Convert from paise
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      card_id: payment.card_id,
      bank: payment.bank,
      wallet: payment.wallet,
      vpa: payment.vpa,
      created_at: new Date(payment.created_at * 1000)
    };
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
};

// ============================================
// 💰 INITIATE REFUND
// ============================================

/**
 * Initiate refund for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number|null} amount - Amount to refund (null for full refund)
 * @param {Object} notes - Additional notes
 * @returns {Promise<Object>} Refund details
 */
export const initiateRefund = async (paymentId, amount = null, notes = {}) => {
  try {
    const refundOptions = { notes };

    // Partial refund if amount specified
    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    
    console.log('✅ Refund initiated:', refund.id);
    
    return {
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        payment_id: refund.payment_id,
        status: refund.status,
        created_at: new Date(refund.created_at * 1000)
      }
    };
  } catch (error) {
    console.error('❌ Error initiating refund:', error);
    throw new Error('Failed to initiate refund');
  }
};

// ============================================
// 📊 GET REFUND STATUS
// ============================================

/**
 * Get refund status
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} refundId - Razorpay refund ID
 * @returns {Promise<Object>} Refund status
 */
export const getRefundStatus = async (paymentId, refundId) => {
  try {
    const refund = await razorpay.payments.fetchRefund(paymentId, refundId);
    
    return {
      id: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      speed_processed: refund.speed_processed,
      speed_requested: refund.speed_requested
    };
  } catch (error) {
    console.error('❌ Error fetching refund status:', error);
    throw new Error('Failed to fetch refund status');
  }
};

// ============================================
// 🔗 CREATE PAYMENT LINK
// ============================================

/**
 * Create a shareable payment link
 * @param {number} amount - Amount in INR
 * @param {string} orderId - Internal order ID
 * @param {Object} customerInfo - Customer details
 * @param {string} description - Payment description
 * @returns {Promise<Object>} Payment link details
 */
export const createPaymentLink = async (amount, orderId, customerInfo, description) => {
  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      accept_partial: false,
      description: description || `Payment for Order #${orderId}`,
      customer: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: { order_id: orderId },
      callback_url: `${process.env.FRONTEND_URL}/order-success`,
      callback_method: 'get'
    });

    return {
      success: true,
      paymentLink: {
        id: paymentLink.id,
        short_url: paymentLink.short_url,
        amount: paymentLink.amount / 100,
        status: paymentLink.status
      }
    };
  } catch (error) {
    console.error('❌ Error creating payment link:', error);
    throw new Error('Failed to create payment link');
  }
};

// ============================================
// 📋 GET ORDER DETAILS
// ============================================

/**
 * Fetch order details from Razorpay
 * @param {string} razorpayOrderId - Razorpay order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrderDetails = async (razorpayOrderId) => {
  try {
    const order = await razorpay.orders.fetch(razorpayOrderId);
    
    return {
      id: order.id,
      amount: order.amount / 100,
      amount_paid: order.amount_paid / 100,
      amount_due: order.amount_due / 100,
      currency: order.currency,
      status: order.status,
      attempts: order.attempts,
      created_at: new Date(order.created_at * 1000)
    };
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    throw new Error('Failed to fetch order details');
  }
};

// ============================================
// 📤 EXPORT ALL FUNCTIONS
// ============================================

export default {
  createOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  initiateRefund,
  getRefundStatus,
  createPaymentLink,
  getOrderDetails
};
