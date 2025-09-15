import { ChessBoard, GameHeader, MoveHistory, GameStatus } from "../Components";
import { useChess } from "../hooks/useChess";
import { useGame } from "../hooks/useGame";
import { useSocketHandlers } from "../hooks/useSocketHandlers";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Move } from "chess.js";

export function ChessGame() {
  const {
    gameState,
    selectedSquare,
    handleSquareClick,
    syncGameState,
  } = useChess();

  const gameData = useGame();
  const [isWaitingForGame, setIsWaitingForGame] = useState(false);

  // Track last move squares from backend for highlighting
  const [lastMoveSquares, setLastMoveSquares] = useState<string[]>([]);

  // React Query store for valid moves (socket updates this)
  const { data: validMoves = [] } = useQuery<Move[]>({
    queryKey: ["validMoves"],
    enabled: false, 
  });

  // Initialize socket handlers
  useSocketHandlers(
    (fen: string, from?: string, to?: string) => {
      // Sync chess state from backend
      syncGameState(fen);

      // Optionally highlight last move
      if (from && to) {
        setLastMoveSquares([from, to]);
      }
    }
  );

  // Handle waiting state
  useEffect(() => {
    if (!gameData) {
      setIsWaitingForGame(false);
    }
  }, [gameData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1">
            <GameHeader
              gameState={gameState}
              playerColor={gameData?.color || null}
              whiteTimer={gameData?.whiteTimer || 600}
              blackTimer={gameData?.blackTimer || 600}
              isWaitingForGame={isWaitingForGame}
            />
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-3 flex justify-center">
            <div className="w-full max-w-2xl">
              <ChessBoard
                color={gameData?.color}
                gameState={gameState}
                selectedSquare={selectedSquare}
                validMoves={validMoves}
                lastMoveSquares={lastMoveSquares}
                onSquareClick={handleSquareClick}
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-1 space-y-6">
            <GameStatus gameState={gameState} gameData={gameData} />
            <MoveHistory gameState={gameState} />
          </div>
        </div>
      </div>
    </div>
  );
}
