import { useCallback } from "react";
import { useSocket } from "./useSocket";
import { GameMessages } from "../constants";
import type { MovePayload, Square } from "../types/chess";
import { useGame } from "./useGame";
import { showGameMessage } from "../Components/chess";
export function useSendSocket() {
  const socket = useSocket();
  const gameData = useGame();

  const initGame = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      console.log("🚀 Sending INIT_GAME");
      socket.send(JSON.stringify({ type: GameMessages.INIT_GAME }));

      showGameMessage(
        "Game Started",
        "Initializing a new chess game...",
        { type: "info" }
      );
    }
  }, [socket]);

  const move = useCallback(
    (payload: MovePayload) => {
      if (socket?.readyState === WebSocket.OPEN && gameData?.gameId) {
        console.log("🚀 Sending MOVE:", payload);
        socket.send(
          JSON.stringify({
            type: GameMessages.MOVE,
            payload,
          })
        );

        showGameMessage(
          "Move Sent",
          `You moved from ${payload.from} to ${payload.to}`,
          { type: "success" }
        );
      }
    },
    [socket, gameData?.gameId]
  );

  const requestValidMoves = useCallback(
    (square: Square) => {
      if (socket?.readyState === WebSocket.OPEN && gameData?.gameId) {
        console.log("🚀 Sending REQUEST_VALID_MOVES for square:", square);
        socket.send(
          JSON.stringify({
            type: GameMessages.REQUEST_VALID_MOVES,
            square,
          })
        );

        showGameMessage(
          "Fetching Moves",
          `Getting valid moves for ${square}`,
          { type: "info" }
        );
      }
    },
    [socket, gameData?.gameId]
  );

  const resign = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN && gameData?.gameId) {
      console.log("🚀 Sending LEAVE_GAME");
      // socket.send(JSON.stringify({ type: GameMessages.LEAVE_GAME }));

      showGameMessage(
        "Game Ended",
        "You have resigned the game.",
        { type: "warning" }
      );
    }
  }, [socket, gameData?.gameId]);

  return { initGame, move, resign, requestValidMoves };
}
