/**
 * ============================================
 * 📞 CONTACT MODEL
 * ============================================
 * Contact form submissions and inquiries
 */

import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  // Contact Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  
  phone: String,
  
  // Inquiry Details
  subject: {
    type: String,
    enum: ['general', 'order', 'product', 'partnership', 'feedback', 'newsletter', 'other'],
    default: 'general'
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  
  orderId: String, // For order-related inquiries
  
  // Status Tracking
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  
  // Admin Handling
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  adminNotes: [{
    note: String,
    addedBy: mongoose.Schema.Types.ObjectId,
    addedAt: { type: Date, default: Date.now }
  }],
  
  resolvedAt: Date,
  
  // Response History
  responses: [{
    message: String,
    sentBy: mongoose.Schema.Types.ObjectId,
    sentAt: { type: Date, default: Date.now },
    sentVia: { 
      type: String, 
      enum: ['email', 'whatsapp', 'phone'] 
    }
  }],
  
  // Metadata
  source: {
    type: String,
    enum: ['website', 'whatsapp', 'phone', 'email'],
    default: 'website'
  },
  ipAddress: String,
  userAgent: String

}, { timestamps: true });

// ============================================
// 📇 INDEXES
// ============================================

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

// ============================================
// 📤 EXPORT MODEL
// ============================================

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
