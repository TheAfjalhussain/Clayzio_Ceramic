/**
 * ============================================
 * 📧 EMAIL SERVICE
 * ============================================
 * Email sending using Resend API
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@clayzio.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================
// 📦 ORDER CONFIRMATION EMAIL
// ============================================

/**
 * Send order confirmation email to customer
 * @param {Object} order - Order document
 */
export const sendOrderConfirmation = async (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <img src="${item.productImage}" alt="${item.productName}" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        ${item.productName}${item.variant?.name ? ` - ${item.variant.name}` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${item.total.toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - Clayzio</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8B7355; margin: 0;">🏺 Clayzio</h1>
        <p style="color: #666; margin: 5px 0;">Premium Handcrafted Ceramics</p>
      </div>
      
      <!-- Hero Banner -->
      <div style="background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0 0 10px;">Thank You for Your Order!</h2>
        <p style="margin: 0; opacity: 0.9;">Order #${order.orderId}</p>
      </div>
      
      <p>Hi ${order.customerName},</p>
      <p>Your order has been confirmed and is being prepared with care.</p>
      
      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f8f8f8;">
            <th style="padding: 12px; text-align: left;">Image</th>
            <th style="padding: 12px; text-align: left;">Product</th>
            <th style="padding: 12px; text-align: center;">Qty</th>
            <th style="padding: 12px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      
      <!-- Totals -->
      <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%;">
          <tr>
            <td>Subtotal</td>
            <td style="text-align: right;">₹${order.subtotal.toLocaleString('en-IN')}</td>
          </tr>
          ${order.discount > 0 ? `
          <tr style="color: #22c55e;">
            <td>Discount</td>
            <td style="text-align: right;">-₹${order.discount.toLocaleString('en-IN')}</td>
          </tr>
          ` : ''}
          <tr>
            <td>Shipping</td>
            <td style="text-align: right;">${order.shippingCost > 0 ? `₹${order.shippingCost}` : 'FREE'}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 18px;">
            <td style="padding-top: 10px;">Total</td>
            <td style="text-align: right; padding-top: 10px; color: #8B7355;">
              ₹${order.total.toLocaleString('en-IN')}
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Shipping Address -->
      <div style="background: #fff8f0; padding: 20px; border-radius: 8px; border-left: 4px solid #8B7355; margin: 20px 0;">
        <h3 style="margin: 0 0 10px; color: #8B7355;">📍 Shipping Address</h3>
        <p style="margin: 0;">
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}<br>
          ${order.shippingAddress.country}
        </p>
      </div>
      
      <!-- Payment Info -->
      <p style="margin-top: 30px;">
        <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}<br>
        <strong>Payment Status:</strong> ${order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_URL}/orders/${order.orderId}" 
           style="background: #8B7355; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Track Your Order
        </a>
      </div>
      
      <!-- Footer -->
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #666; font-size: 14px;">
        Need help? Reply to this email or contact us at support@clayzio.com<br>
        WhatsApp: +91 98765 43211
      </p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} Clayzio. All rights reserved.<br>
          Made with ❤️ in India
        </p>
      </div>
      
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Clayzio <${FROM_EMAIL}>`,
      to: order.customerEmail,
      subject: `Order Confirmed! #${order.orderId}`,
      html
    });

    if (error) throw error;
    console.log('✅ Order confirmation email sent:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
    throw error;
  }
};

// ============================================
// 🚚 ORDER SHIPPED EMAIL
// ============================================

/**
 * Send order shipped notification
 * @param {Object} order - Order document
 */
export const sendOrderShipped = async (order) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Shipped - Clayzio</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8B7355; margin: 0;">🏺 Clayzio</h1>
      </div>
      
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0 0 10px;">📦 Your Order is On Its Way!</h2>
        <p style="margin: 0; opacity: 0.9;">Order #${order.orderId}</p>
      </div>
      
      <p>Hi ${order.customerName},</p>
      <p>Great news! Your order has been shipped and is on its way to you.</p>
      
      ${order.trackingNumber ? `
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0;">
        <h3 style="margin: 0 0 10px; color: #22c55e;">📍 Tracking Information</h3>
        <p style="margin: 0;">
          <strong>Carrier:</strong> ${order.shippingCarrier || 'Standard Shipping'}<br>
          <strong>Tracking Number:</strong> ${order.trackingNumber}
        </p>
      </div>
      ` : ''}
      
      ${order.estimatedDelivery ? `
      <p>
        <strong>Estimated Delivery:</strong> 
        ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        })}
      </p>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_URL}/orders/${order.orderId}" 
           style="background: #8B7355; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Track Your Order
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #666; font-size: 14px;">
        Questions about your delivery? Contact us at support@clayzio.com
      </p>
      
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Clayzio <${FROM_EMAIL}>`,
      to: order.customerEmail,
      subject: `Your Order #${order.orderId} Has Shipped! 📦`,
      html
    });

    if (error) throw error;
    console.log('✅ Order shipped email sent:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to send order shipped email:', error);
    throw error;
  }
};

// ============================================
// 👋 WELCOME EMAIL
// ============================================

/**
 * Send welcome email to new user
 * @param {Object} user - User document
 */
