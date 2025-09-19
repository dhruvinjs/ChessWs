import { Flag } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import { GameMessages } from '../../constants';

export function GameStatus() {
  const {
    gameId,
    color,
    moves,
    turn,
    gameStatus,
  } = useGameStore();

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Game Status
      </h3>
      <div className="space-y-3">
        {gameId && (
          <>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Game ID:</span>
              <span className="font-mono text-xs text-slate-900 dark:text-white">
                {gameId.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Your Color:</span>
              <span className="font-bold text-black dark:text-white">
                {color === 'w' ? 'White' : 'Black'}
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-300">Turn:</span>
          <span className="font-bold text-black dark:text-white">
            {turn === 'w' ? 'White' : 'Black'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-300">Moves Played:</span>
          <span className="font-bold text-black dark:text-white">
            {Math.ceil(moves.length / 2)}
          </span>
        </div>
        {gameStatus === GameMessages.GAME_OVER && (
          <div className="flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Flag className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-300 font-bold">
              Game Over
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
