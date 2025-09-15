import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { GameMessages } from "../constants";
import { useQueryClient } from "@tanstack/react-query";
import { showGameMessage } from "../Components/chess/ChessGameMessage";

export function useSocketHandlers(syncGameState?: (fen: string) => void) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;

        console.log("📥 Received message:", type, payload);

        switch (type) {
          case GameMessages.INIT_GAME:
            showGameMessage(
              `🎮 Game started! You are ${
                payload.color === "w" ? "White" : "Black"
              }`
            );
            queryClient.setQueryData(["game"], payload);
            if (syncGameState && payload.fen) syncGameState(payload.fen);
            break;

          case GameMessages.GAME_FOUND:
            showGameMessage("🔄 Reconnected to existing game!");
            queryClient.setQueryData(["game"], payload);
            if (syncGameState && payload.fen) syncGameState(payload.fen);
            break;

          case GameMessages.MOVE:
            console.log("♟️ Move received:", payload);
            if (syncGameState && payload.fen) {
              // Backend FEN is always the source of truth
              syncGameState(payload.fen);
            }
            break;

          case GameMessages.VALID_MOVES:
            console.log("🎯 Valid moves received:", payload);
            if (payload.square && Array.isArray(payload.moves)) {
              queryClient.setQueryData(["validMoves"], payload.moves);
            } else {
              queryClient.setQueryData(["validMoves"], []);
            }
            break;

          case GameMessages.CHECK:
            showGameMessage("⚠️ Check!");
            break;

          case GameMessages.TIMER_UPDATE:
            queryClient.setQueryData(["game"], (old: any) => ({
              ...old,
              whiteTimer: payload.whiteTimer ?? payload.whitetimer,
              blackTimer: payload.blackTimer,
            }));
            break;

          case GameMessages.TIME_EXCEEDED:
            showGameMessage("⏰ Time exceeded!");
            break;

          case GameMessages.GAME_OVER:
            const winnerText =
              payload.winner === "w"
                ? "White"
                : payload.winner === "b"
                ? "Black"
                : "Draw";
            showGameMessage(`🏁 Game Over! Winner: ${winnerText}`);
            break;

          case GameMessages.DISCONNECTED:
            showGameMessage("❌ Opponent disconnected");
            break;

          case GameMessages.OPP_RECONNECTED:
            showGameMessage("✅ Opponent reconnected!");
            break;

          case GameMessages.WRONG_PLAYER_MOVE:
            showGameMessage("🚫 Not your turn!");
            break;

          case GameMessages.SERVER_ERROR:
            showGameMessage(payload.message || "⚠️ Server error occurred");
            break;

          default:
            console.log("❓ Unknown message type:", type, payload);
        }
      } catch (error) {
        console.error("❌ Error parsing socket message:", error);
      }
    };

    socket.addEventListener("message", handleMessage
);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, queryClient, syncGameState]);
}
