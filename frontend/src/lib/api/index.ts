/**
 * API Service Layer - Central Export
 * 
 * This module exports all API services for easy imports:
 * import { authApi, productsApi, ordersApi } from '@/lib/api';
 */

// Client utilities
export {
  api,
  apiRequest,
  ApiError,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
} from './client';

// API services
export { authApi, default as auth } from './auth';
export { productsApi, default as products } from './products';
export { ordersApi, default as orders } from './orders';
export { reviewsApi, default as reviews } from './reviews';
export { contactApi, default as contact } from './contact';
export { adminApi, default as admin } from './admin';

// Types
export type { User, ApiResponse, PaginatedResponse } from './client';
export type { RegisterData, LoginData, AuthResult, ProfileUpdateData } from './auth';
export type { Product, ProductVariant, ProductFilters } from './products';
export type { Order, OrderItem, ShippingAddress, CreateOrderData } from './orders';
export type { Review, CreateReviewData } from './reviews';
export type { ContactFormData, BusinessInquiryData } from './contact';
export type {
  DashboardStats,
  SalesData,
  ContactSubmission,
  Coupon,
  UserProfile,
  UserRole,
  CreateProductData,
  CreateVariantData,
} from './admin';
