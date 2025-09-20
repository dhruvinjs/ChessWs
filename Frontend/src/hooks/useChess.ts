import { useState, useCallback } from "react";
import { useGameStore } from "../stores/useGameStore";
import { Chess, Square } from "chess.js";

/**
 * A hook to manage the chessboard interaction logic.
 * This hook encapsulates the state and behavior of the chessboard,
 * including piece selection, move validation, and game state synchronization.
 */
export function useChess() {
  const {
    fen,
    move: sendMove,
    color: playerColor,
    validMoves,
    setSelectedSquare: setGlobalSelectedSquare,
    getValidMoves, // Get the action from the store
    clearValidMoves, // Get the action from the store
  } = useGameStore();

  const [localSelectedSquare, setLocalSelectedSquare] = useState<Square | null>(
    null
  );

  const handleSquareClick = useCallback(
    (square: Square) => {
      const chess = new Chess(fen);
      if (chess.turn() !== playerColor) return; // Not our turn

      // If clicking the same square, deselect it
      if (localSelectedSquare === square) {
        setLocalSelectedSquare(null);
        setGlobalSelectedSquare(null);
        clearValidMoves();
        return;
      }

      // If a piece is already selected, check if the new square is a valid move
      if (localSelectedSquare) {
        const isMoveValid = validMoves.some(
          (move) => move.from === localSelectedSquare && move.to === square
        );

        if (isMoveValid) {
          const piece = chess.get(localSelectedSquare);
          // Handle promotion
          if (
            piece?.type === "p" &&
            ((playerColor === "w" && square.endsWith("8")) ||
              (playerColor === "b" && square.endsWith("1")))
          ) {
            // Auto-promote to queen for now
            sendMove({ from: localSelectedSquare, to: square, promotion: "q" });
          } else {
            sendMove({ from: localSelectedSquare, to: square });
          }
          // Clear selection after move
          setLocalSelectedSquare(null);
          setGlobalSelectedSquare(null);
          clearValidMoves();
          return;
        }
      }

      // If the clicked square has one of the player's pieces, select it
      const piece = chess.get(square);
      if (piece && piece.color === playerColor) {
        setLocalSelectedSquare(square);
        setGlobalSelectedSquare(square);
        getValidMoves(square); // Fetch valid moves for the selected piece
      } else {
        // Otherwise, clear the selection
        setLocalSelectedSquare(null);
        setGlobalSelectedSquare(null);
        clearValidMoves();
      }
    },
    [
      fen,
      playerColor,
      localSelectedSquare,
      validMoves,
      sendMove,
      setGlobalSelectedSquare,
      getValidMoves,
      clearValidMoves,
    ]
  );

  return {
    selectedSquare: localSelectedSquare,
    handleSquareClick,
  };
}
