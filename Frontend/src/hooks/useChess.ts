import { useState, useCallback } from "react";
import { useGameStore } from "../stores/useGameStore";
import { Chess, Square } from "chess.js";

export function useChess() {
  // Subscribing to state slices individually. This is the correct pattern.
  const fen = useGameStore((state) => state.fen);
  const sendMove = useGameStore((state) => state.move);
  const playerColor = useGameStore((state) => state.color);
  const validMoves = useGameStore((state) => state.validMoves);
  const setGlobalSelectedSquare = useGameStore(
    (state) => state.setSelectedSquare
  );

  // Local state is used for immediate UI feedback.
  const [localSelectedSquare, setLocalSelectedSquare] = useState<Square | null>(
    null
  );

  const handleSquareClick = useCallback(
    (square: Square, piece: string | null) => {
      const chess = new Chess(fen);
      console.log(chess.turn(),playerColor);
      if (chess.turn() !== playerColor) {
        return;
      }
      console.log(localSelectedSquare)
      if (localSelectedSquare) {
        const isMoveValid = validMoves.some(
          (move) => move.from === localSelectedSquare && move.to === square
        );
        console.log(validMoves)
        console.log(isMoveValid);
        if (isMoveValid) {
          const fromPiece = chess.get(localSelectedSquare);

          if (
            fromPiece?.type === "p" &&
            ((fromPiece.color === "w" && square.endsWith("8")) ||
              (fromPiece.color === "b" && square.endsWith("1")))
          ) {
            sendMove({ from: localSelectedSquare, to: square, promotion: "q" });
          } else {
            sendMove({ from: localSelectedSquare, to: square });
          }
          setLocalSelectedSquare(null);
          setGlobalSelectedSquare(null);
          return;
        }
      }

      if (localSelectedSquare === square) {
        setLocalSelectedSquare(null);
        setGlobalSelectedSquare(null);
        return;
      }

      if (piece && piece.startsWith(playerColor || "")) {
        setLocalSelectedSquare(square);
        setGlobalSelectedSquare(square);
      } else {
        setLocalSelectedSquare(null);
        setGlobalSelectedSquare(null);
      }
    },
    // Dependencies are correct and include all necessary state slices.
    [
      fen,
      playerColor,
      localSelectedSquare,
      validMoves,
      sendMove,
      setGlobalSelectedSquare,
    ]
  );

  return {
    selectedSquare: localSelectedSquare,
    handleSquareClick,
  };
}
