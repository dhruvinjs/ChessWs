import { memo, useMemo } from "react";
import { useComputerGameStore } from "../../stores/useComputerGameStore";
import { ComputerMove } from "../../lib/ComputerSocketManager";

interface MovePairProps {
  moveNumber: number;
  playerMove?: { from: string; to: string; promotion?: string | null };
  computerMove?: { from: string; to: string; promotion?: string | null };
}

// 🎯 IMPROVEMENT: Adjusted grid and removed MovePair padding to shift numbering left
const MovePair = memo(({ moveNumber, playerMove, computerMove }: MovePairProps) => (
  // 1. Changed first column to a fixed 30px width for better positioning on the far left.
  // 2. Removed `px-3` from this div to allow the number to sit closer to the edge.
  <div className="grid grid-cols-[30px_1fr_1fr] gap-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group">
    {/* Move Number */}
    <span className="text-sm font-bold text-gray-600 dark:text-gray-400 text-right self-center">
      {moveNumber}.
    </span>

    {/* Player's Move */}
    <div className="flex items-center justify-center bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg text-center group-hover:bg-green-200 dark:group-hover:bg-green-800/30 transition-colors min-w-0">
      {playerMove ? (
        <span className="font-mono text-sm font-semibold text-green-700 dark:text-green-300 break-all">
          {playerMove.from}-{playerMove.to}
          {playerMove.promotion && (
            <span className="text-xs ml-1 text-green-500 dark:text-green-400 whitespace-nowrap">
              ={playerMove.promotion}
            </span>
          )}
        </span>
      ) : (
        <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
      )}
    </div>

    {/* Computer's Move */}
    <div className="flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-lg text-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800/30 transition-colors min-w-0">
      {computerMove ? (
        <span className="font-mono text-sm font-semibold text-orange-700 dark:text-orange-300 break-all">
          {computerMove.from}-{computerMove.to}
          {computerMove.promotion && (
            <span className="text-xs ml-1 text-orange-500 dark:text-orange-400 whitespace-nowrap">
              ={computerMove.promotion}
            </span>
          )}
        </span>
      ) : (
        <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
      )}
    </div>
  </div>
));

MovePair.displayName = "MovePair";

const ComputerMoveHistoryComponent = () => {
  const gameData = useComputerGameStore((state) => state.gameData);

  if (!gameData) return null;

  const moves: ComputerMove[] = gameData.moves || [];
  const playerColor = gameData.playerColor;

  const simplifiedPairs: MovePairProps[] = useMemo(() => {
    const pairs: MovePairProps[] = [];

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const moveIndex = Math.floor(i / 2);
      const moveNumber = moveIndex + 1;

      if (!pairs[moveIndex]) {
        pairs[moveIndex] = { moveNumber };
      }

      const formattedMove = {
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      };

      const isPlayerTurn = (playerColor === 'w' && i % 2 === 0) || (playerColor === 'b' && i % 2 !== 0);
      
      if (isPlayerTurn) {
        pairs[moveIndex].playerMove = formattedMove;
      } else {
        pairs[moveIndex].computerMove = formattedMove;
      }
    }

    return pairs;
  }, [moves, playerColor]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span className="inline-block w-1 h-5 bg-blue-500 rounded"></span>
        Move History ♟️
      </h3>

      {/* Column Headers */}
      {moves.length > 0 && (
        // 🎯 IMPROVEMENT: Applied the same 30px grid and removed horizontal padding (`px-3` -> no px)
        <div className="grid grid-cols-[30px_1fr_1fr] gap-2 pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 text-right">
            #
          </span>
          <span className="text-xs uppercase tracking-wider font-bold text-green-600 dark:text-green-400 text-center">
            You
          </span>
          <span className="text-xs uppercase tracking-wider font-bold text-orange-600 dark:text-orange-400 text-center">
            Computer
          </span>
        </div>
      )}

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
        {moves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-3xl">♟</span>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No moves yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Make a move to start
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {simplifiedPairs.map((pair) => (
              <MovePair
                key={`move-${pair.moveNumber}`}
                moveNumber={pair.moveNumber}
                playerMove={pair.playerMove}
                computerMove={pair.computerMove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ComputerMoveHistory = memo(ComputerMoveHistoryComponent);
ComputerMoveHistory.displayName = "ComputerMoveHistory";