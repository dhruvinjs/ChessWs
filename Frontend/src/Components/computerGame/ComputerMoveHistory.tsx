import { memo, useMemo } from "react";
import { useComputerGame } from "../../hooks/useComputerGame";

interface MovePairProps {
  moveNumber: number;
  playerMove?: { from: string; to: string; promotion?: string | null };
  computerMove?: { from: string; to: string; promotion?: string | null };
}

const MovePair = memo(({ moveNumber, playerMove, computerMove }: MovePairProps) => (
  <div className="grid grid-cols-[45px_1fr_1fr] gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group">
    {/* Move Number */}
    <span className="text-sm font-bold text-gray-600 dark:text-gray-400 text-right self-center">
      {moveNumber}.
    </span>
    
    {/* Player's Move */}
    <div className="flex items-center justify-center bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg text-center group-hover:bg-green-200 dark:group-hover:bg-green-800/30 transition-colors">
      {playerMove ? (
        <span className="font-mono text-sm font-semibold text-green-700 dark:text-green-300 truncate">
          {playerMove.from}-{playerMove.to}
          {playerMove.promotion && (
            <span className="text-xs ml-1 text-green-500 dark:text-green-400">
              ={playerMove.promotion}
            </span>
          )}
        </span>
      ) : (
        <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
      )}
    </div>
    
    {/* Computer's Move */}
    <div className="flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 px-3 py-2 rounded-lg text-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800/30 transition-colors">
      {computerMove ? (
        <span className="font-mono text-sm font-semibold text-orange-700 dark:text-orange-300 truncate">
          {computerMove.from}-{computerMove.to}
          {computerMove.promotion && (
            <span className="text-xs ml-1 text-orange-500 dark:text-orange-400">
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
  const { gameData } = useComputerGame();
  
  if (!gameData) return null;
  
  const moves = gameData.moves || [];
  const playerColor = gameData.playerColor;

  // Group moves into pairs (Player + Computer)
  const movePairs = useMemo(() => {
    const pairs: MovePairProps[] = [];
    
    // If player is white, moves alternate: player, computer, player, computer...
    // If player is black, moves alternate: computer, player, computer, player...
    
    if (playerColor === "w") {
      // Player is white - player moves first
      for (let i = 0; i < moves.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const playerMove = moves[i];
        const computerMove = moves[i + 1];
        
        pairs.push({
          moveNumber,
          playerMove: playerMove ? {
            from: playerMove.from,
            to: playerMove.to,
            promotion: playerMove.promotion
          } : undefined,
          computerMove: computerMove ? {
            from: computerMove.from,
            to: computerMove.to,
            promotion: computerMove.promotion
          } : undefined
        });
      }
    } else {
      // Player is black - computer moves first
      for (let i = 0; i < moves.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const computerMove = moves[i];
        const playerMove = moves[i + 1];
        
        pairs.push({
          moveNumber,
          playerMove: playerMove ? {
            from: playerMove.from,
            to: playerMove.to,
            promotion: playerMove.promotion
          } : undefined,
          computerMove: computerMove ? {
            from: computerMove.from,
            to: computerMove.to,
            promotion: computerMove.promotion
          } : undefined
        });
      }
    }
    
    return pairs;
  }, [moves, playerColor]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span className="inline-block w-1 h-5 bg-blue-500 rounded"></span>
        Move History
      </h3>

      {/* Column Headers */}
      {moves.length > 0 && (
        <div className="grid grid-cols-[45px_1fr_1fr] gap-2 px-3 pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
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
            {movePairs.map((pair) => (
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
