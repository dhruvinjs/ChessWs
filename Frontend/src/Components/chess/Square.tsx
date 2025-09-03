import React from 'react';
import { SquareProps } from '../../types/chess';
import { PIECE_SYMBOLS } from '../../constants';
export const Square= React.memo(({ 
  piece, 
  isLight, 
  isSelected, 
  isValidMove, 
  isLastMove, 
  onClick 
}: SquareProps) => {
  const baseClasses = "aspect-square flex items-center justify-center text-3xl lg:text-4xl cursor-pointer transition-all duration-200 relative";
const colorClasses = isLight
  ? "bg-sky-100 dark:bg-sky-200/80"
  : "bg-slate-700 dark:bg-slate-700/80";
  
  const stateClasses = [
    isSelected && "ring-4 ring-blue-400 ring-inset",
    isValidMove && "ring-4 ring-green-400 ring-inset",
    isLastMove && "ring-4 ring-yellow-400 ring-inset",
    "hover:brightness-110"
  ].filter(Boolean).join(" ");

  return (
    <div 
      className={`${baseClasses} ${colorClasses} ${stateClasses}`}
      onClick={onClick}
    >
      {piece && (
        <span className="drop-shadow-sm select-none">
          {PIECE_SYMBOLS[piece]}
        </span>
      )}
      {isValidMove && !piece && (
        <div className="w-4 h-4 bg-green-500 rounded-full opacity-60" />
      )}
    </div>
  );
});

Square.displayName = 'Square';