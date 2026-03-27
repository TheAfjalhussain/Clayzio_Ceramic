/**
 * ============================================
 * 🔐 AUTH CONTROLLER
 * ============================================
 * User authentication and account management
 */

import crypto from 'crypto';
import User from '../models/User.model.js';
import { generateToken } from '../middleware/auth.middleware.js';
import * as emailService from '../services/email.service.js';

// ============================================
// 📝 REGISTER
// ============================================

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user).catch(err => {
      console.error('Welcome email failed:', err.message);
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🔑 LOGIN
// ============================================

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 👤 GET CURRENT USER
// ============================================

/**
 * Get current authenticated user
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'name price images slug');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ✏️ UPDATE PROFILE
// ============================================

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, addresses },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🔓 FORGOT PASSWORD
// ============================================

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      // Clear reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to send password reset email'
      });
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🔐 RESET PASSWORD
// ============================================

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate new auth token
    const authToken = generateToken(user._id);

    res.json({
      success: true,
      data: { token: authToken }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🔒 CHANGE PASSWORD
// ============================================

/**
 * Change password (logged in user)
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 🚪 LOGOUT
// ============================================

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res, next) => {
  try {
    // In stateless JWT, logout is handled client-side
    // This endpoint exists for any cleanup if needed
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  logout
};
