// /**
//  * ============================================
//  * 🏺 PRODUCT CONTROLLER
//  * ============================================
//  * Product catalog operations
//  */

/**
 * ============================================
 * 🏺 PRODUCT CONTROLLER
 * ============================================
 * Product catalog operations
 */

import Product from '../models/Product.model.js';

// Helper function to transform product for frontend compatibility
const transformProduct = (p) => ({
  ...p.toObject(),
  id: p._id,
  short_description: p.shortDescription,
  original_price: p.compareAtPrice,
  stock_quantity: p.stock,
  in_stock: p.stock > 0,
  is_bestseller: p.isBestseller,
  is_new: p.isNewArrival,
  care_instructions: p.careInstructions,
  review_count: p.reviewCount
});

// ============================================
// 📋 GET ALL PRODUCTS
// ============================================

/**
 * Get products with filtering, sorting, and pagination
 * @route GET /api/products
 * @access Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      page = 1,
      limit = 12,
      search,
      inStock
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-costPrice');

    // Transform products to include both formats for frontend compatibility
    const transformedProducts = products.map(p => ({
      ...p.toObject(),
      id: p._id,
      short_description: p.shortDescription,
      original_price: p.compareAtPrice,
      stock_quantity: p.stock,
      in_stock: p.stock > 0,
      is_bestseller: p.isBestseller,
      is_new: p.isNewArrival,
      care_instructions: p.careInstructions,
      review_count: p.reviewCount
    }));

    res.json({
      success: true,
      data: transformedProducts,
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
// ⭐ GET FEATURED PRODUCTS
// ============================================

/**
 * Get featured products
 * @route GET /api/products/featured
 * @access Public
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 8;
    
    const products = await Product.find({ isActive: true, isFeatured: true })
      .sort('-createdAt')
      .limit(limit)
      .select('-costPrice');

    // Transform for frontend compatibility
    const transformedProducts = products.map(p => ({
      ...p.toObject(),
      id: p._id,
      short_description: p.shortDescription,
      original_price: p.compareAtPrice,
      stock_quantity: p.stock,
      in_stock: p.stock > 0,
      is_bestseller: p.isBestseller,
      is_new: p.isNewArrival,
      care_instructions: p.careInstructions,
      review_count: p.reviewCount
    }));

    res.json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🔥 GET BESTSELLERS
// ============================================

/**
 * Get bestseller products
 * @route GET /api/products/bestsellers
 * @access Public
 */
export const getBestsellers = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 8;
    
    const products = await Product.find({ isActive: true, isBestseller: true })
      .sort('-rating')
      .limit(limit)
      .select('-costPrice');

    // Transform for frontend compatibility
    const transformedProducts = products.map(p => ({
      ...p.toObject(),
      id: p._id,
      short_description: p.shortDescription,
      original_price: p.compareAtPrice,
      stock_quantity: p.stock,
      in_stock: p.stock > 0,
      is_bestseller: p.isBestseller,
      is_new: p.isNewArrival,
      care_instructions: p.careInstructions,
      review_count: p.reviewCount
    }));

    res.json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🆕 GET NEW ARRIVALS
// ============================================

/**
 * Get new arrival products
 * @route GET /api/products/new-arrivals
 * @access Public
 */
export const getNewArrivals = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 8;
    
    const products = await Product.find({ isActive: true, isNewArrival: true })
      .sort('-createdAt')
      .limit(limit)
      .select('-costPrice');

    // Transform for frontend compatibility
    const transformedProducts = products.map(p => ({
      ...p.toObject(),
      id: p._id,
      short_description: p.shortDescription,
      original_price: p.compareAtPrice,
      stock_quantity: p.stock,
      in_stock: p.stock > 0,
      is_bestseller: p.isBestseller,
      is_new: p.isNewArrival,
      care_instructions: p.careInstructions,
      review_count: p.reviewCount
    }));

    res.json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📂 GET CATEGORIES
// ============================================

/**
 * Get product categories with counts
 * @route GET /api/products/categories
 * @access Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          image: { $first: '$thumbnail' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories.map(cat => ({
        name: cat._id,
        count: cat.count,
        image: cat.image
      }))
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🔍 SEARCH PRODUCTS
// ============================================

/**
 * Search products
 * @route GET /api/products/search
 * @access Public
 */
export const searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .limit(Number(limit))
      .select('name slug price thumbnail images category');

    // Transform for frontend compatibility
    const transformedProducts = products.map(transformProduct);

    res.json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📄 GET PRODUCT BY SLUG
// ============================================

