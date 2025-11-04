import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";

export function NotFound  ()  {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-white px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 2.5,
            ease: "easeInOut",
          }}
          className="text-6xl mb-4"
        >
          🎮
        </motion.div>

        <h1 className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">
          404
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
          Oops! The page you're looking for does'nt exist.
        </p>

        <Link
          to="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Go Home
        </Link>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          You tried: <span className="font-mono">{location.pathname}</span>
        </p>
      </motion.div>
    </div>
  );
};

