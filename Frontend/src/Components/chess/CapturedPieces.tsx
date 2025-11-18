import { memo } from "react";
import { useGameStore } from "../../stores/useGameStore";
import { Piece } from "./Piece";

interface CapturedPiecesProps {
  className?: string;
}

const CapturedPiecesComponent = ({ className = "" }: CapturedPiecesProps) => {
  const capturedPieces = useGameStore((state) => state.capturedPieces);
  const playerColor = useGameStore((state) => state.color);

  // Separate captured pieces by color
  const myCapturedPieces = capturedPieces.filter(piece => 
    playerColor === "w" ? piece.startsWith("b") : piece.startsWith("w")
  );
  
  const opponentCapturedPieces = capturedPieces.filter(piece => 
    playerColor === "w" ? piece.startsWith("w") : piece.startsWith("b")
  );

  if (capturedPieces.length === 0) {
    return (
      <div className={`bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl ${className}`}>
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <span className="inline-block w-1.5 h-5 bg-red-500 rounded"></span>
          Captured Pieces
        </h3>
        <div className="text-center text-slate-500 dark:text-slate-400 py-4">
          No pieces captured yet
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl ${className}`}>
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <span className="inline-block w-1.5 h-5 bg-red-500 rounded"></span>
        Captured Pieces
      </h3>
      
      <div className="space-y-4">
        {/* Your captures (opponent's pieces you took) */}
        {myCapturedPieces.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Your Captures ({myCapturedPieces.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {myCapturedPieces.map((piece, index) => (
                <div 
                  key={`${piece}-${index}`} 
                  className="w-8 h-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded flex items-center justify-center"
                >
                  <Piece 
                    piece={piece} 
                    className="w-6 h-6" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opponent's captures (your pieces they took) */}
        {opponentCapturedPieces.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Opponent's Captures ({opponentCapturedPieces.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {opponentCapturedPieces.map((piece, index) => (
                <div 
                  key={`${piece}-${index}`} 
                  className="w-8 h-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded flex items-center justify-center"
                >
                  <Piece 
                    piece={piece} 
                    className="w-6 h-6" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CapturedPieces = memo(CapturedPiecesComponent);
CapturedPieces.displayName = "CapturedPieces";