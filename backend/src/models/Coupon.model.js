/**
 * ============================================
 * 🎟️ COUPON MODEL
 * ============================================
 * Discount codes and promotional offers
 */

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  // Coupon Code
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  
  description: String,
  
  // Discount Type
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  
  value: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Value cannot be negative']
  },
  
  // Restrictions
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: Number, // Only for percentage type
  
  // Usage Limits
  usageLimit: { type: Number, default: null }, // null = unlimited
  usageCount: { type: Number, default: 0 },
  usageLimitPerUser: { type: Number, default: 1 },
  
  usedBy: [{
    user: mongoose.Schema.Types.ObjectId,
    usedAt: Date,
    orderId: mongoose.Schema.Types.ObjectId
  }],
  
  // Validity Period
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: [true, 'End date is required'] },
  
  // Product Restrictions
  applicableCategories: [String],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // Flags
  isActive: { type: Boolean, default: true },
  isFirstOrderOnly: { type: Boolean, default: false }

}, { timestamps: true });

// ============================================
// 📇 INDEXES
// ============================================

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, endDate: 1 });

// ============================================
// 🔐 INSTANCE METHODS
// ============================================

/**
 * Check if coupon is valid for use
 * @param {string} userId - User ID
 * @param {number} orderAmount - Order amount
 * @param {boolean} isFirstOrder - Is this user's first order
 * @returns {Object} Validation result
 */
couponSchema.methods.isValid = function(userId, orderAmount, isFirstOrder = false) {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is not active' };
  }
  
  // Check date validity
  if (now < this.startDate) {
    return { valid: false, message: 'Coupon is not yet valid' };
  }
  
  if (now > this.endDate) {
    return { valid: false, message: 'Coupon has expired' };
  }
  
  // Check usage limit
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  
  // Check minimum order amount
  if (orderAmount < this.minOrderAmount) {
    return { valid: false, message: `Minimum order amount is ₹${this.minOrderAmount}` };
  }
  
  // Check first order restriction
  if (this.isFirstOrderOnly && !isFirstOrder) {
    return { valid: false, message: 'Coupon is only valid for first order' };
  }
  
  // Check per-user limit
  if (userId) {
    const userUsage = this.usedBy.filter(u => u.user.toString() === userId.toString()).length;
    if (userUsage >= this.usageLimitPerUser) {
      return { valid: false, message: 'You have already used this coupon' };
    }
  }
  
  return { valid: true };
};

/**
 * Calculate discount amount
 * @param {number} orderAmount - Order amount
 * @returns {number} Discount amount
 */
couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (orderAmount * this.value) / 100;
    
    // Apply max discount cap
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else {
    discount = Math.min(this.value, orderAmount);
  }
  
  return Math.round(discount * 100) / 100;
};

// ============================================
// 📤 EXPORT MODEL
// ============================================

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
