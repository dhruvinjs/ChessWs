import React from "react";
import { SquareProps } from "../../types/chess";

export const Square = React.memo(
  ({
    piece,
    isLight,
    isSelected,
    isValidMove,
    isLastMove,
    onClick,
  }: SquareProps) => {
    const baseClasses =
      "aspect-square flex items-center justify-center cursor-pointer transition-all duration-200 relative";
    const colorClasses = isLight
      ? "bg-amber-100 dark:bg-amber-200/80"
      : "bg-amber-700 dark:bg-amber-800/80";

    const stateClasses = [
      isSelected && "ring-4 ring-blue-400 ring-inset",
      isValidMove && "ring-4 ring-green-400 ring-inset",
      isLastMove && "ring-4 ring-yellow-400 ring-inset",
      "hover:brightness-110",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        className={`${baseClasses} ${colorClasses} ${stateClasses}`}
        onClick={onClick}
      >
        {/* Piece SVG */}
        {piece && (
          <img
            src={`/pieces/${piece}.svg`}
            alt={piece}
            className="w-4/5 h-4/5 select-none drop-shadow-sm"
            draggable={false}
          />
        )}

        {/* Dot for empty-square valid moves */}
        {isValidMove && !piece && (
          <div className="w-4 h-4 bg-green-500 rounded-full opacity-60" />
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.piece === nextProps.piece &&
      prevProps.isLight === nextProps.isLight &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isValidMove === nextProps.isValidMove &&
      prevProps.isLastMove === nextProps.isLastMove
    );
  }
);

Square.displayName = "Square";
