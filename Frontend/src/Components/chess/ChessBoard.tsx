import { useGameStore } from "../../stores/useGameStore";
import { getSquare, getSquareColor } from "../../utils/chessUtils";
import { Square } from "./Square";
import { useMemo, useEffect } from "react";

export const ChessBoard = () => {
  const {
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // fallback
    moves = [],
    validMoves = [],
    selectedSquare,
    setSelectedSquare,
    color,
    turn,
    gameStarted,
    move
  } = useGameStore();

  // Defensive: validMoves always array
  const safeValidMoves = Array.isArray(validMoves) ? validMoves : [];

  // Last move highlights
  const lastMoveSquares = moves.length
    ? { from: moves[moves.length - 1].from, to: moves[moves.length - 1].to }
    : null;

  // Get valid destination squares for the selected piece
  const validDestinationSquares = useMemo(() => {
    if (!selectedSquare) return new Set<string>();
    return new Set(safeValidMoves
      .filter(move => move.from === selectedSquare)
      .map(m => m.to)
    );
  }, [selectedSquare, safeValidMoves]);

  // Track which squares have pieces that can move
  const squaresWithValidMoves = useMemo(() => {
    return new Set(safeValidMoves.map(m => m.from));
  }, [safeValidMoves]);

  // Debug logging for state changes
  useEffect(() => {
    console.log("🎮 Game state:", {
      color,
      turn,
      gameStarted,
      validMoves: safeValidMoves.length,
      selectedSquare
    });
  }, [color, turn, gameStarted, safeValidMoves.length, selectedSquare]);

  const handleSquareClick = (square: string) => {
    // Only allow moves if gameStarted, color, and turn are all valid
    if (!gameStarted || !color || !turn || color !== turn) {
      console.log("Not your turn or game not started", { gameStarted, turn, color });
      return;
    }

    console.log("Square clicked:", square, {
      selectedSquare,
      hasValidMoves: squaresWithValidMoves.has(square),
      isValidDestination: validDestinationSquares.has(square)
    });

    // If clicking the same square, deselect it
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // If a square is already selected
    if (selectedSquare) {
      // If clicking a valid destination square, make the move
      if (validDestinationSquares.has(square)) {
        const validMove = safeValidMoves.find(m => 
          m.from === selectedSquare && m.to === square
        );
        if (validMove) {
          move(validMove);
          setSelectedSquare(null);
        }
        return;
      }
      
      // If clicking a different piece that has valid moves, select it
      if (squaresWithValidMoves.has(square)) {
        setSelectedSquare(square);
        return;
      }

      // Clicking an invalid square, just deselect
      setSelectedSquare(null);
      return;
    }

    // No square selected - select if the piece has valid moves
    if (squaresWithValidMoves.has(square)) {
      setSelectedSquare(square);
    }
  };

  return (
    <div className="grid grid-cols-8 aspect-square shadow-xl rounded-md overflow-hidden">
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          // Flip coordinates if playing as black
          const actualRow = color === 'b' ? 7 - row : row;
          const actualCol = color === 'b' ? 7 - col : col;
          
          const square = getSquare(actualRow, actualCol, "w");
          const isLight = getSquareColor(actualRow, actualCol) === "light";
          const isSelected = selectedSquare === square;
          const isLastMove =
            lastMoveSquares?.from === square || lastMoveSquares?.to === square;
          const isValidMove = validDestinationSquares.has(square);

          // piece string from FEN -> map to "wP", "bK", etc.
          let pieceString: string | null = null;
          if (fen) {
            const rows = fen.split(" ")[0].split("/");
            const fenRow = rows[actualRow];
            let colIndex = 0;
            for (const char of fenRow) {
              if (!isNaN(Number(char))) {
                colIndex += Number(char);
              } else {
                if (colIndex === actualCol) {
                  const color = char === char.toUpperCase() ? "w" : "b";
                  pieceString = `${color}${char.toUpperCase()}`; // ✅ matches your /pieces/ folder
                  break;
                }
                colIndex++;
              }
            }
          }

          return (
            <Square
              key={square}
              piece={pieceString}
              isLight={isLight}
              isSelected={isSelected}
              isLastMove={!!isLastMove}
              isValidMove={isValidMove}
              onClick={() => handleSquareClick(square)}
            />
          );
        })
      ).flat()}
    </div>
  );
};
