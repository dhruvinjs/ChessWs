"use client"

import { useState, useCallback, useMemo } from "react"
import { ArrowLeft, Play, Handshake, Flag } from "lucide-react"
import { motion } from "framer-motion"
import { Timer } from "./Timer"
import { Button } from "../Button"

interface GameHeaderProps {
  playerColor?: "w" | "b" | null
  isWaitingForGame?: boolean
  whiteTimer?: number
  blackTimer?: number
  turn?: "w" | "b"
  gameStatus?: string
  moves?: any[]
  onGoHome?: () => void
  onPlayGame?: () => void
  onOfferDraw?: () => void
  onResign?: () => void
}

export function GameHeader({
  playerColor,
  isWaitingForGame = false,
  whiteTimer = 600,
  blackTimer = 600,
  turn = "w",
  gameStatus = "",
  moves = [],
  onGoHome,
  onPlayGame,
  onOfferDraw,
  onResign,
}: GameHeaderProps) {
  const [showHomeConfirm, setShowHomeConfirm] = useState(false)
  const [showDrawConfirm, setShowDrawConfirm] = useState(false)
  const [showResignConfirm, setShowResignConfirm] = useState(false)

  const handleGoHome = useCallback(() => {
    if (moves.length > 0) setShowHomeConfirm(true)
    else onGoHome?.()
  }, [moves.length, onGoHome])

  const confirmGoHome = useCallback(() => {
    setShowHomeConfirm(false)
    onGoHome?.()
  }, [onGoHome])

  const handleOfferDraw = useCallback(() => setShowDrawConfirm(true), [])
  const confirmDraw = useCallback(() => setShowDrawConfirm(false), [])

  const handleResign = useCallback(() => setShowResignConfirm(true), [])
  const confirmResign = useCallback(() => {
    setShowResignConfirm(false)
    onResign?.()
  }, [onResign])

  const isGameOver = useMemo(() => gameStatus === "GAME_OVER", [gameStatus])
  const turnText = useMemo(
    () => (isGameOver ? "Game Over" : `${turn === "w" ? "White" : "Black"}'s Turn`),
    [isGameOver, turn],
  )

  const timerColors = useMemo(
    () => ({
      white: { bg: "bg-white dark:bg-slate-700", fill: "bg-sky-500" },
      black: { bg: "bg-slate-100 dark:bg-slate-600", fill: "bg-slate-800" },
    }),
    [],
  )

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Player Info */}
      {playerColor && (
        <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="bg-gradient-to-r from-sky-100 via-cyan-50 to-sky-100 dark:from-slate-700 dark:via-slate-800 dark:to-cyan-900/30 rounded-xl shadow-md p-5 flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ring-2 ${
                playerColor === "w" ? "bg-white ring-slate-300" : "bg-slate-800 ring-slate-600"
              }`}
            >
              <span className={`font-bold ${playerColor === "w" ? "text-slate-800" : "text-white"}`}>
                {playerColor === "w" ? "W" : "B"}
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">You are playing as</h3>
              <p className="text-lg font-extrabold text-sky-700 dark:text-sky-400">
                {playerColor === "w" ? "White" : "Black"}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timers */}
      <motion.div
        className="mb-6 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Timer time={whiteTimer} maxTime={600} label="White" colors={timerColors.white} />
        <Timer time={blackTimer} maxTime={600} label="Black" colors={timerColors.black} />
      </motion.div>

      {/* Game Status */}
      <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Game Status</h2>
        <div className="flex items-center space-x-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${turn === "w" ? "bg-white border-2 border-slate-400" : "bg-slate-800"}`}
          />
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{turnText}</p>
        </div>
        {isWaitingForGame && (
          <p className="text-sky-600 dark:text-sky-400 font-semibold text-sm animate-pulse">
            Searching for opponent...
          </p>
        )}
      </motion.div>

      {/* Controls */}
     {/* Controls */}
<motion.div
  className="grid grid-cols-2 gap-3"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.4 }}
>
  <Button
    variant="secondary"
    size="md"
    onClick={handleGoHome}
    text="Home"
    icon={<ArrowLeft className="w-4 h-4" />}
  />

  <Button
    variant="primary"
    size="md"
    onClick={onPlayGame ?? (() => {})}
    text={isWaitingForGame ? "Searching..." : "Play"}
    icon={<Play className="w-4 h-4" />}
    loading={isWaitingForGame}
  />

  <Button
    variant="outline"
    size="md"
    onClick={handleOfferDraw}
    text="Draw"
    icon={<Handshake className="w-4 h-4" />}
  />

  <Button
    variant="primary"
    size="md"
    onClick={handleResign}
    text="Resign"
    icon={<Flag className="w-4 h-4" />}
  />
</motion.div>


      {/* Simple Confirmation Modals */}
      {showHomeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2">Leave Game?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Your progress will be lost.</p>
            <div className="flex space-x-2">
              <button onClick={confirmGoHome} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Leave
              </button>
              <button
                onClick={() => setShowHomeConfirm(false)}
                className="px-4 py-2 bg-slate-300 rounded hover:bg-slate-400"
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
