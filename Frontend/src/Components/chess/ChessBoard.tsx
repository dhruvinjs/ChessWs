import { useMemo, memo, useCallback } from "react";
import { useGameStore } from "../../stores/useGameStore";
import { useChess } from "../../hooks/useChess";
import { getSquare, getSquareColor } from "../../utils/chessUtils";
import { Square } from "./Square";

const ChessBoardComponent = () => {
  const fen = useGameStore((state) => state.fen);
  const moves = useGameStore((state) => state.moves);
  const validMoves = useGameStore((state) => state.validMoves);
  const playerColor = useGameStore((state) => state.color);

  const { selectedSquare, handleSquareClick } = useChess();

  const lastMoveSquares = useMemo(() => {
    if (moves.length === 0) return null;
    const lastMove = moves[moves.length - 1];
    return { from: lastMove.from, to: lastMove.to };
  }, [moves]);

  const validDestinationSquares = useMemo(() => {
    if (!selectedSquare) return new Set<string>();
    return new Set(
      validMoves.filter((move) => move.from === selectedSquare).map((m) => m.to)
    );
  }, [selectedSquare, validMoves]);

  const createSquareClickHandler = useCallback(
    (squareName: string, pieceString: string | null) => {
      return () => handleSquareClick(squareName, pieceString);
    },
    [handleSquareClick]
  );

  const board = useMemo(() => {
    const fenToRender =
      fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const rows = fenToRender.split(" ")[0].split("/");

    return Array.from({ length: 8 }, (_, row) =>
      Array.from({ length: 8 }, (_, col) => {
        const actualRow = playerColor === "b" ? 7 - row : row;
        const actualCol = playerColor === "b" ? 7 - col : col;

        const squareName = getSquare(actualRow, actualCol, "w");
        const isLight = getSquareColor(actualRow, actualCol) === "light";

        let pieceString: string | null = null;
        const fenRow = rows[actualRow];
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

        // Determine if this square should show notation
        const showRankLabel = col === 0; // Left column
        const showFileLabel = row === 7; // Bottom row
        const rankLabel = showRankLabel
          ? (playerColor === "w" ? 8 - row : row + 1).toString()
          : null;
        const fileLabel = showFileLabel
          ? ["a", "b", "c", "d", "e", "f", "g", "h"][
              playerColor === "b" ? 7 - col : col
            ]
          : null;

        return {
          squareName,
          pieceString,
          isLight,
          isSelected: selectedSquare === squareName,
          isLastMove:
            lastMoveSquares?.from === squareName ||
            lastMoveSquares?.to === squareName,
          isValidMove: validDestinationSquares.has(squareName),
          rankLabel,
          fileLabel,
        };
      })
    ).flat();
  }, [
    fen,
    playerColor,
    selectedSquare,
    lastMoveSquares,
    validDestinationSquares,
  ]);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-1 sm:p-2 shadow-lg border-x border-slate-700/50">
      {/* Chess Board with internal notation */}
      <div className="grid grid-cols-8 aspect-square shadow-xl rounded-sm overflow-hidden">
        {board.map(
          ({ squareName, pieceString, rankLabel, fileLabel, ...restProps }) => (
            <Square
              key={squareName}
              piece={pieceString}
              rankLabel={rankLabel}
              fileLabel={fileLabel}
              {...restProps}
              onClick={createSquareClickHandler(squareName, pieceString)}
            />
          )
        )}
      </div>
    </div>
  );
};

export const ChessBoard = memo(ChessBoardComponent);
