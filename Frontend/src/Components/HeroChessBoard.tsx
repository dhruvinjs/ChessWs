import { Trophy, Users, Target, Zap } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chess, Square } from "chess.js";
import { Piece } from "./chess/Piece";

interface ChessBoardProps {
  className?: string;
}

export function HeroChessBoard({ className = "" }: ChessBoardProps) {
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null
  );

  // Convert board position to index
  const squareToIndex = (square: string): number => {
    const col = square.charCodeAt(0) - 97; // a-h to 0-7
    const row = 8 - parseInt(square[1]); // 8-1 to 0-7
    return row * 8 + col;
  };

  // Convert index to square notation
  const indexToSquare = (index: number): string => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    return String.fromCharCode(97 + col) + (8 - row);
  };

  // Get all pieces on board from current game state
  const getBoardPieces = (): (string | null)[] => {
    const board = Array(64).fill(null);
    const squares = "abcdefgh".split("");

    for (let rank = 8; rank >= 1; rank--) {
      for (let file = 0; file < 8; file++) {
        const square = (squares[file] + rank) as Square;
        const piece = game.get(square);
        if (piece) {
          const index = squareToIndex(square);
          board[index] = piece.color[0] + piece.type.toUpperCase();
        }
      }
    }
    return board;
  };

  const boardPieces = getBoardPieces();

  const handleSquareClick = useCallback(
    (index: number) => {
      const square = indexToSquare(index);

      // If clicking the same square, deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // If no piece selected, select this square if it has a piece of current player
      if (selectedSquare === null) {
        const moves = game.moves({ square: square as Square, verbose: true });
        if (moves.length > 0) {
          setSelectedSquare(square);
          setValidMoves(moves.map((m) => m.to));
        }
        return;
      }

      // Try to make the move
      const newGame = new Chess(game.fen());
      const result = newGame.move({
        from: selectedSquare,
        to: square,
        promotion: "q", // Auto-promote to queen
      });

      if (result) {
        setGame(newGame);
        setLastMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // If invalid move, try selecting the clicked square instead
        const moves = game.moves({ square: square as Square, verbose: true });
        if (moves.length > 0) {
          setSelectedSquare(square);
          setValidMoves(moves.map((m) => m.to));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    },
    [game, selectedSquare]
  );

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
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Live Game
            </span>
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
            const row = Math.floor(i / 8);
            const col = i % 8;
            const isLight = (row + col) % 2 === 0;
            const square = indexToSquare(i);
            const piece = boardPieces[i];
            const isSelected = selectedSquare === square;
            const isValidMove = validMoves.includes(square);
            const isLastMoveSquare =
              lastMove && (lastMove.from === square || lastMove.to === square);

            return (
              <motion.div
                key={i}
                onClick={() => handleSquareClick(i)}
                className={`aspect-square flex items-center justify-center relative cursor-pointer ${
                  isLight
                    ? "bg-amber-100 dark:bg-amber-200"
                    : "bg-amber-700 dark:bg-amber-800"
                } ${isSelected ? "ring-2 ring-blue-400 ring-inset" : ""} ${
                  isValidMove ? "ring-2 ring-green-400 ring-inset" : ""
                } ${
                  isLastMoveSquare ? "ring-2 ring-yellow-400 ring-inset" : ""
                }`}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: isLight
                    ? "rgb(252 211 77)" // amber-300
                    : "rgb(180 83 9)", // amber-700
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
                        rotate: { duration: 0.6 },
                      }}
                      className="w-full h-full"
                    >
                      <Piece
                        piece={piece}
                        className={isSelected ? "brightness-110" : ""}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Valid move indicator */}
                {isValidMove && !piece && (
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
                {isLastMoveSquare && (
                  <motion.div
                    className="absolute inset-0 bg-yellow-400/20"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Selected square highlight */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-blue-400/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.div>
            );
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
                game.turn() === "w"
                  ? "bg-white"
                  : "bg-slate-800 dark:bg-slate-200"
              }`}
              key={game.turn()}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.5 }}
            />
            <motion.span
              className="text-slate-600 dark:text-slate-300"
              key={`turn-${game.turn()}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {game.turn() === "w" ? "White" : "Black"} to move
            </motion.span>
          </div>
          <motion.div
            className="text-slate-500 dark:text-slate-400"
            key={game.moves().length}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            Move {Math.ceil(game.moves().length / 2)}
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
              key={game.moves().length}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              1,247
            </motion.div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              watching
            </div>
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
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              2:15
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              time left
            </div>
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
  );
}
