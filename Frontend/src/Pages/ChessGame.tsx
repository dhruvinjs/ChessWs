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
    lastMoveSquares,
  } = useChess();

  const gameData = useGame();
  const [isWaitingForGame, setIsWaitingForGame] = useState(false);

  const { data: validMoves = [] } = useQuery<Move[]>({ // This query is manually updated
    queryKey: ["validMoves"],
    enabled: false,
  });

  useSocketHandlers(syncGameState);

  useEffect(() => {
    // If gameData is null, it means we are not in a game or waiting for one.
    if (!gameData) {
      setIsWaitingForGame(false);
    }
  }, [gameData]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-4 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <GameHeader
              gameState={gameState}
              playerColor={gameData?.color || null}
              whiteTimer={gameData?.whiteTimer || 600}
              blackTimer={gameData?.blackTimer || 600}
              isWaitingForGame={isWaitingForGame}
            />
          </div>

          <div className="lg:col-span-3 flex justify-center">
            <div className="w-full max-w-2xl">
              <ChessBoard
                color={gameData?.color}
                selectedSquare={selectedSquare}
                validMoves={validMoves}
                onSquareClick={handleSquareClick}
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <GameStatus gameState={gameState} gameData={gameData} />
            <MoveHistory gameState={gameState} />
          </div>
        </div>
      </div>
    </div>
  );
}
