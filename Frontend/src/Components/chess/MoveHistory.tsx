import { useGameStore } from '../../stores/useGameStore';

export function MoveHistory() {
  const { moves } = useGameStore();

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Move History
      </h3>
      <div className="max-h-64 overflow-y-auto">
        {moves.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            No moves yet
          </p>
        ) : (
          <div className="space-y-1">
            {moves.map((move, index) => {
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
                    {color}: {move.from} → {move.to} {move.promotion ? `(Promote: ${move.promotion})` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
