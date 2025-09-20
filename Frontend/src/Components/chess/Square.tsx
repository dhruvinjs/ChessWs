"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { SquareProps } from "../../types/chess"
import { Piece } from "./Piece"

export const Square = React.memo(
  ({ piece, isLight, isSelected, isValidMove, isLastMove, onClick }: SquareProps) => {
    const baseClasses = "aspect-square flex items-center justify-center cursor-pointer relative overflow-hidden"
    const colorClasses = isLight ? "bg-amber-100 dark:bg-amber-200/80" : "bg-amber-700 dark:bg-amber-800/80"

    return (
      <motion.div
        className={`${baseClasses} ${colorClasses}`}
        onClick={onClick}
        whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
        whileTap={{ scale: 0.98 }}
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Selection / Valid / Last Move rings */}
        <AnimatePresence>
          {isSelected && <HighlightRing color="blue" />}
          {isValidMove && <HighlightRing color="green" />}
          {isLastMove && <HighlightRing color="yellow" />}
        </AnimatePresence>

        {/* Piece */}
        <AnimatePresence mode="wait">
          {piece && (
            <motion.div
              className="w-4/5 h-4/5 drop-shadow-md"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.1, rotate: 2 }}
              layout
            >
              <Piece piece={piece} className="w-full h-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Valid move indicators */}
        <AnimatePresence>
          {isValidMove && !piece && <ValidMoveDot />}
          {isValidMove && piece && <ValidMoveBorder />}
        </AnimatePresence>
      </motion.div>
    )
  },
  (prev, next) =>
    prev.piece === next.piece &&
    prev.isLight === next.isLight &&
    prev.isSelected === next.isSelected &&
    prev.isValidMove === next.isValidMove &&
    prev.isLastMove === next.isLastMove
)

Square.displayName = "Square"

// Helper subcomponents
const ringColors: Record<string, string> = {
  blue: "ring-blue-500",
  green: "ring-green-500",
  yellow: "ring-yellow-500",
}

const HighlightRing = ({ color }: { color: "blue" | "green" | "yellow" }) => (
  <motion.div
    className={`absolute inset-0 ring-4 ring-inset rounded-sm ${ringColors[color]}`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.2 }}
  />
)

const ValidMoveDot = () => (
  <motion.div
    className="w-4 h-4 bg-green-500 rounded-full shadow-lg"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.7, scale: 1 }}
    exit={{ opacity: 0, scale: 0 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  />
)

const ValidMoveBorder = () => (
  <motion.div
    className="absolute inset-0 border-2 border-green-500 rounded-full"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 0.7, scale: 1 }}
    exit={{ opacity: 0, scale: 0.5 }}
    transition={{ duration: 0.2 }}
  />
)
