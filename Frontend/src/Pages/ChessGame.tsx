import { ChessBoard, GameHeader, GameStatus, MoveHistory } from '../Components';
import { useChess } from '../hooks/useChess';

export function ChessGame() {
  const {
    gameState,
    selectedSquare,
    validMoves,
    lastMoveSquares,
    handleSquareClick,
    resetGame
  } = useChess();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <GameHeader 
          gameState={gameState} 
          onResetGame={resetGame} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
            <GameStatus gameState={gameState} />
            <MoveHistory gameState={gameState} />
          </div>
        </div>
      </div>
    </div>
  );
}

