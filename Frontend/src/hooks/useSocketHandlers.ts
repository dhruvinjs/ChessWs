import { useEffect } from "react";
import { SocketManager } from "../lib/socketManager";
import { useGameStore } from "../stores/useGameStore";
import { showGameMessage } from "../Components/chess/ChessGameMessage";
import { GameMessages } from "../constants";

// This hook is responsible for setting up and tearing down the global WebSocket
// event listener. It uses `useGameStore.getState()` to interact with the Zustand
// store, ensuring that actions are always dispatched against the latest state,
// preventing issues with stale closures in the event handler.

export function useSocketHandlers(
  syncGameState?: (fen: string, from?: string, to?: string) => void
) {
  useEffect(() => {
    const socket = SocketManager.getInstance().getSocket();
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;

        console.log("📥 Received message:", type, payload);

        // --- THIS IS THE FIX ---
        // Access the store's methods via `getState()` inside the event handler.
        // This ensures that we are always using the latest version of the state
        // and its associated functions, avoiding stale state issues that can
        // occur in long-lived event listeners.
        const {
          processServerMove,
          setFen,
          endGame,
          reconnect,
          setOppStatus,
          updateTimers,
        } = useGameStore.getState();

        switch (type) {
          case GameMessages.MOVE:
            processServerMove(payload);
            if (syncGameState) {
              syncGameState(payload.fen, payload.move.from, payload.move.to);
            }
            break;

          case GameMessages.GAME_OVER:
            if (payload.fen) {
              setFen(payload.fen);
            }
            endGame(payload.winner, payload.loser);
            showGameMessage(
              "Game Over",
              payload.message || "The game has ended.",
              { type: "info" }
            );
            break;

          case GameMessages.INIT_GAME:
            reconnect(payload);
            if (syncGameState) syncGameState(payload.fen);

            if (payload.moves && payload.moves.length > 0) {
              showGameMessage(
                "Rejoined Game",
                "Welcome back! The game is in progress.",
                { type: "info" }
              );
            } else {
              showGameMessage(
                "Game Started",
                `You are playing as ${
                  payload.color === "w" ? "White" : "Black"
                }`,
                { type: "success" }
              );
            }
            break;

          case GameMessages.GAME_ACTIVE:
            showGameMessage("Game Ready", "A game is ready to start!", {
              type: "success",
            });
            break;

          case GameMessages.CHECK:
            showGameMessage("Check!", payload.message || "You are in check.", {
              type: "warning",
            });
            break;

          case GameMessages.STALEMATE:
            showGameMessage(
              "Stalemate",
              payload.message || "The game is a draw.",
              { type: "info" }
            );
            break;

          case GameMessages.OPP_RECONNECTED:
            reconnect(payload);
            if (syncGameState && payload.fen) {
              syncGameState(payload.fen);
            }
            showGameMessage(
              "Opponent Reconnected",
              "Your opponent is back online.",
              { type: "info" }
            );
            break;

          case GameMessages.DISCONNECTED:
            setOppStatus(false);
            showGameMessage(
              "Opponent Disconnected",
              payload.message || "Your opponent has disconnected.",
              { type: "warning" }
            );
            break;

          case GameMessages.TIME_EXCEEDED:
            endGame(payload.winner, payload.loser);
            showGameMessage("Time's Up!", payload.message || "You ran out of time.", {
              type: "error",
            });
            break;

          case GameMessages.SERVER_ERROR:
            showGameMessage(
              "Server Error",
              payload.message || "A server error occurred.",
              { type: "error" }
            );
            break;

          case GameMessages.WRONG_PLAYER_MOVE:
            showGameMessage(
              "Invalid Move",
              payload.message || "It's not your turn to move.",
              { type: "error" }
            );
            break;

          case GameMessages.TIMER_UPDATE:
            if (
              payload.whiteTimer !== undefined &&
              payload.blackTimer !== undefined
            ) {
              updateTimers(payload.whiteTimer, payload.blackTimer);
            }
            break;

          default:
            console.warn(`Unknown message type: ${type}`);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        showGameMessage(
          "Error",
          "There was a problem processing a message from the server.",
          { type: "error" }
        );
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
    // The dependency array is now just [syncGameState]. The effect will only re-run
    // if this specific prop changes, which is the correct and intended behavior.
  }, [syncGameState]);
}
