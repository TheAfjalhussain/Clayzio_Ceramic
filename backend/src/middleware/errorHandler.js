/**
 * ============================================
 * ❌ ERROR HANDLER MIDDLEWARE
 * ============================================
 * Global error handling and formatting
 */

/**
 * Global error handler
 * Catches all errors and returns formatted response
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // ============================================
  // 🗄️ MONGOOSE ERRORS
  // ============================================

  // Bad ObjectId
  if (err.name === 'CastError') {
    error = { 
      message: 'Resource not found', 
      statusCode: 404 
    };
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { 
      message: `Duplicate value for field: ${field}`, 
      statusCode: 400 
    };
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error = { 
      message: messages.join(', '), 
      statusCode: 400 
    };
  }

  // ============================================
  // 🔐 JWT ERRORS
  // ============================================

  if (err.name === 'JsonWebTokenError') {
    error = { 
      message: 'Invalid token', 
      statusCode: 401 
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = { 
      message: 'Token expired', 
      statusCode: 401 
    };
  }

  // ============================================
  // 💳 RAZORPAY ERRORS
  // ============================================

  if (err.statusCode === 400 && err.error?.code) {
    error = { 
      message: err.error.description || 'Payment error', 
      statusCode: 400 
    };
  }

  // ============================================
  // 📤 SEND RESPONSE
  // ============================================

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
