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
      validMoves
        .filter((move) => move.from === selectedSquare)
        .map((m) => m.to)
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

        return {
          squareName,
          pieceString,
          isLight,
          isSelected: selectedSquare === squareName,
          isLastMove:
            lastMoveSquares?.from === squareName ||
            lastMoveSquares?.to === squareName,
          isValidMove: validDestinationSquares.has(squareName),
        };
      })
    ).flat();
  }, [fen, playerColor, selectedSquare, lastMoveSquares, validDestinationSquares]);

  const files = useMemo(() => {
    const f = ["a", "b", "c", "d", "e", "f", "g", "h"];
    return playerColor === "b" ? f.slice().reverse() : f;
  }, [playerColor]);

  const ranks = useMemo(() => {
    const r = ["1", "2", "3", "4", "5", "6", "7", "8"];
    return playerColor === "w" ? r.slice().reverse() : r;
  }, [playerColor]);

  // 🎨 Coordinates: same gradient/light/dark card style as MoveHistory
  const coordClasses =
    "flex justify-center items-center text-sm font-semibold text-slate-900 dark:text-white bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 select-none";

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-4 rounded-2xl shadow-lg">
      <div className="grid grid-cols-[24px_1fr_24px] grid-rows-[24px_1fr_24px] aspect-square">
        {/* Top Files */}
        <div className="col-start-2 row-start-1 grid grid-cols-8">
          {files.map((f) => (
            <span key={f} className={coordClasses}>
              {f}
            </span>
          ))}
        </div>

        {/* Left Ranks */}
        <div className="col-start-1 row-start-2 grid grid-rows-8">
          {ranks.map((r) => (
            <span key={r} className={coordClasses}>
              {r}
            </span>
          ))}
        </div>

        {/* Chess Board */}
        <div className="grid grid-cols-8 col-start-2 row-start-2 shadow-xl rounded-sm overflow-hidden">
          {board.map(({ squareName, pieceString, ...restProps }) => (
            <Square
              key={squareName}
              piece={pieceString}
              {...restProps}
              onClick={createSquareClickHandler(squareName, pieceString)}
            />
          ))}
        </div>

        {/* Right Ranks */}
        <div className="col-start-3 row-start-2 grid grid-rows-8">
          {ranks.map((r) => (
            <span key={r} className={coordClasses}>
              {r}
            </span>
          ))}
        </div>

        {/* Bottom Files */}
        <div className="col-start-2 row-start-3 grid grid-cols-8">
          {files.map((f) => (
            <span key={f} className={coordClasses}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ChessBoard = memo(ChessBoardComponent);
