import { memo } from "react";
import { useComputerGame } from "../../hooks/useComputerGame";

// Piece SVG Component
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

const ComputerCapturedPiecesComponent = () => {
  const { gameData } = useComputerGame();
  
  if (!gameData) return null;
  
  const capturedPieces = gameData.capturedPieces || [];
  
  // Group pieces by type and count them
  const groupPieces = (pieces: string[]) => {
    const grouped = pieces.reduce((acc, piece) => {
      acc[piece] = (acc[piece] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([piece, count]) => ({ piece, count }));
  };

  // Separate captured pieces by color
  const capturedByPlayer = groupPieces(
    capturedPieces.filter(piece => 
      gameData.playerColor === "w" 
        ? piece.startsWith("b") // Player is white, show black pieces captured
        : piece.startsWith("w")  // Player is black, show white pieces captured
    )
  );
  
  const capturedByComputer = groupPieces(
    capturedPieces.filter(piece => 
      gameData.playerColor === "w" 
        ? piece.startsWith("w") // Player is white, show white pieces captured by computer
        : piece.startsWith("b")  // Player is black, show black pieces captured by computer
    )
  );

  if (capturedPieces.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-3">
        Captured Pieces
      </h3>
      <div className="space-y-4">
        {/* Player's Captured Pieces */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-sm font-bold text-green-700 dark:text-green-300">You</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {capturedByPlayer.length > 0 ? (
              capturedByPlayer.map(({ piece, count }, index) => (
                <div key={`player-${index}`} className="relative flex items-center gap-1 bg-slate-50 dark:bg-slate-700 p-2 rounded-lg shadow-md border border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow">
                  <PieceSVG piece={piece} />
                  {count > 1 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
                      <span className="text-[10px] font-black leading-none px-1">
                        {count}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500 italic">None captured</span>
            )}
          </div>
        </div>

        {/* Computer's Captured Pieces */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-sm font-bold text-orange-700 dark:text-orange-300">CPU</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {capturedByComputer.length > 0 ? (
              capturedByComputer.map(({ piece, count }, index) => (
                <div key={`computer-${index}`} className="relative flex items-center gap-1 bg-slate-50 dark:bg-slate-700 p-2 rounded-lg shadow-md border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-shadow">
                  <PieceSVG piece={piece} />
                  {count > 1 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
                      <span className="text-[10px] font-black leading-none px-1">
                        {count}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500 italic">None captured</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ComputerCapturedPieces = memo(ComputerCapturedPiecesComponent);
ComputerCapturedPieces.displayName = "ComputerCapturedPieces";
