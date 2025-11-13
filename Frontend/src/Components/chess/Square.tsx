import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SquareProps } from "../../types/chess";
import { Piece } from "./Piece";

// Shatter particles component
const ShatterParticles = memo(() => {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 360) / 8;
    const distance = 50 + Math.random() * 30;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    
    return (
      <motion.div
        key={i}
        className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2"
        initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
        animate={{
          x,
          y,
          opacity: 0,
          scale: [1, 0.8, 0],
          rotate: Math.random() * 720 - 360,
        }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-amber-500 to-red-600 rounded-sm shadow-lg" />
      </motion.div>
    );
  });

  return <div className="absolute inset-0 pointer-events-none">{particles}</div>;
});
ShatterParticles.displayName = "ShatterParticles";

const SquareComponent = ({
  piece,
  isLight,
  isSelected,
  isValidMove,
  isLastMove,
  onClick,
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

      {/* --- Chess Piece with death animation --- */}
      <AnimatePresence mode="wait">
        {piece && (
          <motion.div
            key={piece}
            className="absolute inset-0 p-1 cursor-pointer z-10"
            initial={{ 
              opacity: 0, 
              scale: 0, 
              rotate: -180 
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
              transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                duration: 0.6
              },
            }}
            exit={{
              opacity: 0,
              scale: [1, 1.3, 0],
              rotate: [0, 15, -15, 180],
              y: [0, -10, 20],
              filter: [
                "brightness(1)", 
                "brightness(1.5)", 
                "brightness(0)"
              ],
              transition: { 
                duration: 0.5,
                scale: { 
                  times: [0, 0.3, 1], 
                  ease: "easeOut" 
                },
                rotate: { 
                  times: [0, 0.2, 0.4, 1], 
                  ease: "easeInOut" 
                },
                y: { 
                  times: [0, 0.3, 1], 
                  ease: "easeIn" 
                },
                filter: { 
                  duration: 0.5 
                }
              },
            }}
            whileHover={{
              scale: 1.1,
              y: -5,
              filter: "brightness(1.2)",
              rotate: [0, -5, 5, 0],
              transition: { 
                rotate: { duration: 0.3 } 
              }
            }}
          >
            <Piece piece={piece} className="w-full h-full drop-shadow-md" />
            <ShatterParticles />
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
    animate={{ 
      opacity: color === "yellow" ? [0.7, 1, 0.7] : 1,
      scale: 1 
    }}
    exit={{ opacity: 0, scale: 1.1 }}
    transition={{ 
      duration: color === "yellow" ? 1.5 : 0.2,
      repeat: color === "yellow" ? Infinity : 0,
      ease: "easeInOut" 
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
      scale: [1, 1.2, 1]
    }}
    exit={{ opacity: 0, scale: 0 }}
    transition={{
      scale: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
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
