import { memo, useMemo, useCallback } from "react";
import { useGameStore } from "../../stores/useGameStore";
import { motion } from "framer-motion";

interface MovePairProps {
  moveNumber: number;
  whiteMove?: { from: string; to: string; promotion?: string | null };
  blackMove?: { from: string; to: string; promotion?: string | null };
}

const MovePair = memo(({ moveNumber, whiteMove, blackMove }: MovePairProps) => (
  <div className="grid grid-cols-[45px_1fr_1fr] sm:grid-cols-[50px_1fr_1fr] gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 group">
    {/* Move Number */}
    <span className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-400 text-center self-center">
      {moveNumber}.
    </span>

    {/* White's Move */}
    <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
      {whiteMove ? (
        <span className="font-mono text-sm sm:text-base font-semibold text-indigo-700 dark:text-indigo-300 truncate">
          {whiteMove.from}-{whiteMove.to}
          {whiteMove.promotion && (
            <span className="text-xs sm:text-sm ml-1 text-indigo-500 dark:text-indigo-400">
              ={whiteMove.promotion}
            </span>
          )}
        </span>
      ) : (
        <span className="text-sm text-slate-300 dark:text-slate-600">—</span>
      )}
    </div>

    {/* Black's Move */}
    <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
      {blackMove ? (
        <span className="font-mono text-sm sm:text-base font-semibold text-amber-700 dark:text-amber-300 truncate">
          {blackMove.from}-{blackMove.to}
          {blackMove.promotion && (
            <span className="text-xs sm:text-sm ml-1 text-amber-500 dark:text-amber-400">
              ={blackMove.promotion}
            </span>
          )}
        </span>
      ) : (
        <span className="text-sm text-slate-300 dark:text-slate-600">—</span>
      )}
    </div>
  </div>
));

MovePair.displayName = "MovePair";

// Piece SVG Component - memoized to prevent re-creation
const PieceSVG = memo(({ piece }: { piece: string }) => {
  const svgPath = `/pieces/${piece}.svg`;
  return (
    <div className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0">
      <img
        src={svgPath}
        alt={`Chess piece ${piece}`}
        className="w-full h-full object-contain pointer-events-none select-none"
        title={`Captured ${piece}`}
      />
    </div>
  );
});
PieceSVG.displayName = "PieceSVG";

// Captured Pieces Component
const CapturedPieces = memo(() => {
  const capturedPieces = useGameStore((state) => state.capturedPieces);

  // Group pieces by type and count them
  const groupPieces = (pieces: string[]) => {
    const grouped = pieces.reduce((acc, piece) => {
      acc[piece] = (acc[piece] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([piece, count]) => ({ piece, count }));
  };

  // Separate captured pieces by color
  const capturedByWhite = groupPieces(
    capturedPieces.filter((piece) => piece.startsWith("b"))
  ); // Black pieces captured by white
  const capturedByBlack = groupPieces(
    capturedPieces.filter((piece) => piece.startsWith("w"))
  ); // White pieces captured by black

  if (capturedPieces.length === 0) return null;

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
      <h4 className="text-xs sm:text-sm uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-3">
        Captured Pieces
      </h4>
      <div className="space-y-3 sm:space-y-4">
        {/* White's Captured Pieces */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">
              W
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {capturedByWhite.length > 0 ? (
              capturedByWhite.map(({ piece, count }, index) => (
                <div
                  key={`white-${index}`}
                  className="relative flex items-center gap-1 bg-white dark:bg-slate-700 p-2 rounded-lg shadow-md border border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-shadow"
                >
                  <PieceSVG piece={piece} />
                  {count > 1 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                      <span className="text-[9px] sm:text-[10px] font-black leading-none px-1">
                        {count}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 italic">
                None captured
              </span>
            )}
          </div>
        </div>

        {/* Black's Captured Pieces */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300">
              B
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {capturedByBlack.length > 0 ? (
              capturedByBlack.map(({ piece, count }, index) => (
                <div
                  key={`black-${index}`}
                  className="relative flex items-center gap-1 bg-white dark:bg-slate-700 p-2 rounded-lg shadow-md border border-amber-200 dark:border-amber-700 hover:shadow-lg transition-shadow"
                >
                  <PieceSVG piece={piece} />
                  {count > 1 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800">
                      <span className="text-[9px] sm:text-[10px] font-black leading-none px-1">
                        {count}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 italic">
                None captured
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CapturedPieces.displayName = "CapturedPieces";

const MoveHistoryComponent = () => {
  // Subscribe to moves for reactivity
  const moves = useGameStore((state) => state.moves);

  // Group moves into pairs (White + Black)
  const movePairs = useMemo(() => {
    const pairs: MovePairProps[] = [];

    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];

      pairs.push({
        moveNumber,
        whiteMove: whiteMove
          ? {
              from: whiteMove.from,
              to: whiteMove.to,
              promotion: whiteMove.promotion,
            }
          : undefined,
        blackMove: blackMove
          ? {
              from: blackMove.from,
              to: blackMove.to,
              promotion: blackMove.promotion,
            }
          : undefined,
      });
    }

    return pairs;
  }, [moves]);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl flex flex-col w-full h-full">
      <h3 className="w-full flex items-center justify-center gap-3 text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white mb-3 sm:mb-4">
        Moves
      </h3>

      {/* Captured Pieces Section */}
      <CapturedPieces />

      {/* Column Headers */}
      {moves.length > 0 && (
        <div className="grid grid-cols-[45px_1fr_1fr] sm:grid-cols-[50px_1fr_1fr] gap-2 sm:gap-3 px-3 sm:px-4 pb-3 mb-3 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xs sm:text-sm uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 text-center">
            #
          </span>
          <span className="text-xs sm:text-sm uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 text-center">
            White
          </span>
          <span className="text-xs sm:text-sm uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400 text-center">
            Black
          </span>
        </div>
      )}

      <div className="flex-grow overflow-y-auto pr-2 w-full custom-scrollbar max-h-[350px] sm:max-h-[400px]">
        {moves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">♟</span>
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400">
              No moves yet
            </p>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">
              Start playing to see moves here
            </p>
          </div>
        ) : (
          <div className="space-y-1 sm:space-y-2 w-full">
            {movePairs.map((pair) => (
              <MovePair
                key={`move-${pair.moveNumber}`}
                moveNumber={pair.moveNumber}
                whiteMove={pair.whiteMove}
                blackMove={pair.blackMove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Proper memoization - only re-render when component actually needs to update
export const MoveHistory = memo(MoveHistoryComponent);
MoveHistory.displayName = "MoveHistory";
