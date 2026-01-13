import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../Components/Navbar';
import { useUserQuery } from '../hooks/useUserQuery';
import { LoadingScreen } from '../Components/LoadingScreen';

export function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading, isFetching } = useUserQuery();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if user should be redirected (only after loading is complete)
  const publicPages = ['/', '/login', '/register'];
  const shouldRedirect =
    !isLoading &&
    !isFetching &&
    user &&
    !user.isGuest &&
    publicPages.includes(location.pathname);

  // ✅ Redirect authenticated (non-guest) users away from all public pages
useEffect(() => {
    if (shouldRedirect && !isRedirecting) {
      setIsRedirecting(true);

      // 2. Reduce the timeout. 3 seconds is too long for a transition.
      // 1 second (1000ms) is plenty to show the "Welcome Back" UI.
      const timer = setTimeout(() => {
        navigate('/home', { replace: true });
        setIsRedirecting(false);
      }, 1000); 

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [shouldRedirect, isRedirecting, navigate]);  // Show loading screen while checking authentication
  if (isLoading || isFetching) {
    return <LoadingScreen />;
  }

  // Show redirect screen immediately if user should be redirected (prevents white flash)
  if (shouldRedirect || isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex-grow pt-16 flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950"
          >
            <div className="text-center space-y-6 p-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto"
              >
                <div className="w-full h-full border-4 border-amber-200 dark:border-amber-700 border-t-amber-600 dark:border-t-amber-400 rounded-full animate-spin"></div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-2"
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Welcome Back! 👋
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  You're already logged in. Redirecting you to home...
                </p>
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'easeInOut' }}
                className="h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto max-w-xs"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}
