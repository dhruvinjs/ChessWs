
import { useState, useEffect } from "react"
import { Play, UserPlus, Crown } from "lucide-react"
import {HeroChessBoard} from "./HeroChessBoard"

export function Hero (){
  const [animatedStats, setAnimatedStats] = useState({ players: 0, games: 0 })

  useEffect(() => {
    const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const current = Math.floor(start + (end - start) * progress)
        callback(current)
        if (progress < 1) requestAnimationFrame(animate)
      }
      animate()
    }

    setTimeout(() => {
      animateValue(0, 2000000, 2000, (value) => setAnimatedStats((prev) => ({ ...prev, players: value })))
      animateValue(0, 50000, 2500, (value) => setAnimatedStats((prev) => ({ ...prev, games: value })))
    }, 500)
  }, [])

  // Chess pieces for floating animation
  const floatingPieces = ["♛", "♜", "♝", "♞", "♟"]

  return (
    <>
    <section className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-amber-950/20 dark:to-slate-900 overflow-hidden relative transition-colors duration-300">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-300/40 to-orange-400/40 dark:from-amber-700/30 dark:to-orange-800/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-20 -left-32 w-80 h-80 bg-gradient-to-br from-yellow-300/30 to-amber-400/30 dark:from-amber-800/40 dark:to-yellow-800/40 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-orange-300/40 to-red-400/40 dark:from-orange-700/50 dark:to-red-800/50 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Floating chess pieces */}
        {floatingPieces.map((piece, index) => (
          <div
            key={index}
            className="absolute text-4xl text-amber-600/20 dark:text-amber-400/30 animate-bounce select-none"
            style={{
              top: `${20 + index * 15}%`,
              left: `${10 + index * 20}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${3 + index * 0.5}s`,
            }}
          >
            {piece}
          </div>
        ))}

        {/* Geometric accents */}
        <div
          className="absolute top-1/4 left-1/4 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 rotate-45 rounded-lg opacity-60 animate-spin"
          style={{ animationDuration: "8s" }}
        ></div>
        <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-gradient-to-br from-yellow-500 to-amber-500 dark:from-yellow-400 dark:to-amber-400 rotate-12 rounded-full opacity-70 animate-pulse"></div>
        <div
          className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400 rotate-45 opacity-50 animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center min-h-[80vh]">
          {/* Enhanced Left Column */}
          <div className="lg:col-span-6 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full border border-amber-200 dark:border-amber-700/50 backdrop-blur-sm">
              <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                #1 Chess Platform Worldwide
              </span>
            </div>

            {/* Main Heading */}
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

            {/* Enhanced Description */}
            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Join the world's most advanced chess platform. Play against millions,
              <span className="font-semibold text-amber-700 dark:text-amber-400"> learn from grandmasters</span>, and
              dominate the leaderboards with AI-powered insights.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="group relative bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  <Play className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                  Start Playing Free
                </div>
              </button>

              <button className="group border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-400 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-center">
                  <UserPlus className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Watch Live Games
                </div>
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center group cursor-pointer">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                  {animatedStats.players > 0 ? `${(animatedStats.players / 1000000).toFixed(1)}M+` : "2M+"}
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">Active Players</div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                  {animatedStats.games > 0 ? `${Math.floor(animatedStats.games / 1000)}K+` : "50K+"}
                </div>
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

          {/* Enhanced Right Column */}
          <div className="mt-16 lg:mt-0 lg:col-span-6">
            <HeroChessBoard />
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

