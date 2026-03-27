/**
 * ============================================
 * 🏢 BUSINESS CONTROLLER
 * ============================================
 * B2B inquiries and partnerships
 */

import BusinessInquiry from '../models/BusinessInquiry.model.js';
import * as emailService from '../services/email.service.js';

// ============================================
// 📝 SUBMIT BUSINESS INQUIRY
// ============================================

/**
 * Submit a business inquiry
 * @route POST /api/business/inquiry
 * @access Public
 */
export const submitInquiry = async (req, res, next) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      serviceType,
      message,
      businessType,
      estimatedQuantity,
      budget,
      timeline,
      requirements
    } = req.body;

    const inquiry = await BusinessInquiry.create({
      companyName,
      contactPerson,
      email,
      phone,
      serviceType,
      message,
      businessType,
      estimatedQuantity,
      budget,
      timeline,
      requirements,
      source: 'website',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Send confirmation email
    emailService.sendBusinessInquiryConfirmation(inquiry).catch(err => {
      console.error('Business inquiry email failed:', err.message);
    });

    console.log('🏢 New business inquiry:', inquiry.inquiryId);

    res.status(201).json({
      success: true,
      message: 'Thank you for your inquiry! Our business team will contact you within 24 hours.',
      data: {
        inquiryId: inquiry.inquiryId
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📋 GET BUSINESS SERVICES
// ============================================

/**
 * Get available business services
 * @route GET /api/business/services
 * @access Public
 */
export const getServices = async (req, res, next) => {
  try {
    const services = [
      {
        id: 'bulk_orders',
        name: 'Bulk Orders',
        description: 'Minimum 50 pieces with volume discounts up to 40%',
        icon: 'package',
        features: [
          'Minimum 50 pieces per order',
          'Volume discounts up to 40%',
          'Dedicated account manager',
          'Priority shipping'
        ]
      },
      {
        id: 'manufacturing',
        name: 'Private Label Manufacturing',
        description: 'Create your own ceramic brand with our manufacturing expertise',
        icon: 'factory',
        features: [
          'Custom product development',
          'White label options',
          'Quality control',
          'Flexible MOQ'
        ]
      },
      {
        id: 'customization',
        name: 'Custom Design',
        description: 'Logo engraving, custom colors, and unique designs',
        icon: 'palette',
        features: [
          'Logo engraving',
          'Custom colors & glazes',
          'Unique shapes & sizes',
          'Prototype development'
        ]
      },
      {
        id: 'hotel_restaurant',
        name: 'Hotels & Restaurants',
        description: 'Commercial-grade tableware for hospitality industry',
        icon: 'utensils',
        features: [
          'Durable commercial grade',
          'Bulk pricing',
          'Regular supply contracts',
          'Custom branding options'
        ]
      },
      {
        id: 'corporate_gifting',
        name: 'Corporate Gifting',
        description: 'Premium ceramic gifts with custom branding',
        icon: 'gift',
        features: [
          'Gift packaging',
          'Company logo branding',
          'Bulk discounts',
          'Pan-India delivery'
        ]
      }
    ];

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

export default {
  submitInquiry,
  getServices
};
