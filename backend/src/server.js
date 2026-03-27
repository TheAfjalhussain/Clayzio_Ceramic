/**
 * ============================================
 * 🏺 CLAYZIO BACKEND SERVER
 * ============================================
 * Main entry point for the Express application
 * Uses ES Modules for modern JavaScript syntax
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Database connection
import connectDB from './config/database.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import contactRoutes from './routes/contact.routes.js';
import businessRoutes from './routes/business.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';

// Middleware imports
import errorHandler from './middleware/errorHandler.js';

// ============================================
// 📁 DIRECTORY SETUP
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 🚀 APP INITIALIZATION
// ============================================

const app = express();

// Connect to MongoDB
connectDB();

// ============================================
// 🛡️ SECURITY MIDDLEWARE
// ============================================

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { 
    success: false, 
    error: 'Too many requests. Please try again later.' 
  }
});
app.use('/api/', limiter);

// ============================================
// 📦 BODY PARSING
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// 📂 STATIC FILES
// ============================================

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/invoices', express.static(path.join(__dirname, '../invoices')));

// ============================================
// ❤️ HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// ============================================
// 🛣️ API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// ============================================
// ❌ 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// ============================================
// 🚨 ERROR HANDLER
// ============================================

app.use(errorHandler);

// ============================================
// 🎯 START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🏺 CLAYZIO Backend Server                           ║
║                                                       ║
║   Port: ${PORT}                                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                         ║
║   API Base: http://localhost:${PORT}/api              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
