/**
 * Admin API Service
 * 
 * Handles all admin dashboard operations - CRUD for products, orders, users, reviews, etc.
 */

import { api, ApiResponse, User } from './client';
import { Product, ProductVariant } from './products';
import { Order } from './orders';
import { Review } from './reviews';

// ============ Types ============

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface SalesData {
  date: string;
  amount: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  used_count?: number;
  expires_at?: string;
  is_active: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  original_price?: number;
  category: string;
  images?: string[];
  stock_quantity?: number;
  is_bestseller?: boolean;
  is_new?: boolean;
  care_instructions?: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
}

export interface CreateVariantData {
  product_id: string;
  variant_type: string;
  variant_value: string;
  price_adjustment?: number;
  stock_quantity?: number;
  is_available?: boolean;
}

// ============ API Methods ============

export const adminApi = {
  // ============ Dashboard ============
  
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/stats');
    return response.data || {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalUsers: 0,
      pendingOrders: 0,
      completedOrders: 0,
    };
  },

  /**
   * Get sales chart data
   */
  getSalesData: async (days = 7): Promise<SalesData[]> => {
    const response = await api.get<ApiResponse<SalesData[]>>(`/admin/sales?days=${days}`);
    return response.data || [];
  },

  /**
   * Get recent orders for dashboard
   */
  getRecentOrders: async (limit = 5): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>(`/admin/orders/recent?limit=${limit}`);
    return response.data || [];
  },

  // ============ Products ============
  
  /**
   * Get all products for admin
   */
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/admin/products');
    return response.data || [];
  },

  /**
   * Create a new product
   */
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await api.post<ApiResponse<Product>>('/admin/products', data);
    return response.data!;
  },

  /**
   * Update a product
   */
  updateProduct: async (id: string, data: Partial<CreateProductData>): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
    return response.data!;
  },

  /**
   * Delete a product
   */
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },

  /**
   * Upload product images
   */
  uploadImages: async (files: FormData): Promise<string[]> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/product-images`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: files,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload images');
    }
    
    const data = await response.json();
    return data.data?.images || [];
  },

  // ============ Product Variants ============
  
  /**
   * Get variants for a product
   */
  getProductVariants: async (productId: string): Promise<ProductVariant[]> => {
    const response = await api.get<ApiResponse<ProductVariant[]>>(`/products/${productId}/variants`);
    return response.data || [];
  },

  /**
   * Create a product variant
   */
  createVariant: async (data: CreateVariantData): Promise<ProductVariant> => {
    const response = await api.post<ApiResponse<ProductVariant>>(`/admin/products/${data.product_id}/variants`, {
      name: data.variant_value,
      sku: `${data.product_id}-${data.variant_type}-${data.variant_value}`.toLowerCase().replace(/\s+/g, '-'),
      price: data.price_adjustment || 0,
      stock: data.stock_quantity || 0,
      color: data.variant_type === 'color' ? data.variant_value : undefined,
      size: data.variant_type === 'size' ? data.variant_value : undefined,
      isActive: data.is_available !== false
    });
    return response.data!;
  },

  /**
   * Update a product variant
   */
  updateVariant: async (id: string, data: Partial<CreateVariantData>): Promise<ProductVariant> => {
    // Note: This requires the product_id to be passed - we need to get it from context
    // For now, we'll assume the product_id is passed in data
    const productId = data.product_id || '';
    const response = await api.put<ApiResponse<ProductVariant>>(`/admin/products/${productId}/variants/${id}`, {
      name: data.variant_value,
      sku: data.variant_value ? `${productId}-${data.variant_type}-${data.variant_value}`.toLowerCase().replace(/\s+/g, '-') : undefined,
      price: data.price_adjustment,
      stock: data.stock_quantity,
      color: data.variant_type === 'color' ? data.variant_value : undefined,
      size: data.variant_type === 'size' ? data.variant_value : undefined,
      isActive: data.is_available
    });
    return response.data!;
  },

  /**
   * Delete a product variant
   */
  deleteVariant: async (id: string, productId?: string): Promise<void> => {
    // productId is required for the backend route
    if (productId) {
      await api.delete(`/admin/products/${productId}/variants/${id}`);
    } else {
      throw new Error('Product ID is required to delete variant');
    }
  },

  // ============ Orders ============
  
  /**
   * Get all orders for admin
   */
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/admin/orders');
    return response.data || [];
  },

  /**
   * Get order details with items
   */
  getOrderDetails: async (orderId: string): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/admin/orders/${orderId}`);
    return response.data!;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await api.patch<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, { status });
    return response.data!;
  },

  /**
   * Update payment status
   */
  updatePaymentStatus: async (orderId: string, paymentStatus: string): Promise<Order> => {
    const response = await api.patch<ApiResponse<Order>>(`/admin/orders/${orderId}/payment`, { payment_status: paymentStatus });
    return response.data!;
  },

  // ============ Users ============
  
  /**
   * Get all users for admin
   */
  getUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get<ApiResponse<UserProfile[]>>('/admin/users');
    return response.data || [];
  },

  /**
   * Get all user roles
   */
  getUserRoles: async (): Promise<UserRole[]> => {
    const response = await api.get<ApiResponse<UserRole[]>>('/admin/users/roles');
    return response.data || [];
  },

  /**
   * Get roles for a specific user
   */
  getUserRolesById: async (userId: string): Promise<UserRole[]> => {
    const response = await api.get<ApiResponse<UserRole[]>>(`/admin/users/${userId}/roles`);
    return response.data || [];
  },

  /**
   * Add role to user
   */
  addUserRole: async (userId: string, role: 'admin' | 'moderator' | 'user'): Promise<UserRole> => {
    const response = await api.post<ApiResponse<UserRole>>(`/admin/users/${userId}/roles`, { role });
    return response.data!;
  },

  /**
   * Remove role from user
   */
  removeUserRole: async (roleId: string): Promise<void> => {
    await api.delete(`/admin/users/roles/${roleId}`);
  },

  /**
   * Update user profile (admin)
   */
  updateUserProfile: async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>(`/admin/users/${userId}`, data);
    return response.data!;
  },

  // ============ Reviews ============
  
  /**
   * Get all reviews for admin
   */
  getReviews: async (): Promise<(Review & { products?: { name: string } })[]> => {
    const response = await api.get<ApiResponse<(Review & { products?: { name: string } })[]>>('/admin/reviews');
    return response.data || [];
  },

  /**
   * Approve/reject a review
   */
  updateReviewStatus: async (reviewId: string, isApproved: boolean): Promise<Review> => {
    const response = await api.patch<ApiResponse<Review>>(`/admin/reviews/${reviewId}/approve`, { is_approved: isApproved });
    return response.data!;
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/admin/reviews/${reviewId}`);
  },

  // ============ Contact Submissions ============
  
  /**
   * Get all contact submissions
   */
  getContactSubmissions: async (): Promise<ContactSubmission[]> => {
    const response = await api.get<ApiResponse<ContactSubmission[]>>('/admin/contacts');
    return response.data || [];
  },

  /**
   * Update contact submission status
   */
  updateContactStatus: async (id: string, status: string): Promise<ContactSubmission> => {
    const response = await api.patch<ApiResponse<ContactSubmission>>(`/admin/contacts/${id}/status`, { status });
    return response.data!;
  },

  /**
   * Delete a contact submission
   */
  deleteContact: async (id: string): Promise<void> => {
    await api.delete(`/admin/contacts/${id}`);
  },

  // ============ Coupons ============
  
  /**
   * Get all coupons
   */
  getCoupons: async (): Promise<Coupon[]> => {
    const response = await api.get<ApiResponse<Coupon[]>>('/admin/coupons');
    return response.data || [];
  },

  /**
   * Create a coupon
   */
  createCoupon: async (data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.post<ApiResponse<Coupon>>('/admin/coupons', data);
    return response.data!;
  },

  /**
   * Update a coupon
   */
  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, data);
    return response.data!;
  },

  /**
   * Delete a coupon
   */
  deleteCoupon: async (id: string): Promise<void> => {
    await api.delete(`/admin/coupons/${id}`);
  },
};

export default adminApi;










// /**
//  * Admin API Service
//  * 
//  * Handles all admin dashboard operations - CRUD for products, orders, users, reviews, etc.
//  */

// import { api, ApiResponse, User } from './client';
// import { Product, ProductVariant } from './products';
// import { Order } from './orders';
// import { Review } from './reviews';

// // ============ Types ============

// export interface DashboardStats {
//   totalRevenue: number;
//   totalOrders: number;
//   totalProducts: number;
//   totalUsers: number;
//   pendingOrders: number;
//   completedOrders: number;
// }

// export interface SalesData {
//   date: string;
//   amount: number;
// }

// export interface ContactSubmission {
//   id: string;
//   name: string;
//   email: string;
//   phone?: string;
//   subject?: string;
//   message: string;
//   status: 'new' | 'read' | 'responded' | 'archived';
//   created_at: string;
// }

// export interface Coupon {
//   id: string;
//   code: string;
//   discount_type: 'percentage' | 'fixed';
//   discount_value: number;
//   min_order_amount?: number;
//   max_uses?: number;
//   used_count?: number;
//   expires_at?: string;
//   is_active: boolean;
// }

// export interface UserProfile {
//   id: string;
//   user_id: string;
//   full_name?: string;
//   email?: string;
//   phone?: string;
//   address?: string;
//   city?: string;
//   postal_code?: string;
//   created_at: string;
// }

// export interface UserRole {
//   id: string;
//   user_id: string;
//   role: 'admin' | 'moderator' | 'user';
//   created_at: string;
// }

// export interface CreateProductData {
//   name: string;
//   description?: string;
//   short_description?: string;
//   price: number;
//   original_price?: number;
//   category: string;
//   images?: string[];
//   stock_quantity?: number;
//   is_bestseller?: boolean;
//   is_new?: boolean;
//   care_instructions?: string;
//   materials?: string;
//   dimensions?: string;
//   weight?: string;
// }

// export interface CreateVariantData {
//   product_id: string;
//   variant_type: string;
//   variant_value: string;
//   price_adjustment?: number;
//   stock_quantity?: number;
//   is_available?: boolean;
// }

// // ============ API Methods ============

// export const adminApi = {
//   // ============ Dashboard ============
  
//   /**
//    * Get dashboard statistics
//    */
//   getStats: async (): Promise<DashboardStats> => {
//     const response = await api.get<ApiResponse<DashboardStats>>('/admin/stats');
//     return response.data || {
//       totalRevenue: 0,
//       totalOrders: 0,
//       totalProducts: 0,
//       totalUsers: 0,
//       pendingOrders: 0,
//       completedOrders: 0,
//     };
//   },

//   /**
//    * Get sales chart data
//    */
//   getSalesData: async (days = 7): Promise<SalesData[]> => {
//     const response = await api.get<ApiResponse<SalesData[]>>(`/admin/sales?days=${days}`);
//     return response.data || [];
//   },

//   /**
//    * Get recent orders for dashboard
//    */
//   getRecentOrders: async (limit = 5): Promise<Order[]> => {
//     const response = await api.get<ApiResponse<Order[]>>(`/admin/orders/recent?limit=${limit}`);
//     return response.data || [];
//   },

//   // ============ Products ============
  
//   /**
//    * Get all products for admin
//    */
//   getProducts: async (): Promise<Product[]> => {
//     const response = await api.get<ApiResponse<Product[]>>('/admin/products');
//     return response.data || [];
//   },

//   /**
//    * Create a new product
//    */
//   createProduct: async (data: CreateProductData): Promise<Product> => {
//     const response = await api.post<ApiResponse<Product>>('/admin/products', data);
//     return response.data!;
//   },

//   /**
//    * Update a product
//    */
//   updateProduct: async (id: string, data: Partial<CreateProductData>): Promise<Product> => {
//     const response = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
//     return response.data!;
//   },

//   /**
//    * Delete a product
//    */
//   deleteProduct: async (id: string): Promise<void> => {
//     await api.delete(`/admin/products/${id}`);
//   },

//   /**
//    * Upload product images
//    */
//   uploadImages: async (files: FormData): Promise<string[]> => {
//     const token = localStorage.getItem('auth_token');
//     const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/images`, {
//       method: 'POST',
//       headers: {
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       },
//       body: files,
//     });
    
//     const data = await response.json();
//     return data.data?.urls || [];
//   },

//   // ============ Product Variants ============
  
//   /**
//    * Get variants for a product
//    */
//   getProductVariants: async (productId: string): Promise<ProductVariant[]> => {
//     const response = await api.get<ApiResponse<ProductVariant[]>>(`/admin/products/${productId}/variants`);
//     return response.data || [];
//   },

//   /**
//    * Create a product variant
//    */
//   createVariant: async (data: CreateVariantData): Promise<ProductVariant> => {
//     const response = await api.post<ApiResponse<ProductVariant>>('/admin/variants', data);
//     return response.data!;
//   },

//   /**
//    * Update a product variant
//    */
//   updateVariant: async (id: string, data: Partial<CreateVariantData>): Promise<ProductVariant> => {
//     const response = await api.put<ApiResponse<ProductVariant>>(`/admin/variants/${id}`, data);
//     return response.data!;
//   },

//   /**
//    * Delete a product variant
//    */
//   deleteVariant: async (id: string): Promise<void> => {
//     await api.delete(`/admin/variants/${id}`);
//   },

//   // ============ Orders ============
  
//   /**
//    * Get all orders for admin
//    */
//   getOrders: async (): Promise<Order[]> => {
//     const response = await api.get<ApiResponse<Order[]>>('/admin/orders');
//     return response.data || [];
//   },

//   /**
//    * Get order details with items
//    */
//   getOrderDetails: async (orderId: string): Promise<Order> => {
//     const response = await api.get<ApiResponse<Order>>(`/admin/orders/${orderId}`);
//     return response.data!;
//   },

//   /**
//    * Update order status
//    */
//   updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
//     const response = await api.patch<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, { status });
//     return response.data!;
//   },

//   /**
//    * Update payment status
//    */
//   updatePaymentStatus: async (orderId: string, paymentStatus: string): Promise<Order> => {
//     const response = await api.patch<ApiResponse<Order>>(`/admin/orders/${orderId}/payment`, { payment_status: paymentStatus });
//     return response.data!;
//   },

//   // ============ Users ============
  
//   /**
//    * Get all users for admin
//    */
//   getUsers: async (): Promise<UserProfile[]> => {
//     const response = await api.get<ApiResponse<UserProfile[]>>('/admin/users');
//     return response.data || [];
//   },

//   /**
//    * Get all user roles
//    */
//   getUserRoles: async (): Promise<UserRole[]> => {
//     const response = await api.get<ApiResponse<UserRole[]>>('/admin/users/roles');
//     return response.data || [];
//   },

//   /**
//    * Get roles for a specific user
//    */
//   getUserRolesById: async (userId: string): Promise<UserRole[]> => {
//     const response = await api.get<ApiResponse<UserRole[]>>(`/admin/users/${userId}/roles`);
//     return response.data || [];
//   },

//   /**
//    * Add role to user
//    */
//   addUserRole: async (userId: string, role: 'admin' | 'moderator' | 'user'): Promise<UserRole> => {
//     const response = await api.post<ApiResponse<UserRole>>(`/admin/users/${userId}/roles`, { role });
//     return response.data!;
//   },

//   /**
//    * Remove role from user
//    */
//   removeUserRole: async (roleId: string): Promise<void> => {
//     await api.delete(`/admin/users/roles/${roleId}`);
//   },

//   /**
//    * Update user profile (admin)
//    */
//   updateUserProfile: async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
//     const response = await api.put<ApiResponse<UserProfile>>(`/admin/users/${userId}`, data);
//     return response.data!;
//   },

//   // ============ Reviews ============
  
//   /**
//    * Get all reviews for admin
//    */
//   getReviews: async (): Promise<(Review & { products?: { name: string } })[]> => {
//     const response = await api.get<ApiResponse<(Review & { products?: { name: string } })[]>>('/admin/reviews');
//     return response.data || [];
//   },

//   /**
//    * Approve/reject a review
//    */
//   updateReviewStatus: async (reviewId: string, isApproved: boolean): Promise<Review> => {
//     const response = await api.patch<ApiResponse<Review>>(`/admin/reviews/${reviewId}/approve`, { is_approved: isApproved });
//     return response.data!;
//   },

//   /**
//    * Delete a review
//    */
//   deleteReview: async (reviewId: string): Promise<void> => {
//     await api.delete(`/admin/reviews/${reviewId}`);
//   },

//   // ============ Contact Submissions ============
  
//   /**
//    * Get all contact submissions
//    */
//   getContactSubmissions: async (): Promise<ContactSubmission[]> => {
//     const response = await api.get<ApiResponse<ContactSubmission[]>>('/admin/contacts');
//     return response.data || [];
//   },

//   /**
//    * Update contact submission status
//    */
//   updateContactStatus: async (id: string, status: string): Promise<ContactSubmission> => {
//     const response = await api.patch<ApiResponse<ContactSubmission>>(`/admin/contacts/${id}/status`, { status });
//     return response.data!;
//   },

//   /**
//    * Delete a contact submission
//    */
//   deleteContact: async (id: string): Promise<void> => {
//     await api.delete(`/admin/contacts/${id}`);
//   },

//   // ============ Coupons ============
  
//   /**
//    * Get all coupons
//    */
//   getCoupons: async (): Promise<Coupon[]> => {
//     const response = await api.get<ApiResponse<Coupon[]>>('/admin/coupons');
//     return response.data || [];
//   },

//   /**
//    * Create a coupon
//    */
//   createCoupon: async (data: Partial<Coupon>): Promise<Coupon> => {
//     const response = await api.post<ApiResponse<Coupon>>('/admin/coupons', data);
//     return response.data!;
//   },

//   /**
//    * Update a coupon
//    */
//   updateCoupon: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
//     const response = await api.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, data);
//     return response.data!;
//   },

//   /**
//    * Delete a coupon
//    */
//   deleteCoupon: async (id: string): Promise<void> => {
//     await api.delete(`/admin/coupons/${id}`);
//   },
// };

// export default adminApi;
