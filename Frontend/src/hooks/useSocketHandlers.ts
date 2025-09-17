import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { useQueryClient } from "@tanstack/react-query";
import { showGameMessage } from "../Components/chess/ChessGameMessage";
import { GameMessages } from "../constants";

// The callback now accepts the full move details
export function useSocketHandlers(syncGameState?: (fen: string, from?: string, to?: string) => void) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;

        console.log("📥 Received message:", type, payload);

        // Invalidate the main game query for most events to keep data fresh
        if (payload?.gameId) {
            queryClient.invalidateQueries({ queryKey: ["game", payload.gameId] });
        }

        switch (type) {

          // Handle moves and state synchronization
          case GameMessages.MOVE:
            if (syncGameState && payload.fen) {
              syncGameState(payload.fen, payload.from, payload.to);
            }
            break;

          case GameMessages.GAME_OVER:
            if (syncGameState && payload.fen) {
              syncGameState(payload.fen);
            }
            showGameMessage("Game Over", payload.message || "The game has ended.", { type: "info" });
            break;
            
          case GameMessages.GAME_FOUND:
          case GameMessages.GAME_ACTIVE:
            showGameMessage("Game Ready", "A game is ready to start!", { type: "success" });
            break;

          case GameMessages.CHECK:
            showGameMessage("Check!", "You are in check.", { type: "warning" });
            break;

          case GameMessages.STALEMATE:
            showGameMessage("Stalemate", "The game is a draw.", { type: "info" });
            break;

          case GameMessages.OPP_RECONNECTED:
            showGameMessage("Opponent Reconnected", "Your opponent is back online.", { type: "info" });
            break;

          case GameMessages.DISCONNECTED:
            showGameMessage("Opponent Disconnected", "Your opponent has disconnected.", { type: "warning" });
            break;

          case GameMessages.TIME_EXCEEDED:
            showGameMessage("Time's Up!", payload.message || "You ran out of time.", { type: "error" });
            break;

          case GameMessages.SERVER_ERROR:
            showGameMessage("Server Error", payload.message || "A server error occurred.", { type: "error" });
            break;

          case GameMessages.WRONG_PLAYER_MOVE:
            showGameMessage("Invalid Move", "It's not your turn to move.", { type: "error" });
            break;

          // Update valid moves in React Query store
          case GameMessages.VALID_MOVES:
             queryClient.setQueryData(['validMoves'], payload.moves);
             break;

          // Silent handlers (no message toast)
          case GameMessages.INIT_GAME:
          case GameMessages.TIMER_UPDATE:
            break;

          default:
            console.warn(`Unknown message type: ${type}`);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        showGameMessage("Error", "There was a problem processing a message from the server.", { type: "error" });
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, queryClient, syncGameState]);
}
