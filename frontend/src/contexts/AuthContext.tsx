/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 * Uses Node.js backend API for authentication
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authApi } from '@/lib/api/auth';
import { User, getStoredUser, getAuthToken } from '@/lib/api/client';

// ============ Types ============

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

// ============ Context ============

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============ Provider ============

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAuth = useCallback(async () => {
    const token = getAuthToken();
    
    if (!token) {
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      const verifiedUser = await authApi.verifyToken();
      if (verifiedUser) {
        setUser(verifiedUser);
        setIsAdmin(verifiedUser.role === 'admin');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch {
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Update admin status when user changes
  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    setUser(result.user);
    setIsAdmin(result.user.role === 'admin');
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await authApi.register({ name, email, password });
    setUser(result.user);
    setIsAdmin(result.user.role === 'admin');
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsAdmin(false);
  };

  const updateProfile = async (data: Partial<User>) => {
    const updatedUser = await authApi.updateProfile(data);
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============ Hook ============

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;









// /**
//  * Authentication Context
//  * 
//  * Provides authentication state and methods throughout the app
//  * Uses Node.js backend API for authentication
//  */

// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { authApi } from '@/lib/api/auth';
// import { User, getStoredUser, getAuthToken } from '@/lib/api/client';

// // ============ Types ============

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   isAdmin: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (name: string, email: string, password: string) => Promise<void>;
//   logout: () => void;
//   updateProfile: (data: Partial<User>) => Promise<void>;
//   checkAuth: () => Promise<void>;
// }

// // ============ Context ============

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // ============ Provider ============

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export function AuthProvider({ children }: AuthProviderProps) {
//   const [user, setUser] = useState<User | null>(() => getStoredUser());
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAdmin, setIsAdmin] = useState(false);

//   // Check auth status on mount
//   useEffect(() => {
//     checkAuth();
//   }, []);

//   // Check admin status when user changes
//   useEffect(() => {
//     if (user) {
//       // Check if user has admin role
//       setIsAdmin(user.role === 'admin');
//     } else {
//       setIsAdmin(false);
//     }
//   }, [user]);

//   const checkAuth = async () => {
//     const token = getAuthToken();
    
//     if (!token) {
//       setUser(null);
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const verifiedUser = await authApi.verifyToken();
//       if (verifiedUser) {
//         setUser(verifiedUser);
//         setIsAdmin(verifiedUser.role === 'admin');
//       } else {
//         setUser(null);
//         setIsAdmin(false);
//       }
//     } catch {
//       setUser(null);
//       setIsAdmin(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const login = async (email: string, password: string) => {
//     const result = await authApi.login({ email, password });
//     setUser(result.user);
//     setIsAdmin(result.user.role === 'admin');
//   };

//   const register = async (name: string, email: string, password: string) => {
//     const result = await authApi.register({ name, email, password });
//     setUser(result.user);
//     setIsAdmin(result.user.role === 'admin');
//   };

//   const logout = () => {
//     authApi.logout();
//     setUser(null);
//     setIsAdmin(false);
//   };

//   const updateProfile = async (data: Partial<User>) => {
//     const updatedUser = await authApi.updateProfile(data);
//     setUser(updatedUser);
//   };

//   const value: AuthContextType = {
//     user,
//     isLoading,
//     isAuthenticated: !!user,
//     isAdmin,
//     login,
//     register,
//     logout,
//     updateProfile,
//     checkAuth,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // ============ Hook ============

// export function useAuth() {
//   const context = useContext(AuthContext);
  
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
  
//   return context;
// }

// export default AuthContext;








// // /**
// //  * Authentication Context
// //  * 
// //  * Provides authentication state and methods throughout the app
// //  */

// // import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// // import { authApi, User, getStoredUser, getAuthToken } from '@/lib/api';

// // // ============ Types ============

// // interface AuthContextType {
// //   user: User | null;
// //   isLoading: boolean;
// //   isAuthenticated: boolean;
// //   isAdmin: boolean;
// //   login: (email: string, password: string) => Promise<void>;
// //   register: (name: string, email: string, password: string) => Promise<void>;
// //   logout: () => void;
// //   updateProfile: (data: Partial<User>) => Promise<void>;
// //   checkAuth: () => Promise<void>;
// // }

// // // ============ Context ============

// // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // // ============ Provider ============

// // interface AuthProviderProps {
// //   children: ReactNode;
// // }

// // export function AuthProvider({ children }: AuthProviderProps) {
// //   const [user, setUser] = useState<User | null>(() => getStoredUser());
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [isAdmin, setIsAdmin] = useState(false);

// //   // Check auth status on mount
// //   useEffect(() => {
// //     checkAuth();
// //   }, []);

// //   // Check admin status when user changes
// //   useEffect(() => {
// //     if (user) {
// //       checkAdminStatus();
// //     } else {
// //       setIsAdmin(false);
// //     }
// //   }, [user]);

// //   const checkAuth = async () => {
// //     const token = getAuthToken();
    
// //     if (!token) {
// //       setUser(null);
// //       setIsLoading(false);
// //       return;
// //     }

// //     try {
// //       const verifiedUser = await authApi.verifyToken();
// //       setUser(verifiedUser);
// //     } catch {
// //       setUser(null);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const checkAdminStatus = async () => {
// //     if (!user) {
// //       setIsAdmin(false);
// //       return;
// //     }

// //     try {
// //       const hasAdminRole = await authApi.checkAdminRole();
// //       setIsAdmin(hasAdminRole);
// //     } catch {
// //       setIsAdmin(false);
// //     }
// //   };

// //   const login = async (email: string, password: string) => {
// //     const result = await authApi.login({ email, password });
// //     setUser(result.user);
// //   };

// //   const register = async (name: string, email: string, password: string) => {
// //     const result = await authApi.register({ name, email, password });
// //     setUser(result.user);
// //   };

// //   const logout = () => {
// //     authApi.logout();
// //     setUser(null);
// //     setIsAdmin(false);
// //   };

// //   const updateProfile = async (data: Partial<User>) => {
// //     const updatedUser = await authApi.updateProfile(data);
// //     setUser(updatedUser);
// //   };

// //   const value: AuthContextType = {
// //     user,
// //     isLoading,
// //     isAuthenticated: !!user,
// //     isAdmin,
// //     login,
// //     register,
// //     logout,
// //     updateProfile,
// //     checkAuth,
// //   };

// //   return (
// //     <AuthContext.Provider value={value}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }

// // // ============ Hook ============

// // export function useAuth() {
// //   const context = useContext(AuthContext);
  
// //   if (context === undefined) {
// //     throw new Error('useAuth must be used within an AuthProvider');
// //   }
  
// //   return context;
// // }

// // export default AuthContext;
