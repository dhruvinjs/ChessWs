import { Trophy, Users, Target, Zap } from "lucide-react"
import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Piece } from "./chess/Piece"

interface ChessBoardProps {
  className?: string
}

interface SquareState {
  piece: string | null
  isSelected: boolean
  isValidMove: boolean
  isLastMove: boolean
}

export function HeroChessBoard({ className = "" }: ChessBoardProps) {
  // Initial chess board setup with proper piece notation for SVGs
  const initialBoard: SquareState[] = Array.from({ length: 64 }, (_, i) => {
    const pieces: { [key: number]: string } = {
      // Black pieces (top row)
      0: "bR", 1: "bN", 2: "bB", 3: "bQ", 4: "bK", 5: "bB", 6: "bN", 7: "bR",
      // Black pawns
      8: "bP", 9: "bP", 10: "bP", 11: "bP", 12: "bP", 13: "bP", 14: "bP", 15: "bP",
      // Some pieces moved for demo (mid-game position)
      19: "wP", 28: "wN", 35: "bP", 42: "wB",
      // White pawns
      48: "wP", 49: "wP", 50: "wP", 51: "wP", 52: "wP", 53: "wP", 54: "wP", 55: "wP",
      // White pieces (bottom row)
      56: "wR", 57: "wN", 58: "wB", 59: "wQ", 60: "wK", 61: "wB", 62: "wN", 63: "wR",
    }
    
    return {
      piece: pieces[i] || null,
      isSelected: false,
      isValidMove: false,
      isLastMove: i === 19 || i === 35 // Highlight last move
    }
  })

  const [board, setBoard] = useState<SquareState[]>(initialBoard)
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null)
  const [moveCount, setMoveCount] = useState(24)
  const [currentPlayer, setCurrentPlayer] = useState<'w' | 'b'>('w')

  // Handle square click
  const handleSquareClick = useCallback((index: number) => {
    setBoard(prevBoard => {
      const newBoard = [...prevBoard]
      
      // Clear previous selections and valid moves
      newBoard.forEach(square => {
        square.isSelected = false
        square.isValidMove = false
      })

      // If clicking on the same square, deselect
      if (selectedSquare === index) {
        setSelectedSquare(null)
        return newBoard
      }

      // If no piece is selected, select this square (if it has a piece of current player)
      if (selectedSquare === null) {
        const piece = newBoard[index].piece
        if (piece && piece[0] === currentPlayer) {
          newBoard[index].isSelected = true
          setSelectedSquare(index)
          
          // Show valid moves (simplified - just empty squares nearby for demo)
          const row = Math.floor(index / 8)
          const col = index % 8
          
          // Demo valid moves (basic logic for demonstration)
          for (let i = 0; i < 64; i++) {
            const targetRow = Math.floor(i / 8)
            const targetCol = i % 8
            const rowDiff = Math.abs(targetRow - row)
            const colDiff = Math.abs(targetCol - col)
            
            // Show some valid moves based on simple rules
            if (!newBoard[i].piece && (rowDiff <= 2 && colDiff <= 2) && (rowDiff + colDiff > 0)) {
              newBoard[i].isValidMove = true
            }
          }
        }
        return newBoard
      }

      // If a piece is already selected, try to move it
      const fromSquare = selectedSquare
      const toSquare = index
      
      // Simple move validation (for demo purposes)
      if (newBoard[toSquare].isValidMove || newBoard[toSquare].piece?.[0] !== currentPlayer) {
        // Clear last move highlights
        newBoard.forEach(square => square.isLastMove = false)
        
        // Make the move
        newBoard[toSquare].piece = newBoard[fromSquare].piece
        newBoard[fromSquare].piece = null
        
        // Highlight the move
        newBoard[fromSquare].isLastMove = true
        newBoard[toSquare].isLastMove = true
        
        // Switch player
        setCurrentPlayer(prev => prev === 'w' ? 'b' : 'w')
        setMoveCount(prev => prev + 1)
      }
      
      setSelectedSquare(null)
      return newBoard
    })
  }, [selectedSquare, currentPlayer])

  const getPiece = (index: number) => {
    return board[index].piece
  }

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Main Chess Board */}
      <motion.div 
        className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-amber-900/20 p-8 rounded-3xl shadow-2xl backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/30 hover:shadow-3xl transition-all duration-500 group"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Board Header */}
        <motion.div 
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-3 h-3 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Live Game</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Trophy className="w-4 h-4" />
            </motion.div>
            <span>Grandmaster Level</span>
          </div>
        </motion.div>

        {/* Interactive Chess Board */}
        <div className="grid grid-cols-8 gap-0.5 aspect-square rounded-xl overflow-hidden shadow-inner">
          {Array.from({ length: 64 }, (_, i) => {
            const row = Math.floor(i / 8)
            const col = i % 8
            const isLight = (row + col) % 2 === 0
            const square = board[i]
            const piece = getPiece(i)

            return (
              <motion.div
                key={i}
                onClick={() => handleSquareClick(i)}
                className={`aspect-square flex items-center justify-center relative cursor-pointer ${
                  isLight
                    ? "bg-amber-100 dark:bg-amber-200"
                    : "bg-amber-700 dark:bg-amber-800"
                } ${
                  square.isSelected ? "ring-2 ring-blue-400 ring-inset" : ""
                } ${
                  square.isValidMove ? "ring-2 ring-green-400 ring-inset" : ""
                } ${
                  square.isLastMove ? "ring-2 ring-yellow-400 ring-inset" : ""
                }`}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: isLight 
                    ? "rgb(252 211 77)" // amber-300
                    : "rgb(180 83 9)"   // amber-700
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ transitionDelay: `${i * 10}ms` }}
              >
                {/* Piece */}
                <AnimatePresence>
                  {piece && (
                    <motion.div
                      key={`${piece}-${i}`}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20,
                        rotate: { duration: 0.6 }
                      }}
                      className="w-full h-full"
                    >
                      <Piece 
                        piece={piece} 
                        className={square.isSelected ? "brightness-110" : ""}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Valid move indicator */}
                {square.isValidMove && !piece && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <motion.div 
                      className="w-3 h-3 bg-green-400/60 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                )}
                
                {/* Last move highlight */}
                {square.isLastMove && (
                  <motion.div 
                    className="absolute inset-0 bg-yellow-400/20"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                
                {/* Selected square highlight */}
                {square.isSelected && (
                  <motion.div 
                    className="absolute inset-0 bg-blue-400/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Game Info Footer */}
        <motion.div 
          className="flex justify-between items-center mt-6 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div 
              className={`w-2 h-2 rounded-full ${
                currentPlayer === 'w' ? 'bg-white' : 'bg-slate-800 dark:bg-slate-200'
              }`}
              key={currentPlayer}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.5 }}
            />
            <motion.span 
              className="text-slate-600 dark:text-slate-300"
              key={`turn-${currentPlayer}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentPlayer === 'w' ? 'White' : 'Black'} to move
            </motion.span>
          </div>
          <motion.div 
            className="text-slate-500 dark:text-slate-400"
            key={moveCount}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            Move {Math.floor(moveCount)}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Enhanced Floating Elements */}
      <motion.div 
        className="absolute -top-6 -right-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-700/50 cursor-pointer"
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </motion.div>
          <div>
            <motion.div 
              className="text-lg font-bold text-slate-900 dark:text-white"
              key={moveCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              1,247
            </motion.div>
            <div className="text-xs text-slate-500 dark:text-slate-400">watching</div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="absolute -bottom-6 -left-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-700/50 cursor-pointer"
        initial={{ opacity: 0, y: 20, x: -20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        whileHover={{ scale: 1.05, y: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">2:15</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">time left</div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="absolute top-1/2 -right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-full shadow-lg cursor-pointer"
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Zap className="h-5 w-5" />
      </motion.div>
    </motion.div>
  )
}

