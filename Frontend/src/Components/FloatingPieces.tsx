// components/FloatingPieces.tsx
import { motion } from "framer-motion"
import { useMemo } from "react"

export function FloatingPieces() {
  // 🧠 Generate floating pieces with more variety and better distribution
  const pieces = useMemo(() => {
    const symbols = ["♔", "♕", "♖", "♗", "♘", "♙", "♚", "♛", "♜", "♝", "♞", "♟"]
    const colors = [
      "text-amber-600/15 dark:text-amber-400/25",
      "text-orange-500/12 dark:text-orange-300/20", 
      "text-yellow-600/10 dark:text-yellow-400/18",
      "text-amber-700/8 dark:text-amber-200/15",
      "text-orange-600/6 dark:text-orange-400/12"
    ]
    
    return Array.from({ length: 12 }, () => ({
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      top: `${Math.random() * 85 + 5}%`,
      left: `${Math.random() * 90 + 5}%`,
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 3,
      size: `${1.5 + Math.random() * 2}rem`,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      // Different animation patterns
      pattern: ['float', 'drift', 'sway'][Math.floor(Math.random() * 3)]
    }))
  }, [])

  const getAnimation = (pattern: string) => {
    switch (pattern) {
      case 'drift':
        return {
          x: [0, 20, -10, 0],
          y: [0, -20, -5, 0],
          rotate: [0, 10, -5, 0]
        }
      case 'sway':
        return {
          x: [0, -15, 15, 0],
          y: [0, -8, -12, 0],
          rotate: [0, -8, 8, 0]
        }
      default: // float
        return {
          y: [0, -25, 0],
          x: [0, 5, -5, 0],
          rotate: [0, 5, -5, 0]
        }
    }
  }

  return (
    <>
      {/* Main floating pieces */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {pieces.map((piece, i) => (
          <motion.div
            key={i}
            className={`absolute select-none ${piece.color} drop-shadow-sm`}
            style={{
              top: piece.top,
              left: piece.left,
              fontSize: piece.size,
            }}
            initial={{ 
              opacity: 0, 
              scale: 0.5,
              rotate: piece.rotation 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              ...getAnimation(piece.pattern)
            }}
            transition={{
              opacity: { duration: 1, delay: piece.delay * 0.5 },
              scale: { duration: 0.8, delay: piece.delay * 0.5 },
              y: {
                duration: piece.duration,
                repeat: Infinity,
                delay: piece.delay,
                ease: "easeInOut",
              },
              x: {
                duration: piece.duration * 1.2,
                repeat: Infinity,
                delay: piece.delay + 0.5,
                ease: "easeInOut",
              },
              rotate: {
                duration: piece.duration * 1.5,
                repeat: Infinity,
                delay: piece.delay + 1,
                ease: "easeInOut",
              }
            }}
          >
            {piece.symbol}
          </motion.div>
        ))}
      </div>

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-50/5 to-orange-50/10 dark:from-transparent dark:via-amber-900/5 dark:to-orange-900/10 pointer-events-none" />
      
      {/* Corner accent pieces */}
      <motion.div
        className="absolute top-8 right-8 text-6xl text-amber-600/8 dark:text-amber-400/12 select-none"
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        ♔
      </motion.div>
      
      <motion.div
        className="absolute bottom-8 left-8 text-5xl text-orange-500/8 dark:text-orange-300/12 select-none"
        animate={{ 
          rotate: [360, 0],
          y: [0, -10, 0]
        }}
        transition={{ 
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        ♛
      </motion.div>
    </>
  )
}
