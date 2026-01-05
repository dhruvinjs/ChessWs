import { useCallback } from "react";
import { useGameStore } from "../stores/useGameStore";
import { showMessage } from "../Components";
export const useChess = () => {
  // These trigger re-renders when they change
  const selectedSquare = useGameStore((state) => state.selectedSquare);
  // const playerColor = useGameStore((state) => state.color);
  const validMoves = useGameStore((state) => state.validMoves);

  // Stable references (won’t change between renders)
  const { setSelectedSquare, move } = useGameStore.getState();

  const handleSquareClick = useCallback(
    (square: string, piece: string | null) => {
      // ✅ Get ALL state fresh from the store to avoid stale closures
      const state = useGameStore.getState();
      const fenNow = state.fen;
      const turn = fenNow.split(" ")[1] as "w" | "b";
      const playerColor = state.color;
      const drawOfferSent = state.drawOfferSent;
      const selectedSquare = state.selectedSquare;
      const validMoves = state.validMoves;

      console.log("🖱️ Square clicked:", {
        square,
        piece,
        selectedSquare,
        myColor: playerColor,
        currentTurn: turn,
        isMyTurn: turn === playerColor,
        validMovesCount: validMoves.length,
      });

      // 🚫 Not your turn
      if (turn !== playerColor) {
        console.warn("⛔ Not your turn!", {
          currentTurn: turn,
          yourColor: playerColor,
        });
        return;
      }
      if (drawOfferSent) {
        showMessage(
          "Draw Offer Sent!",
          "⏳ Please wait — opponent hasn't responded to your draw offer yet.",
          { type: "warning" }
        );
        return;
      }
      // ✅ Case 1: Piece already selected
      if (selectedSquare) {
        const validMove = validMoves.find(
          (m) => m.from === selectedSquare && m.to === square
        );

        console.log("✅ Valid move check:", {
          from: selectedSquare,
          to: square,
          isValid: !!validMove,
          validMovesCount: validMoves.length,
        });

        if (validMove) {
          // --- Promotion detection ---
          const fenBoard = fenNow.split(" ")[0];
          const rows = fenBoard.split("/");

          const col = selectedSquare.charCodeAt(0) - "a".charCodeAt(0);
          const row = 8 - parseInt(selectedSquare[1]);
          const fenRow = rows[row];
          let colIndex = 0;
          let fenPiece: string | null = null;

          for (const char of fenRow) {
            if (!isNaN(Number(char))) {
              colIndex += Number(char);
            } else {
              if (colIndex === col) {
                fenPiece = char;
                break;
              }
              colIndex++;
            }
          }

          const isPawn = fenPiece?.toLowerCase() === "p";
          const isPromotionRank =
            (playerColor === "w" && square[1] === "8") ||
            (playerColor === "b" && square[1] === "1");

          if (isPawn && isPromotionRank) {
            console.log("👑 Pawn promotion! Promoting to Queen");
            move({ from: selectedSquare, to: square, promotion: "q" });
          } else {
            console.log("♟️ Regular move");
            move({ from: selectedSquare, to: square });
          }

          return;
        }

        // --- Invalid move fallbacks ---
        if (selectedSquare === square) {
          console.log("🔄 Deselecting same square");
          setSelectedSquare(null);
          return;
        }

        if (piece && piece[0] === playerColor) {
          console.log("🔀 Selecting different piece:", square);
          setSelectedSquare(square);
          return;
        }

        console.log("❌ Invalid move, deselecting");
        setSelectedSquare(null);
        return;
      }

      // ✅ Case 2: No piece selected
      if (piece && piece[0] === playerColor) {
        console.log("✨ Selecting piece:", square, piece);
        setSelectedSquare(square);
      } else {
        console.log(
          "⚠️ Cannot select:",
          piece ? "opponent piece" : "empty square"
        );
      }
    },
    [setSelectedSquare, move]
  );

  return {
    selectedSquare,
    validMoves,
    handleSquareClick,
  };
};
