import { Move } from 'chess.js';
import { Square } from './Square';
import { GameState } from '../../types/chess';
import { getSquareName, getPieceNotation } from '../../utils/chess';

interface ChessBoardProps {
  gameState: GameState;
  selectedSquare: string | null;
  validMoves: Move[];
  lastMoveSquares: string[];
  onSquareClick: (square: string) => void;
}

export function ChessBoard  ({
  gameState,
  selectedSquare,
  validMoves,
  lastMoveSquares,
  onSquareClick
}:ChessBoardProps) {
  return (
    <div className="dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
      <div className="grid grid-cols-8 gap-0.5 aspect-square rounded-xl overflow-hidden">
        {gameState.board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const square = getSquareName(rowIndex, colIndex);
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isValidMove = validMoves.some(move => move.to === square);
            const isLastMove = lastMoveSquares.includes(square);
            const pieceNotation = getPieceNotation(piece);

            return (
              <Square
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
};