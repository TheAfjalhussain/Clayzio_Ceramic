/**
 * ============================================
 * 🧾 INVOICE SERVICE
 * ============================================
 * PDF invoice generation using PDFKit
 * Optionally uploads to Cloudinary
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Invoice storage directory
const INVOICES_DIR = path.join(__dirname, '../../invoices');

// Ensure directory exists
if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

// ============================================
// 📄 GENERATE INVOICE
// ============================================

/**
 * Generate PDF invoice for an order
 * @param {Object} order - Order document
 * @param {boolean} uploadToCloud - Whether to upload to Cloudinary
 * @returns {Promise<Object>} Invoice file details
 */
export const generateInvoice = async (order, uploadToCloud = false) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });
      
      const fileName = `invoice-${order.invoiceNumber || order.orderId}.pdf`;
      const filePath = path.join(INVOICES_DIR, fileName);
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // Generate invoice sections
      generateHeader(doc, order);
      generateCustomerInfo(doc, order);
      generateItemsTable(doc, order);
      generateTotals(doc, order);
      generateFooter(doc, order);

      doc.end();

      writeStream.on('finish', async () => {
        console.log('✅ Invoice generated:', filePath);
        
        let cloudinaryUrl = null;
        
        // Upload to Cloudinary if requested
        if (uploadToCloud) {
          try {
            const fileBuffer = fs.readFileSync(filePath);
            const result = await uploadToCloudinary(fileBuffer, {
              folder: 'clayzio/invoices',
              resourceType: 'raw',
              public_id: `invoice-${order.orderId}`
            });
            cloudinaryUrl = result.secure_url;
            console.log('✅ Invoice uploaded to Cloudinary:', cloudinaryUrl);
          } catch (uploadError) {
            console.error('⚠️ Cloudinary upload failed:', uploadError);
          }
        }
        
        resolve({
          success: true,
          filePath,
          fileName,
          localUrl: `/invoices/${fileName}`,
          cloudinaryUrl
        });
      });

      writeStream.on('error', reject);
      
    } catch (error) {
      reject(error);
    }
  });
};

// ============================================
// 📋 HEADER SECTION
// ============================================

const generateHeader = (doc, order) => {
  // Company Logo/Name
  doc
    .fillColor('#8B7355')
    .fontSize(28)
    .font('Helvetica-Bold')
    .text('CLAYZIO', 50, 50)
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666666')
    .text('Premium Handcrafted Ceramics', 50, 82);

  // Invoice Title
  doc
    .fillColor('#333333')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('TAX INVOICE', 400, 50, { align: 'right' })
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666666')
    .text(`Invoice No: ${order.invoiceNumber || 'N/A'}`, 400, 75, { align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 90, { align: 'right' })
    .text(`Order ID: ${order.orderId}`, 400, 105, { align: 'right' });

  // Horizontal line
  doc
    .strokeColor('#DDDDDD')
    .lineWidth(1)
    .moveTo(50, 130)
    .lineTo(550, 130)
    .stroke();
};

// ============================================
// 👤 CUSTOMER INFO SECTION
// ============================================

const generateCustomerInfo = (doc, order) => {
  const y = 150;
  
  // Billing Info
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#8B7355')
    .text('BILL TO:', 50, y)
    .font('Helvetica')
    .fillColor('#333333')
    .text(order.customerName, 50, y + 15)
    .text(order.customerEmail, 50, y + 30)
    .text(order.customerPhone, 50, y + 45);

  // Shipping Info
  doc
    .font('Helvetica-Bold')
    .fillColor('#8B7355')
    .text('SHIP TO:', 300, y)
    .font('Helvetica')
    .fillColor('#333333')
    .text(order.shippingAddress.street, 300, y + 15)
    .text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, 300, y + 30)
    .text(`${order.shippingAddress.pincode}, ${order.shippingAddress.country}`, 300, y + 45);

  // Payment Info
  doc
    .font('Helvetica-Bold')
    .fillColor('#8B7355')
    .text('PAYMENT:', 450, y)
    .font('Helvetica')
    .fillColor('#333333')
    .text(order.paymentMethod.toUpperCase(), 450, y + 15)
    .text(order.paymentStatus === 'paid' ? '✓ PAID' : 'Pending', 450, y + 30);
};

// ============================================
// 📦 ITEMS TABLE
// ============================================

