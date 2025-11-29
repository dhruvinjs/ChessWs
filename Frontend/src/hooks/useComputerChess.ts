import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import { useComputerGameStore } from "../stores/useComputerGameStore";
import { computerSocketManager } from "../lib/ComputerSocketManager";
import toast from "react-hot-toast";

export const useComputerChess = () => {
  // ✔ Top-level hooks MUST stay to keep hook order stable
  //@ts-ignore
  const dummy = useComputerGameStore((s) => s.gameStatus); 
  // we don't actually use it here — it only stabilizes hook order

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const handleSquareClick = useCallback(
    (squareName: string, pieceString: string | null) => {
      // ✔ Always get fresh Zustand snapshot inside handler
      const {
        gameData,
        gameStatus,
        isThinking,
      } = useComputerGameStore.getState();

      const validMoves = gameData?.validMoves;

      // Game inactive
      if (!gameData || gameStatus !== "active") return;

      // Computer thinking
      if (isThinking) {
        toast.error("Wait for computer's move!");
        return;
      }

      // Load latest FEN
      const chess = new Chess(gameData.fen);
      const turn = chess.turn();
      const playerColor = gameData.playerColor;

      if (turn !== playerColor) {
        toast.error("Not your turn!");
        return;
      }

      // Deselect
      if (selectedSquare === squareName) {
        setSelectedSquare(null);
        return;
      }

      // Select own piece
      if (pieceString && pieceString.startsWith(playerColor)) {
        setSelectedSquare(squareName);
        return;
      }

      // Attempt move
      if (selectedSquare) {
        const move = validMoves?.find(
          (m) => m.from === selectedSquare && m.to === squareName
        );

        if (move) {
          computerSocketManager.makeMove(gameData.computerGameId, {
            from: selectedSquare,
            to: squareName,
            ...(move.promotion && { promotion: move.promotion }),
          });

          setSelectedSquare(null);
          return;
        }

        // Switch piece selection
        if (pieceString && pieceString.startsWith(playerColor)) {
          setSelectedSquare(squareName);
        } else {
          setSelectedSquare(null);
          toast.error("Invalid move!");
        }
      }
    },
    [selectedSquare]
  );

  return { selectedSquare, handleSquareClick };
};
