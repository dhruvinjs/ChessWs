import { Flag } from 'lucide-react';
import { GameState } from '../../types/chess';
import { GamePayload } from '../../types/socket';

interface GameStatusProps {
  gameState: GameState;
  gameData?: GamePayload | null;
}

export function GameStatus ({ gameState, gameData }:GameStatusProps){
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Game Status
      </h3>
      <div className="space-y-3">
        {gameData && (
          <>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Game ID:</span>
              <span className="font-mono text-xs text-slate-900 dark:text-white">
                {gameData.gameId.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Your Color:</span>
              <span className="font-bold text-black dark:text-white">
                {gameData.color === 'w' ? 'White' : 'Black'}
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-300">Turn:</span>
          <span className="font-bold text-black dark:text-white">
            {gameState.turn === 'w' ? 'White' : 'Black'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-300">Moves Played:</span>
          <span className="font-bold text-black dark:text-white">
           {Math.ceil(gameState.moveHistory.length / 2)}
          </span>
        </div>
        {gameState.isGameOver && (
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