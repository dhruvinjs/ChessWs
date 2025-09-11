import { ChessBoard,GameHeader,MoveHistory,GameStatus } from "../Components"
import { useChess } from '../hooks/useChess';
import { useGame } from '../hooks/useGame';
import { useSocketHandlers } from '../hooks/useSocketHandlers';
import { useState, useEffect } from 'react';

export function ChessGame() {
  const {
    gameState,
    selectedSquare,
    validMoves,
    lastMoveSquares,
    handleSquareClick,
    
  } = useChess();

  const { data: gameData } = useGame();
  const [isWaitingForGame, setIsWaitingForGame] = useState(false);
  
  // Initialize socket handlers
  useSocketHandlers();

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
          {/* Left Side Control Panel */}
          <div className="lg:col-span-1">
            <GameHeader 
              gameId={gameData?.gameId}
              gameState={gameState} 
              playerColor={gameData?.color || null}
              whiteTimer={gameData?.whiteTimer || 600}
              blackTimer={gameData?.blackTimer || 600}
              isWaitingForGame={isWaitingForGame}
            />
          </div>
          
          {/* Chess Board - Takes up most space */}
          <div className="lg:col-span-3 flex justify-center">
            <div className="w-full max-w-2xl">
              <ChessBoard
                gameState={gameState}
                selectedSquare={selectedSquare}
                validMoves={validMoves}
                lastMoveSquares={lastMoveSquares}
                onSquareClick={handleSquareClick}
              />
            </div>
          </div>
          
          {/* Side Panel */}
          <div className="lg:col-span-1 space-y-6">
            <GameStatus 
              gameState={gameState} 
              gameData={gameData}
            />
            <MoveHistory gameState={gameState} />
          </div>
        </div>
      </div>
    </div>
  );
}