/**
 * Get single product by slug
 * @route GET /api/products/slug/:slug
 * @access Public
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    })
      .populate('reviews')
      .select('-costPrice');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Transform for frontend compatibility
    const transformedProduct = {
      ...product.toObject(),
      id: product._id,
      short_description: product.shortDescription,
      original_price: product.compareAtPrice,
      stock_quantity: product.stock,
      in_stock: product.stock > 0,
      is_bestseller: product.isBestseller,
      is_new: product.isNewArrival,
      care_instructions: product.careInstructions,
      review_count: product.reviewCount
    };

    res.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📄 GET PRODUCT BY ID
// ============================================

/**
 * Get single product by ID
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'reviews',
        match: { status: 'approved' },
        options: { sort: { createdAt: -1 }, limit: 10 },
        populate: { path: 'user', select: 'name avatar' }
      })
      .select('-costPrice');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Transform for frontend compatibility
    const transformedProduct = {
      ...product.toObject(),
      id: product._id,
      short_description: product.shortDescription,
      original_price: product.compareAtPrice,
      stock_quantity: product.stock,
      in_stock: product.stock > 0,
      is_bestseller: product.isBestseller,
      is_new: product.isNewArrival,
      care_instructions: product.careInstructions,
      review_count: product.reviewCount
    };

    res.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🔗 GET RELATED PRODUCTS
// ============================================

/**
 * Get related products
 * @route GET /api/products/:id/related
 * @access Public
 */
export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const limit = Number(req.query.limit) || 4;

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } }
      ]
    })
      .sort('-rating')
      .limit(limit)
      .select('-costPrice');

    // Transform for frontend compatibility
    const transformedProducts = relatedProducts.map(p => ({
      ...p.toObject(),
      id: p._id,
      short_description: p.shortDescription,
      original_price: p.compareAtPrice,
      stock_quantity: p.stock,
      in_stock: p.stock > 0,
      is_bestseller: p.isBestseller,
      is_new: p.isNewArrival,
      care_instructions: p.careInstructions,
      review_count: p.reviewCount
    }));

    res.json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🎨 GET PRODUCT VARIANTS
// ============================================

/**
 * Get variants for a product
 * @route GET /api/products/:id/variants
 * @access Public
 */
