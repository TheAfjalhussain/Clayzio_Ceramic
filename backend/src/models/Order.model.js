/**
 * ============================================
 * 📦 ORDER MODEL
 * ============================================
 * Customer order schema with payment tracking
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// 🛒 ORDER ITEM SUB-SCHEMA
// ============================================

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  productImage: String,
  variant: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    sku: String
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: { type: Number, required: true },
  total: { type: Number, required: true }
});

// ============================================
// 📦 ORDER SCHEMA
// ============================================

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderId: {
    type: String,
    unique: true,
    default: () => `CLZ-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Customer Details
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true, lowercase: true },
  customerPhone: { type: String, required: true },
  
  // Order Items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  discountCode: String,
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Addresses
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    landmark: String
  },
  
  billingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Payment
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod', 'upi', 'card', 'netbanking'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  // Status History
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: mongoose.Schema.Types.ObjectId
  }],
  
  // Shipping Details
  trackingNumber: String,
  shippingCarrier: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  
  // Invoice
  invoiceNumber: String,
  invoiceUrl: String,
  invoiceGeneratedAt: Date,
  
  // Notes
  customerNote: String,
  adminNote: String,
  
  // Metadata
  source: {
    type: String,
    enum: ['website', 'mobile', 'whatsapp', 'phone'],
    default: 'website'
  },
  ipAddress: String,
  userAgent: String

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// 📇 INDEXES
// ============================================

orderSchema.index({ orderId: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerEmail: 1 });

// ============================================
// 🔧 PRE-SAVE HOOKS
// ============================================

orderSchema.pre('save', function(next) {
  // Add status to history when changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// ============================================
// 🎯 VIRTUAL PROPERTIES
// ============================================

/**
 * Get total item count
 */
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ============================================
// 📋 STATIC METHODS
// ============================================

/**
 * Generate unique invoice number
 * @returns {Promise<string>} Invoice number
 */
orderSchema.statics.generateInvoiceNumber = async function() {
  const count = await this.countDocuments();
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  return `INV-${year}${month}-${(count + 1).toString().padStart(5, '0')}`;
};

// ============================================
// 📤 EXPORT MODEL
// ============================================

const Order = mongoose.model('Order', orderSchema);
export default Order;
