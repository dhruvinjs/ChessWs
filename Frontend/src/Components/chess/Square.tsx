import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SquareProps } from "../../types/chess";
import { Piece } from "./Piece";

const SquareComponent = ({
  piece,
  isLight,
  isSelected,
  isValidMove,
  isLastMove,
  onClick,
  rankLabel,
  fileLabel,
}: SquareProps) => {
  const baseClasses =
    "aspect-square flex items-center justify-center relative overflow-visible";
  const colorClasses = isLight
    ? "bg-amber-100 dark:bg-amber-200/80"
    : "bg-amber-700 dark:bg-amber-800/80";

  return (
    <div className={`${baseClasses} ${colorClasses}`} onClick={onClick}>
      {/* --- Overlay Rings for selection, valid moves, etc. --- */}
      <AnimatePresence>
        {isSelected && <HighlightRing color="blue" />}
        {isLastMove && <HighlightRing color="yellow" />}
      </AnimatePresence>

      {/* --- Chess Piece with simple animation --- */}
      <AnimatePresence mode="wait">
        {piece && (
          <motion.div
            key={piece}
            className="absolute inset-0 p-1 cursor-pointer z-10"
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              transition: {
                duration: 0.15,
              },
            }}
            whileHover={{
              scale: 1.05,
              transition: {
                duration: 0.2,
              },
            }}
          >
            <Piece piece={piece} className="w-full h-full drop-shadow-md" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Valid Move Indicators --- */}
      <AnimatePresence>
        {isValidMove && !piece && <ValidMoveDot />}
        {isValidMove && piece && <ValidMoveBorder />}
      </AnimatePresence>

      {/* --- Internal Notation Labels --- */}
      {rankLabel && (
        <span
          className={`absolute top-0.5 left-0.5 text-[10px] sm:text-xs font-bold select-none pointer-events-none z-20 ${
            isLight ? "text-amber-700" : "text-amber-100"
          }`}
        >
          {rankLabel}
        </span>
      )}
      {fileLabel && (
        <span
          className={`absolute bottom-0.5 right-0.5 text-[10px] sm:text-xs font-bold select-none pointer-events-none z-20 ${
            isLight ? "text-amber-700" : "text-amber-100"
          }`}
        >
          {fileLabel}
        </span>
      )}
    </div>
  );
};

export const Square = memo(SquareComponent, (prev, next) => {
  return (
    prev.piece === next.piece &&
    prev.isLight === next.isLight &&
    prev.isSelected === next.isSelected &&
    prev.isValidMove === next.isValidMove &&
    prev.isLastMove === next.isLastMove
  );
});

Square.displayName = "Square";

// --- Helper Components ---

const ringColors: Record<string, string> = {
  blue: "border-blue-500/80",
  yellow: "border-yellow-500/70",
  green: "border-green-600/70",
};

const HighlightRing = memo(({ color }: { color: "blue" | "yellow" }) => (
  <motion.div
    className={`absolute inset-0 border-4 rounded-sm ${ringColors[color]}`}
    initial={{ opacity: 0, scale: 1.1 }}
    animate={{
      opacity: color === "yellow" ? [0.7, 1, 0.7] : 1,
      scale: 1,
    }}
    exit={{ opacity: 0, scale: 1.1 }}
    transition={{
      duration: color === "yellow" ? 1.5 : 0.2,
      repeat: color === "yellow" ? Infinity : 0,
      ease: "easeInOut",
    }}
  />
));
HighlightRing.displayName = "HighlightRing";

const ValidMoveDot = memo(() => (
  <motion.div
    className="w-1/4 h-1/4 bg-green-600/60 rounded-full"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: 1,
      scale: [1, 1.2, 1],
    }}
    exit={{ opacity: 0, scale: 0 }}
    transition={{
      scale: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  />
));
ValidMoveDot.displayName = "ValidMoveDot";

const ValidMoveBorder = memo(() => (
  <motion.div
    className={`absolute inset-0 rounded-full border-[6px] ${ringColors["green"]}`}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.15, ease: "circOut" }}
  />
));
ValidMoveBorder.displayName = "ValidMoveBorder";
