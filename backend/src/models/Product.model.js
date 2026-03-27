/**
 * ============================================
 * 🏺 PRODUCT MODEL
 * ============================================
 * Product catalog schema with variants
 */

import mongoose from 'mongoose';
import slugify from 'slugify';

// ============================================
// 🎨 VARIANT SUB-SCHEMA
// ============================================

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: Number,
  stock: { type: Number, default: 0 },
  color: String,
  size: String,
  weight: String,
  images: [String],
  isActive: { type: Boolean, default: true }
});

// ============================================
// 🏺 PRODUCT SCHEMA
// ============================================

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['dinnerware', 'serveware', 'drinkware', 'decor', 'planters', 'sets', 'gifting']
  },
  
  subcategory: String,
  tags: [String],
  
  // Media
  images: {
    type: [String],
    validate: [arr => arr.length > 0, 'At least one image is required']
  },
  
  thumbnail: String,
  
  // Variants
  variants: [variantSchema],
  
  // Physical Details
  materials: { type: String, default: 'Premium Ceramic' },
  dimensions: String,
  weight: String,
  careInstructions: {
    type: String,
    default: 'Hand wash recommended. Microwave and dishwasher safe.'
  },
  
  // Inventory
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  sku: { type: String, unique: true, sparse: true },
  barcode: String,
  
  // Flags
  isFeatured: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // Ratings
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  
  // Shipping
  freeShipping: { type: Boolean, default: false },
  shippingWeight: Number

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// 📇 INDEXES
// ============================================

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isBestseller: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

// ============================================
// 🔧 PRE-SAVE HOOKS
// ============================================

productSchema.pre('save', function(next) {
  // Generate slug from name
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  // Set thumbnail from first image
  if (!this.thumbnail && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
  
  next();
});

// ============================================
// 🎯 VIRTUAL PROPERTIES
// ============================================

/**
 * Calculate discount percentage
 */
productSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

/**
 * Get stock status
 */
productSchema.virtual('stockStatus').get(function() {
  if (this.stock <= 0) return 'out_of_stock';
  if (this.stock <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

/**
 * Virtual populate for reviews
 */
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

// ============================================
// 📤 EXPORT MODEL
// ============================================

const Product = mongoose.model('Product', productSchema);
export default Product;
