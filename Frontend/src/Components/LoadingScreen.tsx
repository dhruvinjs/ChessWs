import { motion } from "framer-motion";
import { useEffect } from "react";
import { useThemeStore } from "../stores/useThemeStore";

export const LoadingScreen = () => {
  const { initTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 z-50 overflow-hidden">
      {/* Floating blurred background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Chess piece loader icon */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="w-20 h-20 text-indigo-600 dark:text-indigo-400"
        fill="currentColor"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      >
        {/* Simple knight silhouette */}
        <path d="M42 52H22c0-6 4-9 8-12v-4l-4-4 2-8h-4v-4h8l2 6 6-4 4 6-6 6v4c4 3 8 6 8 14zM20 56h24v4H20z" />
      </motion.svg>

      {/* Animated loading text */}
      <motion.p
        className="mt-6 text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading your move history...
      </motion.p>
    </div>
  );
};
