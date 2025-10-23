import { useMemo } from "react"
import { Play, UserPlus, Crown } from "lucide-react"
import { HeroChessBoard } from "./HeroChessBoard"
import { Button } from "./Button"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useGuestGamesTotalQuery } from "../hooks/useGame"
import { FloatingPieces } from "./FloatingPieces"
import { useUserQuery } from "../hooks/useUserQuery"
import { LoadingScreen } from "./LoadingScreen"

export function Hero() {
  const players = useMotionValue(0)

    const { data: user, isLoading:isUserLoading } = useUserQuery();
  
  const playersRounded = useTransform(players, (val) =>
    val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M+` : `${Math.floor(val)}`
  )

  // ✅ Games counter (animated number)
  const games = useMotionValue(0)

  // ✅ Fetch total guest games
  const { isLoading, data: totalGames } = useGuestGamesTotalQuery()

  // Run animations once
  useMemo(() => {
    animate(players, 2_000_000, { duration: 2 }) // 2M players
    animate(games, 50_000, { duration: 2.5 }) // 50K games
  }, [])

  const nav = useNavigate()
   const handleLogin = () => {
    if (user?.isGuest || !user) {
      nav("/login") // ✅ redirect if not logged in
      return
    }
    nav("/room") // or your join room route
  }

   if (isUserLoading) {
    return <LoadingScreen /> // show a loading state until user info is ready
  }
  return (
    <section className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 overflow-hidden relative transition-colors duration-300">
      {/* Background gradients & floating pieces */}
        <FloatingPieces  />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center min-h-[80vh]">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-8">
            {/* Tagline */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full border border-amber-200 dark:border-amber-700/50 backdrop-blur-sm">
              <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                #1 Chess Platform Worldwide
              </span>
            </div>

            {/* Heading */}
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

            {/* Description */}
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
                text="Quick Match"
                onClick={() => nav("/game")}
                icon={<Play className="h-6 w-6" />}
              />
              <Button
                variant="outline"
                size="lg"
                text="Sign In"
                onClick={handleLogin}
                icon={<UserPlus className="h-6 w-6" />}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center group cursor-pointer">
                <motion.div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                  {playersRounded}
                </motion.div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">Active Players</div>
              </div>

              <div className="text-center group cursor-pointer">
                <motion.div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition-transform">
                  {isLoading ? (
                    "Loading..."
                  ) : totalGames && totalGames > 0 ? (
                    totalGames
                  ) : (
                    "Be the first!"
                  )}
                </motion.div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">
                  {totalGames && totalGames > 0 ? "Guest Games Played" : "to play a game!"}
                </div>
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