export const getProductVariants = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select('variants');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Transform variants to include normalized fields
    const variants = (product.variants || []).map(v => ({
      ...v.toObject(),
      id: v._id,
      product_id: req.params.id,
      variant_type: v.color ? 'color' : v.size ? 'size' : 'other',
      variant_value: v.color || v.size || v.name,
      price_adjustment: v.price ? v.price - (product.price || 0) : 0,
      stock_quantity: v.stock,
      is_available: v.isActive && v.stock > 0
    }));

    res.json({
      success: true,
      data: variants
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProducts,
  getFeaturedProducts,
  getBestsellers,
  getNewArrivals,
  getCategories,
  searchProducts,
  getProductBySlug,
  getProductById,
  getRelatedProducts,
  getProductVariants
};











// import Product from '../models/Product.model.js';

// // ============================================
// // 📋 GET ALL PRODUCTS
// // ============================================

// /**
//  * Get products with filtering, sorting, and pagination
//  * @route GET /api/products
//  * @access Public
//  */
// export const getProducts = async (req, res, next) => {
//   try {
//     const {
//       category,
//       minPrice,
//       maxPrice,
//       sort = '-createdAt',
//       page = 1,
//       limit = 12,
//       search,
//       inStock
//     } = req.query;

//     // Build query
//     const query = { isActive: true };

//     if (category) {
//       query.category = category;
//     }

//     if (minPrice || maxPrice) {
//       query.price = {};
//       if (minPrice) query.price.$gte = Number(minPrice);
//       if (maxPrice) query.price.$lte = Number(maxPrice);
//     }

//     if (inStock === 'true') {
//       query.stock = { $gt: 0 };
//     }

//     if (search) {
//       query.$text = { $search: search };
//     }

//     // Execute query
//     const total = await Product.countDocuments(query);
//     const products = await Product.find(query)
//       .sort(sort)
//       .skip((Number(page) - 1) * Number(limit))
//       .limit(Number(limit))
//       .select('-costPrice');

//     res.json({
//       success: true,
//       data: products,
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
// // ⭐ GET FEATURED PRODUCTS
// // ============================================

// /**
//  * Get featured products
//  * @route GET /api/products/featured
//  * @access Public
//  */
// export const getFeaturedProducts = async (req, res, next) => {
//   try {
//     const limit = Number(req.query.limit) || 8;
    
//     const products = await Product.find({ isActive: true, isFeatured: true })
//       .sort('-createdAt')
//       .limit(limit)
//       .select('-costPrice');

//     res.json({
//       success: true,
//       data: products
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 🔥 GET BESTSELLERS
// // ============================================

// /**
//  * Get bestseller products
//  * @route GET /api/products/bestsellers
//  * @access Public
//  */
// export const getBestsellers = async (req, res, next) => {
//   try {
//     const limit = Number(req.query.limit) || 8;
    
//     const products = await Product.find({ isActive: true, isBestseller: true })
//       .sort('-rating')
//       .limit(limit)
//       .select('-costPrice');

//     res.json({
//       success: true,
//       data: products
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 🆕 GET NEW ARRIVALS
// // ============================================

// /**
//  * Get new arrival products
//  * @route GET /api/products/new-arrivals
//  * @access Public
//  */
// export const getNewArrivals = async (req, res, next) => {
//   try {
//     const limit = Number(req.query.limit) || 8;
    
//     const products = await Product.find({ isActive: true, isNewArrival: true })
//       .sort('-createdAt')
//       .limit(limit)
//       .select('-costPrice');

//     res.json({
//       success: true,
//       data: products
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 📂 GET CATEGORIES
// // ============================================

// /**
//  * Get product categories with counts
//  * @route GET /api/products/categories
//  * @access Public
//  */
// export const getCategories = async (req, res, next) => {
//   try {
//     const categories = await Product.aggregate([
//       { $match: { isActive: true } },
//       { 
//         $group: { 
//           _id: '$category', 
//           count: { $sum: 1 },
//           image: { $first: '$thumbnail' }
//         }
//       },
//       { $sort: { count: -1 } }
//     ]);

//     res.json({
//       success: true,
//       data: categories.map(cat => ({
//         name: cat._id,
//         count: cat.count,
//         image: cat.image
//       }))
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 🔍 SEARCH PRODUCTS
// // ============================================

// /**
//  * Search products
//  * @route GET /api/products/search
//  * @access Public
//  */
// export const searchProducts = async (req, res, next) => {
//   try {
//     const { q, limit = 10 } = req.query;

//     if (!q || q.length < 2) {
//       return res.json({ success: true, data: [] });
//     }

//     const products = await Product.find({
//       isActive: true,
//       $or: [
//         { name: { $regex: q, $options: 'i' } },
//         { description: { $regex: q, $options: 'i' } },
//         { tags: { $in: [new RegExp(q, 'i')] } }
//       ]
//     })
//       .limit(Number(limit))
//       .select('name slug price thumbnail images category');

//     res.json({
//       success: true,
//       data: products
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 📄 GET PRODUCT BY SLUG
// // ============================================

// /**
//  * Get single product by slug
//  * @route GET /api/products/slug/:slug
//  * @access Public
//  */
// export const getProductBySlug = async (req, res, next) => {
//   try {
//     const product = await Product.findOne({ 
//       slug: req.params.slug, 
//       isActive: true 
//     })
//       .populate('reviews')
//       .select('-costPrice');

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: product
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 📄 GET PRODUCT BY ID
// // ============================================

// /**
//  * Get single product by ID
//  * @route GET /api/products/:id
//  * @access Public
//  */
// export const getProductById = async (req, res, next) => {
//   try {
//     const product = await Product.findById(req.params.id)
//       .populate({
//         path: 'reviews',
//         match: { status: 'approved' },
//         options: { sort: { createdAt: -1 }, limit: 10 },
//         populate: { path: 'user', select: 'name avatar' }
//       })
//       .select('-costPrice');

//     if (!product || !product.isActive) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: product
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================
// // 🔗 GET RELATED PRODUCTS
// // ============================================

// /**
//  * Get related products
//  * @route GET /api/products/:id/related
//  * @access Public
//  */
// export const getRelatedProducts = async (req, res, next) => {
//   try {
//     const product = await Product.findById(req.params.id);
    
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }

//     const limit = Number(req.query.limit) || 4;

//     const relatedProducts = await Product.find({
//       _id: { $ne: product._id },
//       isActive: true,
//       $or: [
//         { category: product.category },
//         { tags: { $in: product.tags } }
//       ]
//     })
//       .sort('-rating')
//       .limit(limit)
//       .select('-costPrice');

//     res.json({
//       success: true,
//       data: relatedProducts
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export default {
//   getProducts,
//   getFeaturedProducts,
//   getBestsellers,
//   getNewArrivals,
//   getCategories,
//   searchProducts,
//   getProductBySlug,
//   getProductById,
//   getRelatedProducts
// };
