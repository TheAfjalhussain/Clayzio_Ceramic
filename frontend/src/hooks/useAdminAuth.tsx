/**
 * Admin Auth Hook
 * 
 * Protects admin routes by checking if the user has admin role
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminAuth = () => {
  const { user, isLoading: authLoading, isAuthenticated, isAdmin: contextIsAdmin } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;

      // If not authenticated, redirect to auth page
      if (!isAuthenticated) {
        setIsAdmin(false);
        setIsLoading(false);
        navigate('/auth');
        return;
      }

      // Check if user has admin role from context
      if (!contextIsAdmin && user?.role !== 'admin') {
        setIsAdmin(false);
        setIsLoading(false);
        navigate('/');
        return;
      }

      setIsAdmin(true);
      setIsLoading(false);
    };

    checkAdminStatus();
  }, [authLoading, isAuthenticated, contextIsAdmin, user, navigate]);

  return { isAdmin, isLoading };
};







// /**
//  * Admin Auth Hook
//  * 
//  * Protects admin routes by checking if the user has admin role
//  */

// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import { authApi } from '@/lib/api';

// export const useAdminAuth = () => {
//   const { user, isLoading: authLoading, isAuthenticated } = useAuth();
//   const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAdminStatus = async () => {
//       // Wait for auth to finish loading
//       if (authLoading) return;

//       // If not authenticated, redirect to auth page
//       if (!isAuthenticated) {
//         setIsAdmin(false);
//         setIsLoading(false);
//         navigate('/auth');
//         return;
//       }

//       try {
//         // Check if user has admin role
//         const hasAdminRole = await authApi.checkAdminRole();

//         if (!hasAdminRole) {
//           setIsAdmin(false);
//           setIsLoading(false);
//           navigate('/');
//           return;
//         }

//         setIsAdmin(true);
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error checking admin status:', error);
//         setIsAdmin(false);
//         setIsLoading(false);
//         navigate('/');
//       }
//     };

//     checkAdminStatus();
//   }, [authLoading, isAuthenticated, navigate]);

//   return { isAdmin, isLoading };
// };
