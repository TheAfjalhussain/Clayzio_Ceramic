// /**
//  * ============================================
//  * ⭐ REVIEW CONTROLLER
//  * ============================================
//  * Product reviews and ratings
//  */


/**
 * ============================================
 * ⭐ REVIEW CONTROLLER
 * ============================================
 * Product reviews and ratings
 */

import Review from '../models/Review.model.js';
import Order from '../models/Order.model.js';

// ============================================
// 📋 GET PRODUCT REVIEWS
// ============================================

/**
 * Get reviews for a product
 * @route GET /api/reviews/product/:productId
 * @access Public
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const { productId } = req.params;

    // Handle both MongoDB ObjectId and string format
    let query;
    try {
      const mongoose = (await import('mongoose')).default;
      query = { product: new mongoose.Types.ObjectId(productId), status: 'approved' };
    } catch {
      query = { product: productId, status: 'approved' };
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('user', 'name avatar');

    // Transform reviews for frontend compatibility
    const transformedReviews = reviews.map(r => ({
      ...r.toObject(),
      id: r._id,
      product_id: r.product,
      user_id: r.user?._id,
      reviewer_name: r.reviewerName || r.user?.name || 'Anonymous',
      reviewer_email: r.reviewerEmail,
      is_verified_purchase: r.isVerifiedPurchase,
      is_approved: r.status === 'approved',
      created_at: r.createdAt,
      updated_at: r.updatedAt
    }));

    res.json({
      success: true,
      data: transformedReviews,
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
// 📝 CREATE REVIEW
// ============================================

/**
 * Create a new review
 * @route POST /api/reviews
 * @access Private
 */
