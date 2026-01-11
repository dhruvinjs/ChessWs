import { motion } from "framer-motion";

export const LoadingScreen = () => {
  const loadingMessages = [
    "Initializing chess engine...",
    "Connecting to game servers...",
    "Loading your game history...",
    "Synchronizing player data...",
    "Preparing the board...",
    "Almost ready to play!",
  ];

  // Get current message based on time (changes every 2.5 seconds)
  const getCurrentMessage = () => {
    const messageIndex = Math.floor(
      (Date.now() / 2500) % loadingMessages.length
    );
    return loadingMessages[messageIndex];
  };

  // Get current dots based on time (changes every 0.5 seconds)
  const getCurrentDots = () => {
    return ".".repeat(Math.floor((Date.now() / 500) % 4));
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 z-50 overflow-hidden">
      {/* Enhanced floating background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.7, 0.3],
            x: [-20, 20, -20],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.6, 0.2],
            x: [20, -20, 20],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/15 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.4, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Enhanced chess pieces animation */}
      <div className="relative mb-8">
        {/* Main rotating chess piece */}
        <motion.div
          className="relative w-24 h-24 mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            className="w-full h-full text-indigo-600 dark:text-indigo-400 drop-shadow-lg"
            fill="currentColor"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M42 52H22c0-6 4-9 8-12v-4l-4-4 2-8h-4v-4h8l2 6 6-4 4 6-6 6v4c4 3 8 6 8 14zM20 56h24v4H20z" />
          </motion.svg>
        </motion.div>

        {/* Orbiting smaller pieces */}
        <motion.div
          className="absolute inset-0 w-24 h-24 mx-auto"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <motion.div className="absolute -top-2 left-1/2 w-4 h-4 text-amber-500 -translate-x-1/2">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M19 22H5v-2h14v2m-8-3c-.27 0-.5-.11-.71-.29L9 17.41 7.71 18.7c-.18.19-.43.3-.71.3s-.53-.11-.71-.3c-.19-.18-.29-.43-.29-.7s.1-.52.29-.71L7.59 16 6.3 14.71c-.19-.18-.3-.43-.3-.71s.11-.53.3-.71c.18-.19.43-.29.71-.29s.53.1.71.29L9 14.59l1.29-1.3c.18-.19.44-.29.71-.29s.53.1.71.29c.19.18.29.43.29.71s-.1.53-.29.71L10.41 16l1.3 1.29c.19.18.29.43.29.71s-.1.52-.29.7c-.18.19-.44.3-.71.3z" />
            </svg>
          </motion.div>
          <motion.div className="absolute top-1/2 -right-2 w-3 h-3 text-purple-500 -translate-y-1/2">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          </motion.div>
          <motion.div className="absolute -bottom-2 left-1/2 w-4 h-4 text-green-500 -translate-x-1/2">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M7.5 15.5L4.4 12.4L3 13.8L7.5 18.3L21 4.8L19.6 3.4L7.5 15.5Z" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Dynamic loading messages */}
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          ChessWs
        </motion.h2>

        <motion.div
          className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200 min-h-[28px] flex items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="animate-pulse">
            {getCurrentMessage()}
            <span className="ml-1 animate-bounce">{getCurrentDots()}</span>
          </span>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500"
            initial={{ width: "0%" }}
            animate={{ width: "90%" }}
            transition={{ duration: 5, ease: "easeInOut" }}
          />
        </div>

        {/* Helpful tip for free tier */}
        <motion.p
          className="text-sm text-slate-500 dark:text-slate-400 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          ⚡ Running on free hosting - Thanks for your patience!
        </motion.p>
      </div>
    </div>
  );
};
