
import { memo, useMemo } from "react";
import { useGameStore } from "../../stores/useGameStore";

interface MoveRowProps {
  moveNumber: number;
  color: string;
  from: string;
  to: string;
  promotion?: string | null;
}

const MoveRow = memo(
  ({ moveNumber, color, from, to, promotion }: MoveRowProps) => (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150 cursor-pointer w-full">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-5 text-right">
          {moveNumber}.
        </span>
        <span
          className={`text-sm font-bold w-3 text-center ${
            color === "White"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {color.slice(0, 1)}
        </span>
      </div>
      <span className="font-mono text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
        {from} → {to}
        {promotion && (
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
            ({promotion})
          </span>
        )}
      </span>
    </div>
  )
);

MoveRow.displayName = "MoveRow";

// Piece SVG Component - memoized to prevent re-creation
const PieceSVG = memo(({ piece }: { piece: string }) => {
  const svgPath = `/pieces/${piece}.svg`;
  return (
    <div className="w-6 h-6 flex-shrink-0">
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
  // Dummy data for captured pieces - will be replaced with real data later
  const capturedByWhite = ["bP", "bP", "bN", "bB"]; // Black pieces captured by white
  const capturedByBlack = ["wP", "wP", "wR"]; // White pieces captured by black

  return (
    <div className="space-y-3 mb-4">
      {/* White's Captured Pieces */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 w-4">W:</span>
        <div className="flex items-center gap-1 flex-wrap">
          {capturedByWhite.length > 0 ? (
            capturedByWhite.map((piece, index) => (
              <PieceSVG 
                key={`white-${index}`}
                piece={piece}
              />
            ))
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">None</span>
          )}
        </div>
      </div>

      {/* Black's Captured Pieces */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 w-4">B:</span>
        <div className="flex items-center gap-1 flex-wrap">
          {capturedByBlack.length > 0 ? (
            capturedByBlack.map((piece, index) => (
              <PieceSVG 
                key={`black-${index}`}
                piece={piece}
              />
            ))
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">None</span>
          )}
        </div>
      </div>
    </div>
  );
});

CapturedPieces.displayName = "CapturedPieces";

const MoveHistoryComponent = () => {
  // Only subscribe to moves, nothing else
  const moves = useGameStore((state) => state.moves);

  const moveRows = useMemo(
    () =>
      moves.map((move, index) => {
        const moveNumber = Math.floor(index / 2) + 1;
        const color = index % 2 === 0 ? "White" : "Black";
        return (
          <MoveRow
            key={`${move.from}-${move.to}-${index}`}
            moveNumber={moveNumber}
            color={color}
            from={move.from}
            to={move.to}
            promotion={move.promotion}
          />
        );
      }),
    [moves]
  );

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 md:p-5 rounded-2xl shadow-xl flex flex-col w-full">
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <span className="inline-block w-1.5 h-5 bg-indigo-500 rounded"></span>
        Move History
      </h3>

      {/* Captured Pieces Section */}
      <CapturedPieces />

      <div className="flex-grow max-h-64 overflow-y-auto pr-2 w-full custom-scrollbar">
        {moves.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-6 italic">
            No moves yet
          </p>
        ) : (
          <div className="space-y-0.5 w-full">{moveRows}</div>
        )}
      </div>
    </div>
  );
};

// Proper memoization - only re-render when component actually needs to update
export const MoveHistory = memo(MoveHistoryComponent);
MoveHistory.displayName = "MoveHistory";
