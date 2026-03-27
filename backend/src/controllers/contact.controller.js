/**
 * ============================================
 * 📞 CONTACT CONTROLLER
 * ============================================
 * Contact form and newsletter
 */

import Contact from '../models/Contact.model.js';

// ============================================
// 📝 SUBMIT CONTACT FORM
// ============================================

/**
 * Submit contact form
 * @route POST /api/contact
 * @access Public
 */
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, orderId } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject: subject || 'general',
      message,
      orderId,
      source: 'website',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    console.log('📞 Contact submission received:', contact._id);

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will respond within 24-48 hours.',
      data: {
        id: contact._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// 📧 NEWSLETTER SUBSCRIPTION
// ============================================

/**
 * Subscribe to newsletter
 * @route POST /api/contact/newsletter
 * @access Public
 */
export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if already subscribed
    const existingContact = await Contact.findOne({ 
      email, 
      subject: 'newsletter' 
    });

    if (existingContact) {
      return res.json({
        success: true,
        message: 'You are already subscribed to our newsletter!'
      });
    }

    await Contact.create({
      name: 'Newsletter Subscriber',
      email,
      subject: 'newsletter',
      message: 'Newsletter subscription',
      source: 'website',
      status: 'resolved'
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to the Clay Club! Check your email for exclusive offers.'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  submitContact,
  subscribeNewsletter
};
