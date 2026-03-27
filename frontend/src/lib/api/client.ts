/**
 * API Client - HTTP request handler for Node.js backend
 * 
 * This module provides a centralized API client with:
 * - Automatic authentication header injection
 * - Error handling and response parsing
 * - Token management utilities
 */

// API base URL - configure in .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

// ============ Token Management ============

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ============ Types ============

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: 'admin' | 'moderator' | 'user';
  address?: string;
  city?: string;
  postal_code?: string;
  created_at?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  token?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ============ Request Handler ============

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;
  
  // Build request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Build request config
  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };
  
  // Add body for non-GET requests
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new ApiError('Server error', response.status);
      }
      return {} as T;
    }
    
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'Request failed',
        response.status
      );
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError('Network error - please check your connection', 0);
    }
    
    throw new ApiError('An unexpected error occurred', 500);
  }
}

// ============ Convenience Methods ============

export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),
    
  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),
    
  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
    
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
