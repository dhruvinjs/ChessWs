import { GameHeader, GameStatus, MoveHistory, ChessBoard } from "../Components";
import { GameMessages } from "../constants";
import { useGameStore } from "../stores/useGameStore";

export function ChessGame() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const isGameActive =
    gameStatus !== GameMessages.SEARCHING && gameStatus !== GameMessages.GAME_OVER;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col">
      <div className="w-full max-w-5xl mx-auto flex-grow flex flex-col gap-6">

        {/* Game Header */}
        <div className="bg-slate-800/50 p-4 rounded-2xl shadow-lg w-full">
          <GameHeader />
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6 w-full">

          {/* Chessboard */}
          <div className="order-1 md:order-1 flex justify-center items-center w-full md:w-2/3">
            <div className="w-full aspect-square max-w-full">
              {gameStatus === GameMessages.SEARCHING ? (
                <div className="flex items-center justify-center h-full text-center text-xl font-semibold text-slate-400 bg-slate-800/50 rounded-2xl">
                  <p>Searching for an opponent...</p>
                </div>
              ) : (
                <ChessBoard />
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="order-2 md:order-2 flex flex-col gap-4 w-full md:w-1/3">
            <GameStatus />
            {isGameActive && <MoveHistory />}
          </div>

        </div>
      </div>
    </div>
  );
}
