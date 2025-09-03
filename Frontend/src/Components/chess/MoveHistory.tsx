import { GameState } from '../../types/chess';

interface MoveHistoryProps {
  gameState: GameState;
}

export function MoveHistory ({ gameState }:MoveHistoryProps)  {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Move History
      </h3>
      <div className="max-h-64 overflow-y-auto">
        {gameState.moveHistory.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            No moves yet
          </p>
        ) : (
          <div className="space-y-1">
            {gameState.moveHistory.map((move, index) => {
              const moveNumber = Math.floor(index / 2) + 1;
              const color = index % 2 === 0 ? "White" : "Black";

              return (
                <div
                  key={index}
                  className="flex justify-between py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span className="text-slate-600 dark:text-slate-400">
                    {moveNumber}.
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {color}: {move}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
