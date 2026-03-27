// /**
//  * ============================================
//  * ⭐ REVIEW MODEL
//  * ============================================
//  * Product review and rating schema
//  */

/**
 * ============================================
 * ⭐ REVIEW MODEL
 * ============================================
 * Product review and rating schema
 */

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // References
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional for guest reviews
  },
  
  // Guest reviewer info (when user is not logged in)
  reviewerName: {
    type: String,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  reviewerEmail: {
    type: String,
    lowercase: true
  },

  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Review Content
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  
  title: {
    type: String,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  
  images: [String],
  
  // Verification
  isVerifiedPurchase: { type: Boolean, default: false },
  
  // Helpfulness
  helpfulCount: { type: Number, default: 0 },
  helpfulVotes: [{
    user: mongoose.Schema.Types.ObjectId,
    votedAt: Date
  }],
  
  // Admin Response
  adminResponse: {
    comment: String,
    respondedAt: Date,
    respondedBy: mongoose.Schema.Types.ObjectId
  },
  
  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  
  // Metadata
  ipAddress: String,
  userAgent: String

}, { timestamps: true });

// ============================================
// 📇 INDEXES
// ============================================

reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Prevent duplicate reviews per user per product (only when user is logged in)
reviewSchema.index({ product: 1, user: 1 }, { 
  unique: true, 
  sparse: true,  // Allow null user values
  partialFilterExpression: { user: { $exists: true, $ne: null } }
});

// ============================================
// 📋 STATIC METHODS
// ============================================

/**
 * Recalculate product rating after review changes
 * @param {ObjectId} productId - Product to update
 */
reviewSchema.statics.calculateProductRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Update product with new rating
  const Product = mongoose.model('Product');
  
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0
    });
  }
};

// ============================================
// 🔧 POST-SAVE HOOKS
// ============================================

reviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    await this.constructor.calculateProductRating(this.product);
  }
});

reviewSchema.post('deleteOne', { document: true }, async function() {
  await this.constructor.calculateProductRating(this.product);
});

// ============================================
// 📤 EXPORT MODEL
// ============================================

const Review = mongoose.model('Review', reviewSchema);
export default Review;








// Previous schema


// import mongoose from 'mongoose';

// const reviewSchema = new mongoose.Schema({
//   // References
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
  
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
  
//   order: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Order'
//   },
  
//   // Review Content
//   rating: {
//     type: Number,
//     required: [true, 'Rating is required'],
//     min: 1,
//     max: 5
//   },
  
//   title: {
//     type: String,
//     maxlength: [200, 'Title cannot exceed 200 characters']
//   },
  
//   comment: {
//     type: String,
//     required: [true, 'Review comment is required'],
//     maxlength: [2000, 'Comment cannot exceed 2000 characters']
//   },
  
//   images: [String],
  
//   // Verification
//   isVerifiedPurchase: { type: Boolean, default: false },
  
//   // Helpfulness
//   helpfulCount: { type: Number, default: 0 },
//   helpfulVotes: [{
//     user: mongoose.Schema.Types.ObjectId,
//     votedAt: Date
//   }],
  
//   // Admin Response
//   adminResponse: {
//     comment: String,
//     respondedAt: Date,
//     respondedBy: mongoose.Schema.Types.ObjectId
//   },
  
//   // Moderation
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending'
//   },
//   rejectionReason: String,
  
//   // Metadata
//   ipAddress: String,
//   userAgent: String

// }, { timestamps: true });

// // ============================================
// // 📇 INDEXES
// // ============================================

// reviewSchema.index({ product: 1, status: 1 });
// reviewSchema.index({ user: 1 });
// reviewSchema.index({ rating: 1 });
// reviewSchema.index({ createdAt: -1 });

// // Prevent duplicate reviews per user per product
// reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// // ============================================
// // 📋 STATIC METHODS
// // ============================================

// /**
//  * Recalculate product rating after review changes
//  * @param {ObjectId} productId - Product to update
//  */
// reviewSchema.statics.calculateProductRating = async function(productId) {
//   const stats = await this.aggregate([
//     { $match: { product: productId, status: 'approved' } },
//     {
//       $group: {
//         _id: '$product',
//         avgRating: { $avg: '$rating' },
//         count: { $sum: 1 }
//       }
//     }
//   ]);

//   // Update product with new rating
//   const Product = mongoose.model('Product');
  
//   if (stats.length > 0) {
//     await Product.findByIdAndUpdate(productId, {
//       rating: Math.round(stats[0].avgRating * 10) / 10,
//       reviewCount: stats[0].count
//     });
//   } else {
//     await Product.findByIdAndUpdate(productId, {
//       rating: 0,
//       reviewCount: 0
//     });
//   }
// };

// // ============================================
// // 🔧 POST-SAVE HOOKS
// // ============================================

// reviewSchema.post('save', async function() {
//   if (this.status === 'approved') {
//     await this.constructor.calculateProductRating(this.product);
//   }
// });

// reviewSchema.post('deleteOne', { document: true }, async function() {
//   await this.constructor.calculateProductRating(this.product);
// });

// // ============================================
// // 📤 EXPORT MODEL
// // ============================================

// const Review = mongoose.model('Review', reviewSchema);
// export default Review;
