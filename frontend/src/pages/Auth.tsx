/**
 * Authentication Page
 * 
 * Handles user sign in and sign up using Node.js API
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

type AuthMode = 'signin' | 'signup';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>(() => {
    return searchParams.get('mode') === 'register' ? 'signup' : 'signin';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (mode === 'signup') {
      const validation = signupSchema.safeParse(formData);
      if (!validation.success) {
        const newErrors: typeof errors = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as keyof typeof errors;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
        return;
      }

      setIsLoading(true);
      try {
        await register(formData.name, formData.email, formData.password);
        toast.success('Account created successfully!');
        navigate('/');
      } catch (error: any) {
        const message = error.message || 'An unexpected error occurred. Please try again.';
        if (message.includes("already exists") || message.includes("already registered")) {
          toast.error("An account with this email already exists. Please sign in instead.");
        } else {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      const validation = loginSchema.safeParse({ email: formData.email, password: formData.password });
      if (!validation.success) {
        const newErrors: typeof errors = {};
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as keyof typeof errors;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
        return;
      }

      setIsLoading(true);
      try {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
        navigate('/');
      } catch (error: any) {
        const message = error.message || 'An unexpected error occurred. Please try again.';
        if (message.includes("Invalid") || message.includes("credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[80vh] flex items-center">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-muted-foreground">
                {mode === 'signin' 
                  ? 'Sign in to access your account and orders'
                  : 'Join the Clayzio family for exclusive offers'
                }
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl shadow-soft">
              {/* Toggle */}
              <div className="flex bg-muted rounded-full p-1 mb-8">
                <button
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-2 rounded-full font-medium transition-colors ${
                    mode === 'signin' ? 'bg-card shadow-sm' : ''
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2 rounded-full font-medium transition-colors ${
                    mode === 'signup' ? 'bg-card shadow-sm' : ''
                  }`}
                >
                  Sign Up
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.name ? 'ring-2 ring-destructive' : ''
                      }`}
                    />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    className={`w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.email ? 'ring-2 ring-destructive' : ''
                    }`}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 pr-12 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.password ? 'ring-2 ring-destructive' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-sage py-4 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading 
                    ? (mode === 'signin' ? 'Signing in...' : 'Creating account...') 
                    : (mode === 'signin' ? 'Sign In' : 'Create Account')
                  }
                </button>
              </form>
              
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {mode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('signin')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-6">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}









// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Layout } from '@/components/layout/Layout';
// import { supabase } from '@/integrations/supabase/client';
// import { toast } from 'sonner';
// import { Eye, EyeOff } from 'lucide-react';
// import { z } from 'zod';

// type AuthMode = 'signin' | 'signup';

// const loginSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// });

// const signupSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters"),
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// });

// export default function Auth() {
//   const navigate = useNavigate();
//   const [mode, setMode] = useState<AuthMode>('signin');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//   });
//   const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

//   useEffect(() => {
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       if (session?.user) {
//         navigate('/');
//       }
//     });

//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (session?.user) {
//         navigate('/');
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [navigate]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//     setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});
    
//     if (mode === 'signup') {
//       const validation = signupSchema.safeParse(formData);
//       if (!validation.success) {
//         const newErrors: typeof errors = {};
//         validation.error.errors.forEach((err) => {
//           const field = err.path[0] as keyof typeof errors;
//           newErrors[field] = err.message;
//         });
//         setErrors(newErrors);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const redirectUrl = `${window.location.origin}/`;
//         const { error } = await supabase.auth.signUp({
//           email: formData.email,
//           password: formData.password,
//           options: {
//             emailRedirectTo: redirectUrl,
//             data: {
//               full_name: formData.name,
//             },
//           },
//         });

//         if (error) {
//           if (error.message.includes("User already registered")) {
//             toast.error("An account with this email already exists. Please sign in instead.");
//           } else {
//             toast.error(error.message);
//           }
//           return;
//         }

//         toast.success('Account created successfully!');
//         navigate('/');
//       } catch (error) {
//         toast.error('An unexpected error occurred. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     } else {
//       const validation = loginSchema.safeParse({ email: formData.email, password: formData.password });
//       if (!validation.success) {
//         const newErrors: typeof errors = {};
//         validation.error.errors.forEach((err) => {
//           const field = err.path[0] as keyof typeof errors;
//           newErrors[field] = err.message;
//         });
//         setErrors(newErrors);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const { error } = await supabase.auth.signInWithPassword({
//           email: formData.email,
//           password: formData.password,
//         });

//         if (error) {
//           if (error.message.includes("Invalid login credentials")) {
//             toast.error("Invalid email or password. Please try again.");
//           } else if (error.message.includes("Email not confirmed")) {
//             toast.error("Please confirm your email before signing in.");
//           } else {
//             toast.error(error.message);
//           }
//           return;
//         }

//         toast.success('Welcome back!');
//         navigate('/');
//       } catch (error) {
//         toast.error('An unexpected error occurred. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   return (
//     <Layout>
//       <section className="section-padding bg-background min-h-[80vh] flex items-center">
//         <div className="container-custom">
//           <div className="max-w-md mx-auto">
//             <div className="text-center mb-8">
//               <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
//                 {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
//               </h1>
//               <p className="text-muted-foreground">
//                 {mode === 'signin' 
//                   ? 'Sign in to access your account and orders'
//                   : 'Join the Clayzio family for exclusive offers'
//                 }
//               </p>
//             </div>
            
//             <div className="bg-card p-8 rounded-2xl shadow-soft">
//               {/* Toggle */}
//               <div className="flex bg-muted rounded-full p-1 mb-8">
//                 <button
//                   onClick={() => setMode('signin')}
//                   className={`flex-1 py-2 rounded-full font-medium transition-colors ${
//                     mode === 'signin' ? 'bg-card shadow-sm' : ''
//                   }`}
//                 >
//                   Sign In
//                 </button>
//                 <button
//                   onClick={() => setMode('signup')}
//                   className={`flex-1 py-2 rounded-full font-medium transition-colors ${
//                     mode === 'signup' ? 'bg-card shadow-sm' : ''
//                   }`}
//                 >
//                   Sign Up
//                 </button>
//               </div>
              
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 {mode === 'signup' && (
//                   <div>
//                     <label className="block text-sm font-medium mb-2">Full Name</label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                       placeholder="Enter your name"
//                       disabled={isLoading}
//                       className={`w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
//                         errors.name ? 'ring-2 ring-destructive' : ''
//                       }`}
//                     />
//                     {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
//                   </div>
//                 )}
                
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Email</label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     placeholder="Enter your email"
//                     disabled={isLoading}
//                     className={`w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
//                       errors.email ? 'ring-2 ring-destructive' : ''
//                     }`}
//                   />
//                   {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Password</label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       name="password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       placeholder="Enter your password"
//                       disabled={isLoading}
//                       className={`w-full px-4 py-3 pr-12 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
//                         errors.password ? 'ring-2 ring-destructive' : ''
//                       }`}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                     >
//                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                     </button>
//                   </div>
//                   {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
//                 </div>
                
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full btn-sage py-4 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isLoading 
//                     ? (mode === 'signin' ? 'Signing in...' : 'Creating account...') 
//                     : (mode === 'signin' ? 'Sign In' : 'Create Account')
//                   }
//                 </button>
//               </form>
              
//               <div className="mt-6 text-center text-sm text-muted-foreground">
//                 {mode === 'signin' ? (
//                   <>
//                     Don't have an account?{' '}
//                     <button
//                       onClick={() => setMode('signup')}
//                       className="text-primary hover:underline font-medium"
//                     >
//                       Sign up
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     Already have an account?{' '}
//                     <button
//                       onClick={() => setMode('signin')}
//                       className="text-primary hover:underline font-medium"
//                     >
//                       Sign in
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
            
//             <p className="text-center text-sm text-muted-foreground mt-6">
//               By continuing, you agree to our{' '}
//               <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
//               {' '}and{' '}
//               <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
//             </p>
//           </div>
//         </div>
//       </section>
//     </Layout>
//   );
// }
