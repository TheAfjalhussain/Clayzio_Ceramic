/**
 * Products API Service
 * 
 * Handles product listing, details, search, and filtering
 */

import { api, ApiResponse, PaginatedResponse } from './client';

// ============ Types ============

export interface Product {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  original_price?: number;
  category: string;
  images: string[];
  in_stock: boolean;
  stock_quantity?: number;
  is_bestseller?: boolean;
  is_new?: boolean;
  rating?: number;
  review_count?: number;
  care_instructions?: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_value: string;
  price_adjustment?: number;
  stock_quantity?: number;
  is_available: boolean;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'newest' | 'bestseller';
  page?: number;
  limit?: number;
}

// ============ API Methods ============

export const productsApi = {
  /**
   * Get all products with optional filters
   */
  getAll: async (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ApiResponse<Product[]>>(endpoint, { skipAuth: true });
    return response.data || [];
  },

  /**
   * Get paginated products
   */
  getPaginated: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = `/products/paginated${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<ApiResponse<PaginatedResponse<Product>>>(endpoint, { skipAuth: true });
    return response.data || { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  },

  /**
   * Get single product by ID
   */
  getById: async (id: string): Promise<Product | null> => {
    try {
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`, { skipAuth: true });
      return response.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Get product by slug
   */
  getBySlug: async (slug: string): Promise<Product | null> => {
    try {
      const response = await api.get<ApiResponse<Product>>(`/products/slug/${slug}`, { skipAuth: true });
      return response.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Get featured products
   */
  getFeatured: async (limit = 4): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/featured?limit=${limit}`, { skipAuth: true });
    return response.data || [];
  },

  /**
   * Get bestseller products
   */
  getBestsellers: async (limit = 4): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/bestsellers?limit=${limit}`, { skipAuth: true });
    return response.data || [];
  },

  /**
   * Get new arrivals
   */
  getNewArrivals: async (limit = 4): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/new?limit=${limit}`, { skipAuth: true });
    return response.data || [];
  },

  /**
   * Get related products
   */
  getRelated: async (productId: string, limit = 4): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/${productId}/related?limit=${limit}`, { skipAuth: true });
    return response.data || [];
  },

  /**
   * Search products
   */
  search: async (query: string): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/search?q=${encodeURIComponent(query)}`, { skipAuth: true });
    return response.data || [];
  },

  /**
   * Get products by category
   */
  getByCategory: async (category: string, limit?: number): Promise<Product[]> => {
    const endpoint = `/products/category/${category}${limit ? `?limit=${limit}` : ''}`;
    const response = await api.get<ApiResponse<Product[]>>(endpoint, { skipAuth: true });
    return response.data || [];
  },

  /**
   * Get product variants
   */
  getVariants: async (productId: string): Promise<ProductVariant[]> => {
    const response = await api.get<ApiResponse<ProductVariant[]>>(`/products/${productId}/variants`, { skipAuth: true });
    return response.data || [];
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/products/categories', { skipAuth: true });
    return response.data || [];
  },
};

export default productsApi;
