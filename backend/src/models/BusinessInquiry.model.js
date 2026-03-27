/**
 * ============================================
 * 🏢 BUSINESS INQUIRY MODEL
 * ============================================
 * B2B inquiries and corporate partnerships
 */

import mongoose from 'mongoose';

const businessInquirySchema = new mongoose.Schema({
  // Inquiry Identification
  inquiryId: {
    type: String,
    unique: true,
    default: () => `BIZ-${Date.now().toString(36).toUpperCase()}`
  },
  
  // Company Information
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  
  phone: {
    type: String,
    required: [true, 'Phone is required']
  },
  
  // Service Details
  serviceType: {
    type: String,
    enum: ['bulk_orders', 'manufacturing', 'customization', 'hotel_restaurant', 'corporate_gifting', 'other'],
    required: true
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  
  // Additional Business Details
  businessType: String,
  estimatedQuantity: String,
  budget: String,
  timeline: String,
  
  requirements: {
    products: [String],
    customization: String,
    branding: Boolean,
    packaging: String
  },
  
  // Attachments
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: Date
  }],
  
  // Status Tracking
  status: {
    type: String,
    enum: ['new', 'contacted', 'in_discussion', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost'],
    default: 'new'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Admin Handling
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  notes: [{
    content: String,
    addedBy: mongoose.Schema.Types.ObjectId,
    addedAt: { type: Date, default: Date.now }
  }],
  
  followUpDate: Date,
  
  // Proposal
  proposal: {
    sentAt: Date,
    amount: Number,
    documentUrl: String,
    validUntil: Date,
    status: { 
      type: String, 
      enum: ['draft', 'sent', 'accepted', 'rejected'] 
    }
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['website', 'whatsapp', 'phone', 'email', 'referral'],
    default: 'website'
  },
  referralSource: String,
  ipAddress: String,
  userAgent: String

}, { timestamps: true });

// ============================================
// 📇 INDEXES
// ============================================

businessInquirySchema.index({ inquiryId: 1 });
businessInquirySchema.index({ status: 1, createdAt: -1 });
businessInquirySchema.index({ serviceType: 1 });
businessInquirySchema.index({ priority: 1 });

// ============================================
// 📤 EXPORT MODEL
// ============================================

const BusinessInquiry = mongoose.model('BusinessInquiry', businessInquirySchema);
export default BusinessInquiry;
