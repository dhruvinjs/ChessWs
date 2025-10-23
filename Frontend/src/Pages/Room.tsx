"use client"

import { useState, useEffect } from "react"
import { Button } from "../Components"
import { motion } from "framer-motion"
import { useThemeStore } from "../stores/useThemeStore"
import { FloatingPieces } from "../Components/FloatingPieces"

export function Room() {
  const [roomCode, setRoomCode] = useState("")
  const [mode, setMode] = useState<"join" | "host">("join")

  const { initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  const handleJoinRoom = () => {
    if (roomCode.trim()) console.log("Joining room:", roomCode)
  }

  const handleHostRoom = () => {
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(newRoomCode)
    console.log("Hosting room:", newRoomCode)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 flex justify-center items-start pt-32 px-4 transition-colors duration-300 relative overflow-hidden">
      {/* Floating Pieces */}
        <FloatingPieces  />


      {/* Room Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-amber-200/50 dark:border-amber-800/50 p-10 space-y-6">
          {/* Header */}
          <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Chess Room
          </h1>

          <p className="text-center text-slate-700 dark:text-slate-300">
            Join an existing room or host a new game
          </p>

          {/* Join/Host Toggle */}
          <div className="flex gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Button
              size="sm"
              variant={mode === "join" ? "outline" : "secondary"}
              text="Join Room"
              className="flex-1"
              onClick={() => setMode("join")}
            />
            <Button
              size="sm"
              variant={mode === "host" ? "outline" : "secondary"}
              text="Host Room"
              className="flex-1"
              onClick={() => setMode("host")}
            />
          </div>

          {/* Join / Host Form */}
          <div className="space-y-5">
            {mode === "join" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-center text-lg font-mono tracking-wider focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Enter room code"
                    maxLength={6}
                  />
                </div>
                <Button size="lg" variant="primary" text="Join Room" className="w-full" onClick={handleJoinRoom} />
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Room Code
                  </label>
                  <div className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-300 dark:border-amber-700 rounded-xl text-center text-lg font-mono tracking-wider text-amber-800 dark:text-amber-200">
                    {roomCode || "Click to generate"}
                  </div>
                </div>
                <Button size="lg" variant="primary" text="Host New Room" className="w-full" onClick={handleHostRoom} />
                {roomCode && (
                  <p className="text-sm text-center text-slate-600 dark:text-slate-400 mt-2">
                    Share this code with your opponent
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
