import { Move, Square } from "chess.js"; // keep Square type
import { Square as SquareCell } from "./Square"; // rename component
import { GameState } from "../../types/chess";
import { getSquareName, getPieceNotation } from "../../utils/chessUtils";

interface ChessBoardProps {
  color?: "w" | "b" | null;
  gameState: GameState;
  selectedSquare: string | null;
  validMoves: Move[];
  lastMoveSquares: string[];
  onSquareClick: (square: Square) => void;
}

export function ChessBoard({
  color,
  gameState,
  selectedSquare,
  validMoves,
  lastMoveSquares,
  onSquareClick,
}: ChessBoardProps) {
  // Only flip the board if we have a valid color and it's black
  const isFlipped = color === "b";

  // Flip rows if black
  const boardRows = isFlipped ? [...gameState.board].reverse() : gameState.board;

  return (
    <div className="dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
      <div className="grid grid-cols-8 gap-0.5 aspect-square rounded-xl overflow-hidden">
        {boardRows.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            // Flip columns if black
            const colIdx = isFlipped ? 7 - colIndex : colIndex;

            // Compute square name for chess.js
            const square = getSquareName(isFlipped ? 7 - rowIndex : rowIndex, colIdx) as Square;

            // Determine square color
            const isLight = (rowIndex + colIdx) % 2 === 0;

            // Determine if selected or highlighted
            const isSelected = selectedSquare === square;
            const isValidMove = validMoves.some((move) => move.to === square);
            const isLastMove = lastMoveSquares.includes(square);

            const pieceNotation = getPieceNotation(piece);

            return (
              <SquareCell
                key={square}
                piece={pieceNotation}
                isLight={isLight}
                isSelected={isSelected}
                isValidMove={isValidMove}
                isLastMove={isLastMove}
                onClick={() => onSquareClick(square)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
