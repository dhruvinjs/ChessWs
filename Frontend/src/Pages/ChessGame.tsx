import { GameHeader, GameStatus, MoveHistory, ChessBoard } from "../Components";
import { GameMessages } from "../constants";
import { useGameStore } from "../stores/useGameStore";
import { useSocketHandlers } from "../hooks/useSocketHandlers";

export function ChessGame() {
  // Activate the socket message handlers
  useSocketHandlers();

  const { color, gameStatus } = useGameStore();
  // Only show the "Searching..." message when the game status is "searching"
  const isWaitingForGame = gameStatus === GameMessages.SEARCHING;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-4 transition-colors duration-300">
      <div className="dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1">
              <GameHeader playerColor={color} isWaitingForGame={isWaitingForGame} />
            </div>

            <div className="lg:col-span-3 flex justify-center items-center">
              <div className="w-full max-w-2xl">
                {isWaitingForGame ? (
                  <div className="flex items-center justify-center min-h-[400px] text-center text-xl font-semibold text-gray-500 dark:text-gray-400">
                    <p>Searching for an opponent...</p>
                  </div>
                ) : (
                  <ChessBoard />
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <GameStatus />
              <MoveHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
