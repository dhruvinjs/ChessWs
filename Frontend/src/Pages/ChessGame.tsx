import { GameHeader, GameStatus, MoveHistory, ChessBoard } from "../Components";
import { GameMessages } from "../constants";
import { useGameStore } from "../stores/useGameStore";
// import { useGameStore } from "../stores/useGameStore";
export function ChessGame() {
  // const {
  //   gameStatus,
  //   color,
  //   fen,
  //   moves,
  //   turn,
  //   whiteTimer,
  //   blackTimer,
  //   winner,
  //   loser,
  //   oppConnected,
  //   validMoves,
  // } = useGameStore();
const { color, gameStatus } = useGameStore();
  const isWaitingForGame=gameStatus === GameMessages.GAME_ACTIVE ? true : false
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-4 transition-colors duration-300">
     <div className="dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
    
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          <div className="lg:col-span-1">
            <GameHeader playerColor={color} isWaitingForGame={isWaitingForGame} />
          </div>

          <div className="lg:col-span-3 flex justify-center">
            <div className="w-full max-w-2xl">
              <ChessBoard/>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <GameStatus/>
            <MoveHistory />
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}
