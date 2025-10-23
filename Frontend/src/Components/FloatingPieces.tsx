// components/FloatingPieces.tsx
import { motion } from "framer-motion"
import { useMemo } from "react"

export function FloatingPieces() {
  // 🧠 Generate 12–15 random floating pieces *once*
  const pieces = useMemo(() => {
    const symbols = ["♔", "♕", "♖", "♗", "♘", "♙"]
    return Array.from({ length: 15 }, () => ({
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      top: `${Math.random() * 80 + 5}%`,
      left: `${Math.random() * 80 + 5}%`,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      size: `${2 + Math.random() * 2.5}rem`,
    }))
  }, []) // 👈 only generated once, never recomputed

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((piece, i) => (
        <motion.div
          key={i}
          className="absolute text-amber-600/20 dark:text-amber-400/30 select-none"
          style={{
            top: piece.top,
            left: piece.left,
            fontSize: piece.size,
          }}
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: piece.duration,
            repeat: Infinity,
            delay: piece.delay,
            ease: "easeInOut",
          }}
        >
          {piece.symbol}
        </motion.div>
      ))}
    </div>
  )
}
