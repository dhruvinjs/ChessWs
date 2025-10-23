import { useEffect, useState } from "react";
import { Handshake, X, Clock } from "lucide-react"; // ✅ using Lucide icons here
import { useGameStore } from "../../stores/useGameStore";
import { Button } from "../Button";
export function DrawOfferDialog(){
  const drawOfferReceived = useGameStore((state) => state.drawOfferReceived);
  const acceptDraw = useGameStore((state) => state.acceptDraw);
  const rejectDraw = useGameStore((state) => state.rejectDraw);

  const [timeLeft, setTimeLeft] = useState(30);

  // Countdown + auto reject
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={rejectDraw}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full mx-4 transform transition-all">
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
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-slate-300 dark:text-slate-700"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="text-amber-500 transition-all duration-1000"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={(1 - timeLeft / 30) * 2 * Math.PI * 28}
                  fill="none"
                />
              </svg>
              <Clock className="absolute w-4 h-4 text-amber-500 top-2 right-2" /> {/* ✅ Lucide Clock icon */}
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {timeLeft}s
              </span>
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
            icon={<X className="w-4 h-4" />} // ✅ Added icon to button
          />
          <Button
            variant="primary"
            size="md"
            onClick={acceptDraw}
            text="Accept Draw"
            icon={<Handshake className="w-4 h-4" />} // ✅ Added icon to button
          />
        </div>
      </div>
    </div>
  );
};