export const createReview = async (req, res, next) => {
  try {
    const { product, rating, title, comment, images, reviewerName, reviewerEmail } = req.body;

    // Check for existing review (only for logged-in users)
    if (req.user?.id) {
      const existingReview = await Review.findOne({
        product,
        user: req.user.id
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          error: 'You have already reviewed this product'
        });
      }
    }

    // Check if verified purchase (only for logged-in users)
    let hasPurchased = null;
    if (req.user?.id) {
      hasPurchased = await Order.findOne({
        user: req.user.id,
        'items.product': product,
        status: 'delivered'
      });
    }

    const review = await Review.create({
      product,
      user: req.user?.id || null,
      reviewerName: reviewerName || req.user?.name || 'Anonymous',
      reviewerEmail: reviewerEmail || req.user?.email,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: !!hasPurchased,
      order: hasPurchased?._id,
      status: 'pending',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    if (review.user) {
      await review.populate('user', 'name avatar');
    }

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully. It will be visible after approval.'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ✏️ UPDATE REVIEW
// ============================================

/**
 * Update a review
 * @route PUT /api/reviews/:id
 * @access Private
 */
export const updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment, images } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    review.status = 'pending'; // Re-approve after edit

    await review.save();
    await review.populate('user', 'name avatar');

    res.json({
      success: true,
      data: review,
      message: 'Review updated. It will be visible after re-approval.'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ❌ DELETE REVIEW
// ============================================

/**
 * Delete a review
 * @route DELETE /api/reviews/:id
 * @access Private
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate product rating
    await Review.calculateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 👍 MARK HELPFUL
// ============================================

/**
 * Toggle helpful vote on a review
 * @route POST /api/reviews/:id/helpful
 * @access Private
 */
export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if user already voted
    const hasVoted = review.helpfulVotes.some(
      vote => vote.user.toString() === req.user.id
    );

    if (hasVoted) {
      // Remove vote
      review.helpfulVotes = review.helpfulVotes.filter(
        vote => vote.user.toString() !== req.user.id
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add vote
      review.helpfulVotes.push({
        user: req.user.id,
        votedAt: new Date()
      });
      review.helpfulCount += 1;
    }

    await review.save();

    res.json({
      success: true,
      data: {
        helpfulCount: review.helpfulCount,
        hasVoted: !hasVoted
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful
};

















// previous code before bug solving.

// import Review from '../models/Review.model.js';
// import Order from '../models/Order.model.js';

// // ============================================
// // 📋 GET PRODUCT REVIEWS
// // ============================================

// /**
//  * Get reviews for a product
//  * @route GET /api/reviews/product/:productId
//  * @access Public
//  */
// export const getProductReviews = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
//     const { productId } = req.params;

//     const query = { product: productId, status: 'approved' };

//     const total = await Review.countDocuments(query);
//     const reviews = await Review.find(query)
//       .sort(sort)
//       .skip((Number(page) - 1) * Number(limit))
//       .limit(Number(limit))
//       .populate('user', 'name avatar');

//     // Calculate rating distribution
//     const ratingDistribution = await Review.aggregate([
//       { $match: { product: productId, status: 'approved' } },
//       { $group: { _id: '$rating', count: { $sum: 1 } } },
//       { $sort: { _id: -1 } }
//     ]);

//     res.json({
//       success: true,
//       data: reviews,
//       ratingDistribution: ratingDistribution.reduce((acc, curr) => {
//         acc[curr._id] = curr.count;
//         return acc;
//       }, {}),
//       pagination: {
//         total,
//         page: Number(page),
//         limit: Number(limit),
//         pages: Math.ceil(total / Number(limit))
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 📝 CREATE REVIEW
// // ============================================

// /**
//  * Create a new review
//  * @route POST /api/reviews
//  * @access Private
//  */
// export const createReview = async (req, res, next) => {
//   try {
//     const { product, rating, title, comment, images } = req.body;

//     // Check for existing review
//     const existingReview = await Review.findOne({
//       product,
//       user: req.user.id
//     });

//     if (existingReview) {
//       return res.status(400).json({
//         success: false,
//         error: 'You have already reviewed this product'
//       });
//     }

//     // Check if verified purchase
//     const hasPurchased = await Order.findOne({
//       user: req.user.id,
//       'items.product': product,
//       status: 'delivered'
//     });

//     const review = await Review.create({
//       product,
//       user: req.user.id,
//       rating,
//       title,
//       comment,
//       images: images || [],
//       isVerifiedPurchase: !!hasPurchased,
//       order: hasPurchased?._id,
//       status: 'pending',
//       ipAddress: req.ip,
//       userAgent: req.get('user-agent')
//     });

//     await review.populate('user', 'name avatar');

//     res.status(201).json({
//       success: true,
//       data: review,
//       message: 'Review submitted successfully. It will be visible after approval.'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // ✏️ UPDATE REVIEW
// // ============================================

// /**
//  * Update a review
//  * @route PUT /api/reviews/:id
//  * @access Private
//  */
// export const updateReview = async (req, res, next) => {
//   try {
//     const { rating, title, comment, images } = req.body;

//     const review = await Review.findOne({
//       _id: req.params.id,
//       user: req.user.id
//     });

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         error: 'Review not found'
//       });
//     }

//     review.rating = rating || review.rating;
//     review.title = title || review.title;
//     review.comment = comment || review.comment;
//     review.images = images || review.images;
//     review.status = 'pending'; // Re-approve after edit

//     await review.save();
//     await review.populate('user', 'name avatar');

//     res.json({
//       success: true,
//       data: review,
//       message: 'Review updated. It will be visible after re-approval.'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // ❌ DELETE REVIEW
// // ============================================

// /**
//  * Delete a review
//  * @route DELETE /api/reviews/:id
//  * @access Private
//  */
// export const deleteReview = async (req, res, next) => {
//   try {
//     const review = await Review.findOne({
//       _id: req.params.id,
//       user: req.user.id
//     });

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         error: 'Review not found'
//       });
//     }

//     const productId = review.product;
//     await review.deleteOne();

//     // Recalculate product rating
//     await Review.calculateProductRating(productId);

//     res.json({
//       success: true,
//       message: 'Review deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 👍 MARK HELPFUL
// // ============================================

// /**
//  * Toggle helpful vote on a review
//  * @route POST /api/reviews/:id/helpful
//  * @access Private
//  */
// export const markHelpful = async (req, res, next) => {
//   try {
//     const review = await Review.findById(req.params.id);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         error: 'Review not found'
//       });
//     }

//     // Check if user already voted
//     const hasVoted = review.helpfulVotes.some(
//       vote => vote.user.toString() === req.user.id
//     );

//     if (hasVoted) {
//       // Remove vote
//       review.helpfulVotes = review.helpfulVotes.filter(
//         vote => vote.user.toString() !== req.user.id
//       );
//       review.helpfulCount = Math.max(0, review.helpfulCount - 1);
//     } else {
//       // Add vote
//       review.helpfulVotes.push({
//         user: req.user.id,
//         votedAt: new Date()
//       });
//       review.helpfulCount += 1;
//     }

//     await review.save();

//     res.json({
//       success: true,
//       data: {
//         helpfulCount: review.helpfulCount,
//         hasVoted: !hasVoted
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export default {
//   getProductReviews,
//   createReview,
//   updateReview,
//   deleteReview,
//   markHelpful
// };
