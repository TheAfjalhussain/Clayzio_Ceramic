/**
 * ============================================
 * 👤 USER MODEL
 * ============================================
 * User account and authentication schema
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ============================================
// 📍 ADDRESS SUB-SCHEMA
// ============================================

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

// ============================================
// 👤 USER SCHEMA
// ============================================

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include in queries by default
  },
  
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  // Profile
  avatar: {
    type: String,
    default: null
  },
  
  addresses: [addressSchema],
  
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Email Verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Account Status
  lastLogin: Date,
  isActive: { type: Boolean, default: true }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// 📇 INDEXES
// ============================================

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ============================================
// 🔒 PASSWORD HASHING
// ============================================

userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================
// 🔐 INSTANCE METHODS
// ============================================

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} Match result
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ============================================
// 🎯 VIRTUAL PROPERTIES
// ============================================

/**
 * Get the default address
 */
userSchema.virtual('defaultAddress').get(function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

// ============================================
// 📤 EXPORT MODEL
// ============================================

const User = mongoose.model('User', userSchema);
export default User;
