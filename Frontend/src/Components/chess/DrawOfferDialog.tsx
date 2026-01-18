import { useEffect, useState, memo, useCallback, useRef } from "react";
import { Handshake, X, Clock } from "lucide-react";
import { useGameStore } from "../../stores/useGameStore";
import { motion, AnimatePresence } from "framer-motion";

function DrawOfferDialogComponent() {
  const drawOfferReceived = useGameStore((state) => state.drawOfferReceived);
  const moves = useGameStore((state) => state.moves);
  const [timeLeft, setTimeLeft] = useState(30);
  const movesCountRef = useRef(moves.length);

  const acceptDraw = useCallback(() => {
    const { acceptDraw } = useGameStore.getState();
    acceptDraw();
  }, []);

  const rejectDraw = useCallback(() => {
    const { rejectDraw } = useGameStore.getState();
    rejectDraw();
  }, []);

  // Auto-reject draw offer when a move is made
  useEffect(() => {
    if (drawOfferReceived && moves.length > movesCountRef.current) {
      rejectDraw();
    }
    movesCountRef.current = moves.length;
  }, [moves.length, drawOfferReceived, rejectDraw]);

  useEffect(() => {
    if (!drawOfferReceived) {
      movesCountRef.current = moves.length;
      return;
    }

    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          rejectDraw();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [drawOfferReceived, rejectDraw, moves.length]);

  if (!drawOfferReceived) return null;

  const progress = (timeLeft / 30) * 100;

  return (
    <AnimatePresence>
      {drawOfferReceived && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[60] flex justify-center p-3 sm:p-4 pointer-events-none"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Banner Container */}
          <motion.div
            className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-300 dark:border-slate-600 pointer-events-auto overflow-hidden"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Progress bar at top */}
            <div className="h-1 bg-slate-200 dark:bg-slate-700">
              <motion.div
                className={`h-full bg-blue-500 dark:bg-blue-400 ${timeLeft <= 10 ? "animate-pulse" : ""}`}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-700">
                  <Handshake className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    Draw Offer Received
                    <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                      <Clock className="w-3 h-3" />
                      {timeLeft}s
                    </span>
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-3">
                    Your opponent has offered a draw. Accept or decline?
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                      onClick={acceptDraw}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all text-sm sm:text-base"
                    >
                      <Handshake className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={rejectDraw}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 active:scale-95 transition-all text-sm sm:text-base"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={rejectDraw}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const DrawOfferDialog = memo(DrawOfferDialogComponent);
DrawOfferDialog.displayName = "DrawOfferDialog";
