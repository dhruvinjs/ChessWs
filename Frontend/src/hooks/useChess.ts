import { useCallback, useMemo, useState } from "react";
import { Chess, Move, Square } from "chess.js";
import type { GameState, ChessBoard as ChessBoardType, MovePayload } from "../types/chess";
import { useSendSocket } from "./useSendSocket";
import { useGame } from "./useGame";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useValidMoves } from "./useValidMoves"; // ✅ import your hook

export function useChess() {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const { move, requestValidMoves } = useSendSocket();
  const gameData = useGame();
  const queryClient = useQueryClient();

  // ✅ use the custom hook for valid moves
  const { validMoves, clearValidMoves } = useValidMoves();

  // Always rebuild chess.js from backend-provided FEN
  const chess = useMemo(() => {
    const c = new Chess();
    if (gameData?.fen) c.load(gameData.fen);
    return c;
  }, [gameData?.fen]);

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
      if (gameState.isGameOver) {
        toast.error("Game is already over!");
        return;
      }

      if (gameData?.color !== gameState.turn) {
        toast.error("It's not your turn!");
        return;
      }

      if (selectedSquare) {
        // Try to make a move
        const movePayload: MovePayload = { from: selectedSquare, to: square };

        // Check backend-provided valid moves
        const isMoveValid = validMoves.some(
          (m) => m.from === selectedSquare && m.to === square
        );

        if (isMoveValid) {
          // Handle promotion
          const piece = chess.get(selectedSquare);
          if (
            piece?.type === "p" &&
            (square.endsWith("1") || square.endsWith("8"))
          ) {
            movePayload.promotion = "q";
          }
          move(movePayload);
        }

        // Clear selection + valid moves
        setSelectedSquare(null);
        clearValidMoves(); // ✅ use hook instead of direct queryClient
      } else {
        // Select a piece (only if it's yours)
        const piece = chess.get(square);
        if (piece && piece.color === gameState.turn) {
          setSelectedSquare(square);
          requestValidMoves(square);
        }
      }
    },
    [selectedSquare, gameState, gameData, validMoves, move, requestValidMoves, clearValidMoves, chess]
  );

  // Sync state from backend
  const syncGameState = useCallback(
    (fen: string, from?: string, to?: string) => {
      try {
        chess.load(fen);
        queryClient.invalidateQueries({ queryKey: ["game"] });

        // Always clear highlights on sync
        clearValidMoves();

        // Update last move highlight
        if (from && to) {
          return { from, to };
        }
      } catch (error) {
        console.error("Error syncing game state:", error);
      }
      return null;
    },
    [chess, queryClient, clearValidMoves]
  );

  // Last move highlight
  const lastMove = chess.history({ verbose: true }).pop();

  return {
    gameState,
    selectedSquare,
    handleSquareClick,
    lastMoveSquares: lastMove ? [lastMove.from, lastMove.to] : [],
    syncGameState,
  };
}

