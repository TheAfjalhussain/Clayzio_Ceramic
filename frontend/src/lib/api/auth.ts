/**
 * Authentication API Service
 * 
 * Handles user registration, login, logout, and profile management
 */

import { api, ApiResponse, User, setAuthToken, setStoredUser, removeAuthToken, removeStoredUser, getAuthToken } from './client';

// ============ Types ============

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

// ============ API Methods ============

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResult> => {
    const response = await api.post<ApiResponse<AuthResult>>('/auth/register', data, { skipAuth: true });
    
    if (response.data?.token) {
      setAuthToken(response.data.token);
      setStoredUser(response.data.user);
    }
    
    return response.data!;
  },

  /**
   * Login an existing user
   */
  login: async (data: LoginData): Promise<AuthResult> => {
    const response = await api.post<ApiResponse<AuthResult>>('/auth/login', data, { skipAuth: true });
    
    if (response.data?.token) {
      setAuthToken(response.data.token);
      setStoredUser(response.data.user);
    }
    
    return response.data!;
  },

  /**
   * Logout the current user
   */
  logout: (): void => {
    removeAuthToken();
    removeStoredUser();
  },

  /**
   * Get the current user's profile
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data!;
  },

  /**
   * Update the current user's profile
   */
  updateProfile: async (data: ProfileUpdateData): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    
    if (response.data) {
      setStoredUser(response.data);
    }
    
    return response.data!;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/password', { currentPassword, newPassword });
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email }, { skipAuth: true });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password }, { skipAuth: true });
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },

  /**
   * Verify token is still valid
   */
  verifyToken: async (): Promise<User | null> => {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data || null;
    } catch {
      removeAuthToken();
      removeStoredUser();
      return null;
    }
  },

  /**
   * Check if user has admin role
   */
  checkAdminRole: async (): Promise<boolean> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data?.role === 'admin';
    } catch {
      return false;
    }
  },
};

export default authApi;








// /**
//  * Authentication API Service
//  * 
//  * Handles user registration, login, logout, and profile management
//  */

// import { api, ApiResponse, User, setAuthToken, setStoredUser, removeAuthToken, removeStoredUser, getAuthToken } from './client';

// // ============ Types ============

// export interface RegisterData {
//   name: string;
//   email: string;
//   password: string;
//   phone?: string;
// }

// export interface LoginData {
//   email: string;
//   password: string;
// }

// export interface AuthResult {
//   user: User;
//   token: string;
// }

// export interface ProfileUpdateData {
//   name?: string;
//   phone?: string;
//   address?: string;
//   city?: string;
//   postal_code?: string;
// }

// // ============ API Methods ============

// export const authApi = {
//   /**
//    * Register a new user
//    */
//   register: async (data: RegisterData): Promise<AuthResult> => {
//     const response = await api.post<ApiResponse<AuthResult>>('/auth/register', data, { skipAuth: true });
    
//     if (response.data?.token) {
//       setAuthToken(response.data.token);
//       setStoredUser(response.data.user);
//     }
    
//     return response.data!;
//   },

//   /**
//    * Login an existing user
//    */
//   login: async (data: LoginData): Promise<AuthResult> => {
//     const response = await api.post<ApiResponse<AuthResult>>('/auth/login', data, { skipAuth: true });
    
//     if (response.data?.token) {
//       setAuthToken(response.data.token);
//       setStoredUser(response.data.user);
//     }
    
//     return response.data!;
//   },

//   /**
//    * Logout the current user
//    */
//   logout: (): void => {
//     removeAuthToken();
//     removeStoredUser();
//   },

//   /**
//    * Get the current user's profile
//    */
//   getProfile: async (): Promise<User> => {
//     const response = await api.get<ApiResponse<User>>('/auth/profile');
//     return response.data!;
//   },

//   /**
//    * Update the current user's profile
//    */
//   updateProfile: async (data: ProfileUpdateData): Promise<User> => {
//     const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    
//     if (response.data) {
//       setStoredUser(response.data);
//     }
    
//     return response.data!;
//   },

//   /**
//    * Change password
//    */
//   changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
//     await api.put('/auth/password', { currentPassword, newPassword });
//   },

//   /**
//    * Request password reset
//    */
//   forgotPassword: async (email: string): Promise<void> => {
//     await api.post('/auth/forgot-password', { email }, { skipAuth: true });
//   },

//   /**
//    * Reset password with token
//    */
//   resetPassword: async (token: string, password: string): Promise<void> => {
//     await api.post('/auth/reset-password', { token, password }, { skipAuth: true });
//   },

//   /**
//    * Check if user is authenticated
//    */
//   isAuthenticated: (): boolean => {
//     return !!getAuthToken();
//   },

//   /**
//    * Verify token is still valid
//    */
//   verifyToken: async (): Promise<User | null> => {
//     const token = getAuthToken();
//     if (!token) return null;

//     try {
//       const response = await api.get<ApiResponse<User>>('/auth/verify');
//       return response.data || null;
//     } catch {
//       removeAuthToken();
//       removeStoredUser();
//       return null;
//     }
//   },

//   /**
//    * Check if user has admin role
//    */
//   checkAdminRole: async (): Promise<boolean> => {
//     try {
//       const response = await api.get<ApiResponse<{ isAdmin: boolean }>>('/auth/check-admin');
//       return response.data?.isAdmin || false;
//     } catch {
//       return false;
//     }
//   },
// };

// export default authApi;
