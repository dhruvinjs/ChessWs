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
}: SquareProps) => {
  const baseClasses =
    "aspect-square flex items-center justify-center relative";
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

      {/* --- Chess Piece with pointer cursor --- */}
      <AnimatePresence>
        {piece && (
          <motion.div
            key={piece}
            className="w-full h-full p-1 cursor-pointer" // Replaced cursor-grab with cursor-pointer
            initial={{ opacity: 0, y: -15, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x:2,
              transition: { type: "spring", stiffness: 250, damping: 25 },
            }}
            exit={{
              opacity: 0,
              y: 15,
              scale: 0.8,
              transition: { duration: 0.15 },
            }}
            whileHover={{
              scale: 1.1,
              y: -5,
              filter: "brightness(1.2)",
            }}
            layout
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
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.1 }}
    transition={{ duration: 0.2, ease: "easeInOut" }}
  />
));
HighlightRing.displayName = "HighlightRing";

const ValidMoveDot = memo(() => (
  <motion.div
    className="w-1/4 h-1/4 bg-green-600/50 rounded-full"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0 }}
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