const generateItemsTable = (doc, order) => {
  const tableTop = 240;
  const tableHeaders = ['#', 'Item', 'Qty', 'Price', 'Total'];
  const columnPositions = [50, 80, 330, 380, 460];
  const columnWidths = [30, 250, 50, 80, 80];

  // Table Header Background
  doc
    .fillColor('#F5F5F5')
    .rect(50, tableTop, 500, 25)
    .fill();

  // Table Headers
  doc
    .fillColor('#333333')
    .fontSize(10)
    .font('Helvetica-Bold');

  tableHeaders.forEach((header, i) => {
    doc.text(header, columnPositions[i], tableTop + 8, { 
      width: columnWidths[i],
      align: i > 1 ? 'right' : 'left'
    });
  });

  // Table Rows
  let y = tableTop + 35;
  doc.font('Helvetica').fontSize(9);

  order.items.forEach((item, index) => {
    // Handle page overflow
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    const itemName = item.productName + (item.variant?.name ? ` - ${item.variant.name}` : '');
    
    doc
      .fillColor('#666666')
      .text(String(index + 1), columnPositions[0], y)
      .fillColor('#333333')
      .text(itemName.substring(0, 40), columnPositions[1], y, { width: columnWidths[1] })
      .text(String(item.quantity), columnPositions[2], y, { width: columnWidths[2], align: 'right' })
      .text(`₹${item.price.toLocaleString('en-IN')}`, columnPositions[3], y, { width: columnWidths[3], align: 'right' })
      .text(`₹${item.total.toLocaleString('en-IN')}`, columnPositions[4], y, { width: columnWidths[4], align: 'right' });

    y += 25;

    // Row separator
    doc
      .strokeColor('#EEEEEE')
      .lineWidth(0.5)
      .moveTo(50, y - 5)
      .lineTo(550, y - 5)
      .stroke();
  });

  return y;
};

// ============================================
// 💰 TOTALS SECTION
// ============================================

const generateTotals = (doc, order) => {
  const totalsY = 500;
  const labelX = 380;
  const valueX = 460;
  const width = 90;

  // Totals Box
  doc
    .fillColor('#F9F9F9')
    .rect(370, totalsY - 10, 180, 100)
    .fill();

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666666');

  // Subtotal
  doc
    .text('Subtotal:', labelX, totalsY, { width: 70, align: 'right' })
    .text(`₹${order.subtotal.toLocaleString('en-IN')}`, valueX, totalsY, { width, align: 'right' });

  // Discount
  if (order.discount > 0) {
    doc
      .fillColor('#22c55e')
      .text('Discount:', labelX, totalsY + 18, { width: 70, align: 'right' })
      .text(`-₹${order.discount.toLocaleString('en-IN')}`, valueX, totalsY + 18, { width, align: 'right' });
  }

  // Shipping
  doc
    .fillColor('#666666')
    .text('Shipping:', labelX, totalsY + 36, { width: 70, align: 'right' })
    .text(order.shippingCost > 0 ? `₹${order.shippingCost}` : 'FREE', valueX, totalsY + 36, { width, align: 'right' });

  // Tax
  if (order.tax > 0) {
    doc
      .text('Tax (GST):', labelX, totalsY + 54, { width: 70, align: 'right' })
      .text(`₹${order.tax.toLocaleString('en-IN')}`, valueX, totalsY + 54, { width, align: 'right' });
  }

  // Total
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#8B7355')
    .text('TOTAL:', labelX, totalsY + 72, { width: 70, align: 'right' })
    .text(`₹${order.total.toLocaleString('en-IN')}`, valueX, totalsY + 72, { width, align: 'right' });
};

// ============================================
// 📝 FOOTER SECTION
// ============================================

const generateFooter = (doc, order) => {
  const footerY = 700;

  // Thank you message
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#8B7355')
    .text('Thank you for shopping with Clayzio!', 50, footerY, { align: 'center' });

  // Terms & Conditions
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#999999')
    .text('Terms & Conditions:', 50, footerY + 25)
    .text('• Returns accepted within 7 days of delivery for unused items in original packaging.', 50, footerY + 38)
    .text('• For any queries, contact us at support@clayzio.com or +91 98765 43211.', 50, footerY + 51);

  // Company Details
  doc
    .fontSize(8)
    .text('─'.repeat(80), 50, footerY + 70, { align: 'center' })
    .text('Clayzio Ceramics Pvt. Ltd. | GSTIN: 27AABCC1234D1ZM', 50, footerY + 85, { align: 'center' })
    .text('Mumbai, Maharashtra, India | www.clayzio.com', 50, footerY + 98, { align: 'center' });
};

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

/**
 * Get invoice file path
 * @param {string} invoiceNumber - Invoice number
 * @returns {string} File path
 */
export const getInvoicePath = (invoiceNumber) => {
  return path.join(INVOICES_DIR, `invoice-${invoiceNumber}.pdf`);
};

/**
 * Check if invoice exists
 * @param {string} invoiceNumber - Invoice number
 * @returns {boolean} Exists or not
 */
export const invoiceExists = (invoiceNumber) => {
  return fs.existsSync(getInvoicePath(invoiceNumber));
};

/**
 * Delete invoice file
 * @param {string} invoiceNumber - Invoice number
 * @returns {boolean} Success or not
 */
export const deleteInvoice = (invoiceNumber) => {
  const filePath = getInvoicePath(invoiceNumber);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

// ============================================
// 📤 EXPORT ALL FUNCTIONS
// ============================================

export default {
  generateInvoice,
  getInvoicePath,
  invoiceExists,
  deleteInvoice
};
