import React from "react";

interface PlayerInfoProps {
  playerName: string;
  playerColor: "white" | "black";
  rating?: number;
  timeLeft?: string;
  position?: "top" | "bottom";
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  playerName,
  playerColor,
  rating,
  timeLeft,
  position = "top",
}) => {
  const roundedClass =
    position === "top"
      ? "rounded-t-lg sm:rounded-t-xl"
      : "rounded-b-lg sm:rounded-b-xl";

  return (
    <div
      className={`flex items-center justify-between p-2 sm:p-3 bg-slate-800/60 dark:bg-slate-800/80 border border-slate-700/50 ${roundedClass} backdrop-blur-sm shadow-lg`}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div
          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 shadow-md ${
            playerColor === "white"
              ? "bg-slate-100 text-slate-800 border-2 border-slate-300"
              : "bg-slate-900 text-slate-100 border-2 border-slate-600"
          }`}
        >
          {playerName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-gray-100 truncate">
            {playerName}
          </p>
          {rating && (
            <p className="text-[10px] sm:text-xs text-gray-400 truncate">
              Rating: {rating}
            </p>
          )}
        </div>
      </div>
      {timeLeft && (
        <div className="text-sm sm:text-base font-mono font-bold text-gray-100 bg-slate-700/70 px-2 sm:px-3 py-1 sm:py-1.5 rounded shadow-md flex-shrink-0 ml-2">
          {timeLeft}
        </div>
      )}
    </div>
  );
};
