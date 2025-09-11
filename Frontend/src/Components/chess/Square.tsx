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
    ? "bg-amber-100 dark:bg-amber-200/80"
    : "bg-amber-700 dark:bg-amber-800/80";
  
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
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.piece === nextProps.piece &&
    prevProps.isLight === nextProps.isLight &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isValidMove === nextProps.isValidMove &&
    prevProps.isLastMove === nextProps.isLastMove
  );
});

Square.displayName = 'Square';