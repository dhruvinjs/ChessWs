import { motion } from "framer-motion";
import { useMemo } from "react";

interface ChessOrb {
  id: number;
  piece: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
  blur: number;
}

export const AnimatedChessPieces = () => {
  const chessPieces = ["♔", "♕", "♖", "♗", "♘", "♙", "♚", "♛", "♜", "♝", "♞", "♟"];
  const colors = [
    "text-indigo-500",
    "text-amber-500",
    "text-slate-500",
    "text-indigo-400",
    "text-amber-400",
    "text-slate-400",
  ];

  const orbs: ChessOrb[] = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        piece: chessPieces[Math.floor(Math.random() * chessPieces.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 80 + 60,
        duration: Math.random() * 25 + 20,
        delay: Math.random() * 8,
        opacity: Math.random() * 0.2 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        blur: Math.random() * 2 + 1,
      })),
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute ${orb.color} drop-shadow-2xl`}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            fontSize: `${orb.size}px`,
            opacity: orb.opacity,
            filter: `blur(${orb.blur}px)`,
          }}
          animate={{
            x: [0, Math.random() * 150 - 75, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 150 - 75, Math.random() * 100 - 50, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        >
          {orb.piece}
        </motion.div>
      ))}
    </div>
  );
};