export const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Clayzio</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8B7355; margin: 0;">🏺 Clayzio</h1>
        <p style="color: #666; margin: 5px 0;">Premium Handcrafted Ceramics</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0;">Welcome to the Clay Club! 🎉</h2>
      </div>
      
      <p>Hi ${user.name},</p>
      <p>Welcome to Clayzio! We're thrilled to have you join our community of ceramic lovers.</p>
      
      <h3 style="color: #8B7355;">What's in Store for You:</h3>
      <ul>
        <li>✨ Exclusive member discounts</li>
        <li>🎁 First access to new collections</li>
        <li>📫 Behind-the-scenes content</li>
        <li>💝 Special birthday surprises</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_URL}/shop" 
           style="background: #8B7355; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Start Shopping
        </a>
      </div>
      
      <p style="color: #666;">
        Use code <strong style="color: #8B7355;">WELCOME10</strong> for 10% off your first order!
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <div style="text-align: center;">
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} Clayzio. Handcrafted with ❤️ in India
        </p>
      </div>
      
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Clayzio <${FROM_EMAIL}>`,
      to: user.email,
      subject: 'Welcome to Clayzio! 🏺',
      html
    });

    if (error) throw error;
    console.log('✅ Welcome email sent:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    throw error;
  }
};

// ============================================
// 🔑 PASSWORD RESET EMAIL
// ============================================

/**
 * Send password reset email
 * @param {Object} user - User document
 * @param {string} resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password - Clayzio</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8B7355; margin: 0;">🏺 Clayzio</h1>
      </div>
      
      <h2>Reset Your Password</h2>
      
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background: #8B7355; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px;">
        If the button doesn't work, copy and paste this link:<br>
        <a href="${resetUrl}" style="color: #8B7355;">${resetUrl}</a>
      </p>
      
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Clayzio <${FROM_EMAIL}>`,
      to: user.email,
      subject: 'Reset Your Password - Clayzio',
      html
    });

    if (error) throw error;
    console.log('✅ Password reset email sent:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
};

// ============================================
// 🏢 BUSINESS INQUIRY CONFIRMATION
// ============================================

/**
 * Send business inquiry confirmation
 * @param {Object} inquiry - Business inquiry document
 */
export const sendBusinessInquiryConfirmation = async (inquiry) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Business Inquiry Received - Clayzio</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8B7355; margin: 0;">🏺 Clayzio</h1>
        <p style="color: #666; margin: 5px 0;">Business Solutions</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #8B7355 0%, #A08060 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0;">Business Inquiry Received ✓</h2>
        <p style="margin: 10px 0 0; opacity: 0.9;">Reference: ${inquiry.inquiryId}</p>
      </div>
      
      <p>Dear ${inquiry.contactPerson},</p>
      <p>Thank you for your interest in partnering with Clayzio! Our team is excited to explore this opportunity.</p>
      
      <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px; color: #8B7355;">Inquiry Details:</h3>
        <p style="margin: 5px 0;"><strong>Company:</strong> ${inquiry.companyName}</p>
        <p style="margin: 5px 0;"><strong>Service Type:</strong> ${inquiry.serviceType.replace('_', ' ').toUpperCase()}</p>
      </div>
      
      <h3 style="color: #8B7355;">What Happens Next?</h3>
      <ol>
        <li>Our business team will review your requirements</li>
        <li>We'll contact you within 24-48 business hours</li>
        <li>We'll discuss your needs and provide a customized proposal</li>
      </ol>
      
      <p>In the meantime, feel free to:</p>
      <ul>
        <li>📥 <a href="${FRONTEND_URL}/clayzio-business-brochure.pdf" style="color: #8B7355;">Download our Business Brochure</a></li>
        <li>📞 Call us directly at +91 98765 43211</li>
        <li>💬 WhatsApp us for quick queries</li>
      </ul>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #666; font-size: 14px;">
        Best regards,<br>
        <strong>Clayzio Business Team</strong><br>
        business@clayzio.com | +91 98765 43211
      </p>
      
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Clayzio Business <${FROM_EMAIL}>`,
      to: inquiry.email,
      subject: `Business Inquiry Received - ${inquiry.inquiryId}`,
      html
    });

    if (error) throw error;
    console.log('✅ Business inquiry confirmation sent:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to send business inquiry email:', error);
    throw error;
  }
};

// ============================================
// 🔔 ADMIN NOTIFICATION
// ============================================

/**
 * Send admin notification for new orders
 * @param {Object} order - Order document
 */
export const sendAdminOrderNotification = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@clayzio.com';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Alert - Clayzio Admin</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="background: #dc2626; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">🛒 New Order Received!</h2>
      </div>
      
      <table style="width: 100%;">
        <tr>
          <td><strong>Order ID:</strong></td>
          <td>${order.orderId}</td>
        </tr>
        <tr>
          <td><strong>Customer:</strong></td>
          <td>${order.customerName}</td>
        </tr>
        <tr>
          <td><strong>Email:</strong></td>
          <td>${order.customerEmail}</td>
        </tr>
        <tr>
          <td><strong>Phone:</strong></td>
          <td>${order.customerPhone}</td>
        </tr>
        <tr>
          <td><strong>Total:</strong></td>
          <td style="color: #22c55e; font-weight: bold;">₹${order.total.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td><strong>Payment:</strong></td>
          <td>${order.paymentMethod.toUpperCase()} - ${order.paymentStatus}</td>
        </tr>
        <tr>
          <td><strong>Items:</strong></td>
          <td>${order.items.length} products</td>
        </tr>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_URL}/admin/orders/${order._id}" 
           style="background: #8B7355; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">
          View Order Details
        </a>
      </div>
      
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Clayzio Orders <${FROM_EMAIL}>`,
      to: adminEmail,
      subject: `🛒 New Order #${order.orderId} - ₹${order.total.toLocaleString('en-IN')}`,
      html
    });

    if (error) throw error;
    console.log('✅ Admin notification sent:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
    // Don't throw - admin notification failure shouldn't affect order
  }
};

// ============================================
// 📤 EXPORT ALL FUNCTIONS
// ============================================

export default {
  sendOrderConfirmation,
  sendOrderShipped,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBusinessInquiryConfirmation,
  sendAdminOrderNotification
};
