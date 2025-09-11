import { useMemo } from "react"
import { Play, UserPlus, Crown } from "lucide-react"
import { HeroChessBoard } from "./HeroChessBoard"
import { Button } from "./Button"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"

export function Hero() {
  
  const players = useMotionValue(0)
  const playersRounded = useTransform(players, (val) =>
    val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M+` : `${Math.floor(val)}`
  )

  // ✅ Games counter
  const games = useMotionValue(0)
  const gamesRounded = useTransform(games, (val) =>
    val >= 1000 ? `${Math.floor(val / 1000)}K+` : `${Math.floor(val)}`
  )

  // Run animations once
  useMemo(() => {
    animate(players, 2_000_000, { duration: 2 }) // 2M players
    animate(games, 50_000, { duration: 2.5 }) // 50K games
  }, [])

  const floatingPieces = ["♛", "♜", "♝", "♞", "♟"]
  const floatingPieceStyles = useMemo(
    () =>
      floatingPieces.map((_, index) => ({
        top: `${20 + index * 15}%`,
        left: `${10 + index * 20}%`,
        animationDelay: `${index * 0.5}s`,
        animationDuration: `${3 + index * 0.5}s`,
      })),
    [floatingPieces]
  )

  return (
    <section className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 overflow-hidden relative transition-colors duration-300">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-300/40 to-orange-400/40 dark:from-amber-600/50 dark:to-orange-700/50 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-20 -left-32 w-80 h-80 bg-gradient-to-br from-yellow-300/30 to-amber-400/30 dark:from-amber-700/60 dark:to-yellow-700/60 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-orange-300/40 to-red-400/40 dark:from-orange-600/70 dark:to-red-700/70 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {floatingPieces.map((piece, index) => (
          <div
            key={piece + index}
            className="absolute text-4xl text-amber-600/20 dark:text-amber-400/40 animate-bounce select-none"
            style={floatingPieceStyles[index]}
          >
            {piece}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center min-h-[80vh]">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full border border-amber-200 dark:border-amber-700/50 backdrop-blur-sm">
              <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                #1 Chess Platform Worldwide
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-slate-900 dark:text-white">Master</span>
                <span className="block bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 dark:from-amber-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent animate-pulse">
                  Chess
                </span>
                <span className="text-slate-800 dark:text-slate-200">Like Never</span>
                <span className="block text-slate-800 dark:text-slate-200">Before</span>
              </h1>
            </div>

            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Join the world's most advanced chess platform. Play against millions,
              <span className="font-semibold text-amber-700 dark:text-amber-400"> learn from grandmasters</span>,
              and dominate the leaderboards with AI-powered insights.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                text="Start Playing Free"
                onClick={() => console.log("Play clicked")}
                icon={<Play className="h-6 w-6" />}
              />
              <Button
                variant="outline"
                size="lg"
                text="Join Room"
                onClick={() => console.log("Join clicked")}
                icon={<UserPlus className="h-6 w-6" />}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center group cursor-pointer">
                <motion.div
                  className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition-transform"
                >
                  {playersRounded}
                </motion.div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">Active Players</div>
              </div>

              <div className="text-center group cursor-pointer">
                <motion.div
                  className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition-transform"
                >
                  {gamesRounded}
                </motion.div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">Daily Games</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                  24/7
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">Live Support</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="mt-16 lg:mt-0 lg:col-span-6">
            <HeroChessBoard />
          </div>
        </div>
      </div>
    </section>
  )
}
