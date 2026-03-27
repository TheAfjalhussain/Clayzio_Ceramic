# 🏺 Clayzio Backend API

Complete Node.js/Express backend with MongoDB, Razorpay, Resend emails, and Cloudinary storage.

**Uses ES Modules** for modern JavaScript syntax.

## 📁 Project Structure

```
backend-code/
├── src/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary upload config
│   │
│   ├── controllers/            # CRUD operations
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   ├── review.controller.js
│   │   ├── contact.controller.js
│   │   └── business.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT & role verification
│   │   ├── validate.middleware.js
│   │   └── errorHandler.js
│   │
│   ├── models/
│   │   ├── index.js            # All model exports
│   │   ├── User.model.js
│   │   ├── Product.model.js
│   │   ├── Order.model.js
│   │   ├── Review.model.js
│   │   ├── Coupon.model.js
│   │   ├── Contact.model.js
│   │   └── BusinessInquiry.model.js
│   │
│   ├── routes/
│   │   ├── index.js            # All route exports
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   ├── review.routes.js
│   │   ├── contact.routes.js
│   │   ├── business.routes.js
│   │   ├── admin.routes.js
│   │   └── upload.routes.js
│   │
│   ├── services/
│   │   ├── email.service.js    # Resend emails
│   │   ├── payment.service.js  # Razorpay
│   │   └── invoice.service.js  # PDF generation
│   │
│   ├── scripts/
│   │   └── seedData.js
│   │
│   └── server.js               # App entry point
│
├── .env.example
├── package.json
└── README.md
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Seed database (optional)
npm run seed

# 4. Start server
npm run dev     # Development
npm start       # Production
```

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `RESEND_API_KEY` | Resend email API key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |
| `FRONTEND_URL` | Frontend URL for CORS |

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Products
```
GET    /api/products           # List (with filters)
GET    /api/products/featured
GET    /api/products/bestsellers
GET    /api/products/:id
GET    /api/products/slug/:slug
```

### Orders
```
POST   /api/orders             # Create order
GET    /api/orders/my-orders   # User's orders
GET    /api/orders/:orderId    # Order details
GET    /api/orders/:orderId/invoice
```

### Payments
```
POST   /api/payments/create-order
POST   /api/payments/verify
POST   /api/payments/webhook
```

### Admin (requires admin role)
```
GET    /api/admin/dashboard
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/admin/orders
PUT    /api/admin/orders/:id/status
GET    /api/admin/users
```

### File Uploads (Cloudinary)
```
POST   /api/upload/product-images  # Admin only
POST   /api/upload/avatar
POST   /api/upload/documents       # Admin only
```

## 🔐 Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **razorpay** - Payment gateway
- **resend** - Email service
- **cloudinary** - Cloud storage
- **multer** - File uploads
- **pdfkit** - PDF generation
- **express-validator** - Validation
- **helmet** - Security headers
- **cors** - CORS handling

## 🧪 Seeded Data

After running `npm run seed`:
- **Admin**: admin@clayzio.com / admin123
- **Products**: 6 sample products
- **Coupons**: WELCOME10, FLAT200, BULK20

---

Built with ❤️ for Clayzio Premium Ceramics
