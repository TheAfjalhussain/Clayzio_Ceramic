/**
 * ============================================
 * 🔐 AUTHENTICATION MIDDLEWARE
 * ============================================
 * JWT verification and role-based access control
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// ============================================
// 🔒 PROTECT ROUTES
// ============================================

/**
 * Require authentication for route access
 * Verifies JWT token and attaches user to request
 */
export const protect = async (req, res, next) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account has been deactivated'
        });
      }

      // Attach user to request
      req.user = user;
      next();
      
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        error: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🔓 OPTIONAL AUTHENTICATION
// ============================================

/**
 * Optional authentication - attach user if token exists
 * Allows both authenticated and unauthenticated access
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user?.isActive) {
          req.user = user;
        }
      } catch {
        // Token invalid - continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ============================================
// 👑 ROLE-BASED ACCESS
// ============================================

/**
 * Authorize specific roles
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

/**
 * Require admin role
 */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// ============================================
// 🎫 TOKEN GENERATION
// ============================================

/**
 * Generate JWT token for user
 * @param {string} userId - User ID to encode
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export default { protect, optionalAuth, authorize, adminOnly, generateToken };
