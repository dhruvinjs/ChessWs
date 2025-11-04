import { useEffect, useState } from "react";
import { Handshake, X, Clock } from "lucide-react";
import { useGameStore } from "../../stores/useGameStore";
import { Button } from "../Button";
import { motion, AnimatePresence } from "framer-motion";

export function DrawOfferDialog() {
  const drawOfferReceived = useGameStore((state) => state.drawOfferReceived);
  const acceptDraw = useGameStore((state) => state.acceptDraw);
  const rejectDraw = useGameStore((state) => state.rejectDraw);

  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!drawOfferReceived) return;

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
  }, [drawOfferReceived, rejectDraw]);

  if (!drawOfferReceived) return null;

  const progress = (timeLeft / 30) * 100;

  return (
    <AnimatePresence>
      {drawOfferReceived && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={rejectDraw}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full mx-4"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Draw Offer
                </h3>
              </div>
              <button
                onClick={rejectDraw}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                Your opponent has offered a draw. Do you want to accept?
              </p>

              {/* Timer */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{timeLeft}s remaining</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-amber-500 ${
                      timeLeft <= 10 ? "animate-pulse" : ""
                    }`}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
              <Button
                variant="outline"
                size="md"
                onClick={rejectDraw}
                text="Reject"
                icon={<X className="w-4 h-4" />}
              />
              <Button
                variant="primary"
                size="md"
                onClick={acceptDraw}
                text="Accept Draw"
                icon={<Handshake className="w-4 h-4" />}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
