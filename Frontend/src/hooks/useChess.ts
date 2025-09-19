import { useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import type { GameState, ChessBoard as ChessBoardType, MovePayload } from "../types/chess";
import { useSendSocket } from "./useSendSocket";
import { useGameStore } from "../stores/useGameStore";
import toast from "react-hot-toast";

export function useChess() {
  const { move, requestValidMoves } = useSendSocket();
  const { 
    validMoves, 
    fen, 
    selectedSquare, 
    setSelectedSquare,
    color,
    turn,
    gameStarted,
    moves 
  } = useGameStore();

  // Always rebuild chess.js from Zustand FEN
  const chess = useMemo(() => {
    const c = new Chess();
    if (fen) c.load(fen);
    return c;
  }, [fen]);

  // Convert board for UI
  const convertBoard = useCallback((): ChessBoardType => {
    return chess.board().map((row, rowIdx) =>
      row.map((piece, colIdx) =>
        piece
          ? {
              type: piece.type,
              color: piece.color,
              square: `${"abcdefgh"[colIdx]}${8 - rowIdx}`,
            }
          : null
      )
    );
  }, [chess]);

  // UI game state
  const gameState: GameState = useMemo(
    () => ({
      board: convertBoard(),
      turn: chess.turn(),
      isGameOver: chess.isGameOver(),
      isCheck: chess.inCheck(),
      moveHistory: chess.history(),
      fen: chess.fen(),
    }),
    [chess, convertBoard]
  );

  // Handle square clicks
  const handleSquareClick = useCallback(
    (square: Square) => {
      // Ensure valid game state
      if (!gameStarted || chess.isGameOver()) {
        toast.error("Game is not active!");
        return;
      }

      // Check if it's player's turn
      if (color !== turn) {
        toast.error("Not your turn!");
        return;
      }

      console.log("Click handler state:", {
        gameStarted,
        color,
        turn,
        selectedSquare,
        validMoves
      });

      // If a square is already selected
      if (selectedSquare) {
        const movePayload: MovePayload = {
          from: selectedSquare as Square,
          to: square
        };

        // Check if move is valid (using validMoves from Zustand)
        const isValidMove = validMoves.some(
          (m) => m.from === selectedSquare && m.to === square
        );

        if (isValidMove) {
          // Check for pawn promotion
          const piece = chess.get(selectedSquare as Square);
          if (
            piece?.type === "p" &&
            ((piece.color === "w" && square[1] === "8") ||
              (piece.color === "b" && square[1] === "1"))
          ) {
            movePayload.promotion = "q"; // Auto-promote to queen
          }

          console.log("Making move:", movePayload);
          move(movePayload);
          setSelectedSquare(null);
        } else {
          // Not a valid destination - select new square and request its moves
          console.log("Not a valid destination, selecting new square:", square);
          requestValidMoves(square);
          setSelectedSquare(square);
        }
      } else {
        // No square selected - first request valid moves, then update selection based on response
        console.log("Requesting valid moves for square:", square);
        requestValidMoves(square);
        setSelectedSquare(square);  // Select the square immediately for better UX
      }
    },
    [selectedSquare, validMoves, move, requestValidMoves, setSelectedSquare, chess, color, turn, gameStarted]
  );

  // Get last move for highlighting
  const lastMove = moves.length > 0 ? moves[moves.length - 1] : null;

  return {
    gameState,
    selectedSquare,
    handleSquareClick,
    lastMoveSquares: lastMove ? { from: lastMove.from, to: lastMove.to } : null
  };
}

