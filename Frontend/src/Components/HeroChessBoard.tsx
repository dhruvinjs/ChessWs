import { Trophy, Users, Target, Zap } from "lucide-react"

interface ChessBoardProps {
  className?: string
}

 export function HeroChessBoard  ({ className = "" }: ChessBoardProps)  {
  // Enhanced piece placement for a more realistic game position
  const getPiece = (index: number) => {
    const pieces: { [key: number]: string } = {
      0: "♜",
      1: "♞",
      2: "♝",
      3: "♛",
      4: "♚",
      5: "♝",
      6: "♞",
      7: "♜",
      8: "♟",
      9: "♟",
      10: "♟",
      11: "♟",
      12: "♟",
      13: "♟",
      14: "♟",
      15: "♟",
      19: "♙",
      28: "♙",
      35: "♙",
      42: "♙",
      48: "♙",
      49: "♙",
      50: "♙",
      51: "♙",
      52: "♙",
      53: "♙",
      54: "♙",
      55: "♙",
      56: "♖",
      57: "♘",
      58: "♗",
      59: "♕",
      60: "♔",
      61: "♗",
      62: "♘",
      63: "♖",
    }
    return pieces[index] || ""
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Chess Board */}
      <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-amber-900/20 p-8 rounded-3xl shadow-2xl backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/30 hover:shadow-3xl transition-all duration-500 group">
        {/* Board Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Live Game</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <Trophy className="w-4 h-4" />
            <span>Grandmaster Level</span>
          </div>
        </div>

        {/* Enhanced Chess Board */}
        <div className="grid grid-cols-8 gap-0.5 aspect-square rounded-xl overflow-hidden shadow-inner">
          {Array.from({ length: 64 }, (_, i) => {
            const row = Math.floor(i / 8)
            const col = i % 8
            const isLight = (row + col) % 2 === 0

            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center text-2xl lg:text-3xl hover:scale-105 transition-all duration-200 cursor-pointer relative ${
                  isLight
                    ? "bg-amber-100 dark:bg-amber-200 hover:bg-amber-200 dark:hover:bg-amber-300"
                    : "bg-amber-700 dark:bg-amber-800 hover:bg-amber-600 dark:hover:bg-amber-700"
                }`}
              >
                <span className="drop-shadow-sm hover:drop-shadow-md transition-all">{getPiece(i)}</span>
                {/* Highlight effect for active squares */}
                {(i === 28 || i === 35) && (
                  <div className="absolute inset-0 bg-yellow-400/30 animate-pulse rounded-sm"></div>
                )}
              </div>
            )
          })}
        </div>

        {/* Game Info Footer */}
        <div className="flex justify-between items-center mt-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-300">White to move</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400">Move 24</div>
        </div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="absolute -top-6 -right-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-700/50 hover:scale-105 transition-transform cursor-pointer">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">1,247</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">watching</div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-700/50 hover:scale-105 transition-transform cursor-pointer">
        <div className="flex items-center space-x-3">
          <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">98%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">accuracy</div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer">
        <Zap className="h-5 w-5" />
      </div>
    </div>
  )
}

