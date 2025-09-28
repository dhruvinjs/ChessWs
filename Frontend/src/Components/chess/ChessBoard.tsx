import { useMemo } from "react";
import { useGameStore } from "../../stores/useGameStore";
import { useChess } from "../../hooks/useChess";
import { getSquare, getSquareColor } from "../../utils/chessUtils";
import { Square } from "./Square";

export const ChessBoard = () => {
  // --- THIS IS THE FIX ---
  // Subscribing to state slices individually is the recommended way to use Zustand.
  // It ensures the component re-renders only when the specific state it needs has changed.
  // This resolves the bug where the board was not updating for the black player.
  const fen = useGameStore((state) => state.fen);
  const moves = useGameStore((state) => state.moves);
  const validMoves = useGameStore((state) => state.validMoves);
  const playerColor = useGameStore((state) => state.color);
  // --- END OF FIX ---

  const { selectedSquare, handleSquareClick } = useChess();

  const lastMoveSquares = useMemo(() => {
    if (moves.length === 0) return null;
    const lastMove = moves[moves.length - 1];
    return { from: lastMove.from, to: lastMove.to };
  }, [moves]);

  const validDestinationSquares = useMemo(() => {
    if (!selectedSquare) return new Set<string>();
    // The `validMoves` from the store is now guaranteed to be an array by the selector
    return new Set(
      validMoves
        .filter((move) => move.from === selectedSquare)
        .map((m) => m.to)
    );
  }, [selectedSquare, validMoves]);

  const board = useMemo(() => {
    const fenToRender = fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const rows = fenToRender.split(" ")[0].split("/");
    return Array.from({ length: 8 }, (_, row) =>
      Array.from({ length: 8 }, (_, col) => {
        const actualRow = playerColor === "b" ? 7 - row : row;
        const actualCol = playerColor === "b" ? 7 - col : col;

        const squareName = getSquare(actualRow, actualCol, "w");
        const isLight = getSquareColor(actualRow, actualCol) === "light";

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

        return {
          squareName,
          pieceString,
          isLight,
        };
      })
    ).flat();
  }, [fen, playerColor]);

  return (
    <div className="grid grid-cols-8 aspect-square shadow-xl rounded-md overflow-hidden">
      {board.map(({ squareName, pieceString, isLight }) => (
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
          onClick={() => handleSquareClick(squareName, pieceString)}
        />
      ))}
    </div>
  );
};
