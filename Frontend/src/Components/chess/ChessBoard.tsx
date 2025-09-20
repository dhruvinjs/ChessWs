import { useMemo } from "react";
import { useGameStore } from "../../stores/useGameStore";
import { useChess } from "../../hooks/useChess"; // Import the new hook
import { getSquare, getSquareColor } from "../../utils/chessUtils";
import { Square } from "./Square";

export const ChessBoard = () => {
  const {
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves = [],
    validMoves = [],
    color: playerColor, // Renamed for clarity
  } = useGameStore();

  // Use the new hook for interaction logic
  const { selectedSquare, handleSquareClick } = useChess();

  // Highlight the last move
  const lastMoveSquares = useMemo(() => {
    if (moves.length === 0) return null;
    const lastMove = moves[moves.length - 1];
    return { from: lastMove.from, to: lastMove.to };
  }, [moves]);

  // Determine which squares to show valid move indicators on
  const validDestinationSquares = useMemo(() => {
    if (!selectedSquare) return new Set<string>();

    const safeValidMoves = Array.isArray(validMoves) ? validMoves : [];

    return new Set(
      safeValidMoves
        .filter((move) => move.from === selectedSquare)
        .map((m) => m.to)
    );
  }, [selectedSquare, validMoves]);

  return (
    <div className="grid grid-cols-8 aspect-square shadow-xl rounded-md overflow-hidden">
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          // Flip board if player is black
          const actualRow = playerColor === "b" ? 7 - row : row;
          const actualCol = playerColor === "b" ? 7 - col : col;

          const squareName = getSquare(actualRow, actualCol, "w");
          const isLight = getSquareColor(actualRow, actualCol) === "light";

          // Determine piece from FEN
          const rows = fen.split(" ")[0].split("/");
          const fenRow = rows[actualRow];
          let pieceString: string | null = null;
          let colIndex = 0;
          for (const char of fenRow) {
            if (!isNaN(Number(char))) {
              colIndex += Number(char);
            } else {
              if (colIndex === actualCol) {
                const pieceColor = char === char.toUpperCase() ? "w" : "b";
                pieceString = `${pieceColor}${char.toUpperCase()}`;
                break;
              }
              colIndex++;
            }
          }

          return (
            <Square
              key={squareName}
              piece={pieceString}
              isLight={isLight}
              isSelected={selectedSquare === squareName}
              isLastMove={
                lastMoveSquares?.from === squareName ||
                lastMoveSquares?.to === squareName
              }
              isValidMove={validDestinationSquares.has(squareName)}
              onClick={() => handleSquareClick(squareName)}
            />
          );
        })
      ).flat()}
    </div>
  );
};
