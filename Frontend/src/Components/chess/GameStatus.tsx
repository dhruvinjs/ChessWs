import { Flag } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import { GameMessages } from '../../types/chess';
import { memo } from 'react';

const GameStatusComponent = () => {
  // ✅ Only subscribe to what we need - NOT timers!
  const color = useGameStore((state) => state.color);
  const moves = useGameStore((state) => state.moves);
  const fen = useGameStore((state) => state.fen);
  const gameStatus = useGameStore((state) => state.gameStatus);
  
  const turn = fen.split(' ')[1] as 'w' | 'b';

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-lg">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="inline-block w-1.5 h-5 bg-indigo-500 rounded"></span>
        Game Status
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-300">Your Color:</span>
          <span
            className={`font-bold ${
              color === 'w'
                ? 'text-indigo-700 dark:text-indigo-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}
          >
            {color === 'w' ? 'White' : 'Black'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-300">Turn:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {turn === 'w' ? 'White' : 'Black'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-300">Moves Played:</span>
          <span className="font-bold text-slate-900 dark:text-white">
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
};

// ✅ Export memoized version
export const GameStatus = memo(GameStatusComponent);