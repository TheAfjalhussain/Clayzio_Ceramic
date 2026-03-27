/**
 * Orders API Service
 * 
 * Handles order creation, tracking, and management
 */

import { api, ApiResponse } from './client';

// ============ Types ============

export interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface Order {
  id: string;
  user_id?: string;
  subtotal: number;
  discount?: number;
  shipping_cost?: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: string;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  coupon_code?: string;
  shipping_address?: ShippingAddress;
  notes?: string;
  items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  shipping_address: ShippingAddress;
  payment_method: 'card' | 'upi' | 'cod';
  subtotal: number;
  discount?: number;
  shipping_cost?: number;
  total_amount: number;
  coupon_code?: string;
  notes?: string;
}

// ============ API Methods ============

export const ordersApi = {
  /**
   * Create a new order
   */
  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data!;
  },

  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order | null> => {
    try {
      const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Get user's orders
   */
  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/orders/my-orders');
    return response.data || [];
  },

  /**
   * Track order by ID (public - no auth required)
   */
  track: async (orderId: string): Promise<Order | null> => {
    try {
      const response = await api.get<ApiResponse<Order>>(`/orders/track/${orderId}`, { skipAuth: true });
      return response.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Cancel an order
   */
  cancel: async (orderId: string, reason?: string): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`, { reason });
    return response.data!;
  },

  /**
   * Get order items
   */
  getItems: async (orderId: string): Promise<OrderItem[]> => {
    const response = await api.get<ApiResponse<OrderItem[]>>(`/orders/${orderId}/items`);
    return response.data || [];
  },

  /**
   * Download invoice
   */
  getInvoice: async (orderId: string): Promise<string> => {
    const response = await api.get<ApiResponse<{ url: string }>>(`/orders/${orderId}/invoice`);
    return response.data?.url || '';
  },

  /**
   * Apply coupon to order
   */
  applyCoupon: async (code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string }> => {
    const response = await api.post<ApiResponse<{ valid: boolean; discount: number; message: string }>>(
      '/orders/apply-coupon',
      { code, subtotal }
    );
    return response.data || { valid: false, discount: 0, message: 'Invalid coupon' };
  },
};

export default ordersApi;
