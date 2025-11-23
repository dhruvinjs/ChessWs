import { useMemo, memo, useCallback, useState } from "react";
import { Chess } from "chess.js";
import { useComputerGame } from "../../hooks/useComputerGame";
import { computerSocketManager } from "../../lib/computerGame/ComputerSocketManager";
import { getSquare, getSquareColor } from "../../utils/chessUtils";
import { Square } from "./Square";

const ComputerChessBoardComponent = () => {
  const { gameData, gameStatus } = useComputerGame();
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  
  // Get valid moves from backend (stored in gameData)
  const validMoves = gameData?.validMoves || [];

  const chess = useMemo(() => {
    if (!gameData) return new Chess();
    return new Chess(gameData.fen);
  }, [gameData]);

  const playerColor = gameData?.playerColor || "w";
  const isPlayerTurn = chess.turn() === playerColor;

  const lastMoveSquares = useMemo(() => {
    if (!gameData || gameData.moves.length === 0) return null;
    const lastMove = gameData.moves[gameData.moves.length - 1];
    return { from: lastMove.from, to: lastMove.to };
  }, [gameData]);

  const validDestinationSquares = useMemo(() => {
    if (!selectedSquare) return new Set<string>();
    return new Set(
      validMoves
        .filter((move) => move.from === selectedSquare)
        .map((m) => m.to)
    );
  }, [selectedSquare, validMoves]);

  const handleSquareClick = useCallback(
    (squareName: string, pieceString: string | null) => {
      if (gameStatus !== "active" || !isPlayerTurn || !gameData) return;
      
      // If clicking the same square again, deselect it
      if (selectedSquare === squareName) {
        setSelectedSquare(null);
        return;
      }

      // If clicking on own piece, select it (valid moves from backend)
      if (pieceString && pieceString.startsWith(playerColor)) {
        setSelectedSquare(squareName);
        return;
      }

      // If a square is selected and clicking a different square, try to move
      if (selectedSquare) {
        // Check if this is a valid move (from backend validMoves)
        const isValidDestination = validDestinationSquares.has(squareName);
        
        if (isValidDestination) {
          // Send move to server - backend will validate
          computerSocketManager.makeMove(gameData.computerGameId, {
            from: selectedSquare,
            to: squareName,
            promotion: "q", // Always promote to queen for now
          });
          
          setSelectedSquare(null);
          return;
        }
        
        // If clicked on empty square or invalid move, deselect
        setSelectedSquare(null);
      }
    },
    [gameStatus, isPlayerTurn, gameData, playerColor, selectedSquare, validDestinationSquares]
  );

  const createSquareClickHandler = useCallback(
    (squareName: string, pieceString: string | null) => {
      return () => handleSquareClick(squareName, pieceString);
    },
    [handleSquareClick]
  );

  const board = useMemo(() => {
    const fenToRender = gameData?.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
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
  }, [gameData?.fen, playerColor, selectedSquare, lastMoveSquares, validDestinationSquares]);

  const files = useMemo(() => {
    const f = ["a", "b", "c", "d", "e", "f", "g", "h"];
    return playerColor === "b" ? f.slice().reverse() : f;
  }, [playerColor]);

  const ranks = useMemo(() => {
    const r = ["1", "2", "3", "4", "5", "6", "7", "8"];
    return playerColor === "w" ? r.slice().reverse() : r;
  }, [playerColor]);

  const coordClasses =
    "flex justify-center items-center text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 select-none";

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-lg">
      <div className="grid grid-cols-[20px_1fr_20px] sm:grid-cols-[24px_1fr_24px] grid-rows-[20px_1fr_20px] sm:grid-rows-[24px_1fr_24px] aspect-square">
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

export const ComputerChessBoard = memo(ComputerChessBoardComponent);
