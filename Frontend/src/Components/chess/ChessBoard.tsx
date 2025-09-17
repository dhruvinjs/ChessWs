import { useMemo } from "react";
import { Chess, Move, Square as SquareType } from "chess.js";
import { getSquare, getSquareColor } from "../../utils/chessUtils";
import { Square } from "./Square";

interface ChessBoardProps {
  color: "w" | "b" | undefined | null;
  gameState?: string; // optional FEN
  selectedSquare: string | null;
  validMoves?: (Move | string)[];
  lastMoveSquares?: { from: string; to: string } | null;
  onSquareClick: (square: SquareType) => void;
}

export const ChessBoard = ({
  color,
  gameState,
  selectedSquare,
  validMoves = [],
  lastMoveSquares = null,
  onSquareClick,
}: ChessBoardProps) => {
  const playerColor = color || "w";

  // SAFE: check if gameState is a valid FEN (must have 6 space-delimited fields)
  const safeFEN = useMemo(() => {
    if (gameState && gameState.trim().split(" ").length === 6) {
      return gameState;
    }
    return undefined; // Chess.js will default to starting position
  }, [gameState]);

  const game = useMemo(() => new Chess(safeFEN), [safeFEN]);

  // Handle validMoves as either string[] or Move[]
  const validMovesSet = useMemo(() => {
    if (!validMoves || validMoves.length === 0) return new Set<string>();

    const firstEl = validMoves[0];
    if (typeof firstEl === "string") return new Set(validMoves as string[]);
    if (typeof firstEl === "object" && firstEl !== null && "to" in firstEl) {
      return new Set((validMoves as Move[]).map((m) => m.to));
    }
    return new Set<string>();
  }, [validMoves]);

  return (
    <div className="grid grid-cols-8 aspect-square shadow-xl rounded-md overflow-hidden">
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const square = getSquare(row, col, playerColor) as SquareType;
          const piece = game.get(square);
          const pieceString = piece ? `${piece.color}${piece.type.toUpperCase()}` : undefined;

          const isLight = getSquareColor(row, col) === "light";
          const isSelected = square === selectedSquare;
          const isLastMove = lastMoveSquares?.from === square || lastMoveSquares?.to === square;
          const isValidMove = validMovesSet.has(square);

          return (
            <Square
              key={square}
              piece={pieceString}
              isLight={isLight}
              isSelected={isSelected}
              isLastMove={!!isLastMove}
              isValidMove={isValidMove}
              onClick={() => onSquareClick(square)}
            />
          );
        })
      ).flat()}
    </div>
  );
};
