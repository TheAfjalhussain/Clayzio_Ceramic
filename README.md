# 🏺 Clayzio - E-Commerce Platform for Clay Artisans

Clayzio is a modern, full-stack e-commerce platform designed specifically for clay artisans and pottery enthusiasts. Built with cutting-edge technologies, it provides a seamless shopping experience for handmade clay products while offering powerful tools for artisans to manage their businesses.

## ✨ Features

### 🛒 Customer Features
- **Product Catalog**: Browse through a curated collection of handmade clay products
- **Advanced Search & Filters**: Find products by category, price, material, and artisan
- **User Authentication**: Secure login and registration system
- **Shopping Cart & Wishlist**: Save items for later and manage your cart
- **Secure Checkout**: Integrated with Razorpay for secure payments
- **Order Tracking**: Real-time order status updates
- **Product Reviews**: Rate and review products you've purchased
- **Contact & Support**: Direct communication with artisans

### 🎨 Artisan Features
- **Business Profile**: Showcase your artisan story and expertise
- **Product Management**: Add, update, and manage your product inventory
- **Order Management**: Track and fulfill customer orders
- **Analytics Dashboard**: Insights into sales and customer behavior

### 👨‍💼 Admin Features
- **User Management**: Manage customers and artisans
- **Product Moderation**: Review and approve artisan products
- **Order Oversight**: Monitor all orders across the platform
- **Analytics & Reports**: Comprehensive business intelligence
- **Content Management**: Manage categories, collections, and promotions

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Payments**: Razorpay
- **Email Service**: Resend
- **PDF Generation**: PDFKit
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Context + TanStack Query
- **Routing**: React Router
- **Backend Integration**: Supabase Client

### DevOps & Tools
- **Version Control**: Git
- **Package Management**: npm
- **Code Quality**: ESLint
- **API Testing**: Postman/Thunder Client
- **Database**: MongoDB Atlas
- **Cloud Storage**: Cloudinary
- **Email Service**: Resend
- **Payment Gateway**: Razorpay

## 📁 Project Structure

```
clayzio-main/
├── backend/                          # Node.js/Express API
│   ├── src/
│   │   ├── config/                   # Database & Cloudinary config
│   │   ├── controllers/              # Business logic handlers
│   │   ├── middleware/               # Auth, validation, error handling
│   │   ├── models/                   # MongoDB schemas
│   │   ├── routes/                   # API route definitions
│   │   ├── services/                 # External service integrations
│   │   └── server.js                 # Application entry point
│   ├── scripts/                      # Database seeding scripts
│   ├── package.json
│   └── README.md
│
├── frontend/                         # React/TypeScript SPA
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── contexts/                 # React Context providers
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── pages/                    # Page components
│   │   ├── lib/                      # Utilities and API clients
│   │   └── assets/                   # Static assets
│   ├── supabase/                     # Supabase configuration
│   ├── package.json
│   └── README.md
│
├── supabase/                         # Supabase functions & migrations
│   ├── functions/                    # Edge functions
│   └── migrations/                   # Database migrations
│
└── README.md                         # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/clayzio
   JWT_SECRET=your-super-secret-jwt-key
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   RESEND_API_KEY=your-resend-api-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   FRONTEND_URL=http://localhost:5173
   ```

4. **Seed database (optional)**
   ```bash
   npm run seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   Server will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173`

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Product Endpoints
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Artisan/Admin)
- `PUT /api/products/:id` - Update product (Artisan/Admin)
- `DELETE /api/products/:id` - Delete product (Artisan/Admin)

### Order Endpoints
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Payment Endpoints
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products for moderation

## 🔧 Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

**Frontend:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality
- **ESLint**: Configured for both backend and frontend
- **Prettier**: Code formatting (via ESLint)
- **TypeScript**: Strict type checking on frontend

## 🚢 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your preferred Node.js hosting (Heroku, Railway, etc.)
3. Ensure MongoDB Atlas connection

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Configure environment variables in hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for clay artisans worldwide
- Special thanks to the open-source community

## 📞 Support

For support, email support@clayzio.com or join our Discord community.

---

**Clayzio** - Where Art Meets Commerce 🏺✨</content>
<parameter name="filePath">d:/clayzio-main (4)/README.md