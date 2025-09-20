import { useEffect } from "react";
import { SocketManager } from "../lib/socket"; // Import the SocketManager
import { useGameStore } from "../stores/useGameStore";
import { showGameMessage } from "../Components/chess/ChessGameMessage";
import { GameMessages } from "../constants";

export function useSocketHandlers(
  syncGameState?: (fen: string, from?: string, to?: string) => void
) {
  const gameStore = useGameStore();
  const {
    addMove,
    setFen,
    setValidMoves,
    clearValidMoves,
    updateTimers,
    endGame,
    reconnect,
    setSelectedSquare,
  } = gameStore;

  useEffect(() => {
    const socket = SocketManager.getInstance().getSocket(); // Get the socket from the manager
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;

        console.log("📥 Received message:", type, payload);

        switch (type) {
          // Move made by any player
          case GameMessages.MOVE:
            if (payload.fen) {
              // The server is the source of truth, so we update the board from its message
              setFen(payload.fen);

              // Update timers from the server
              if (
                payload.whiteTimer !== undefined &&
                payload.blackTimer !== undefined
              ) {
                updateTimers(payload.whiteTimer, payload.blackTimer);
              }

              // Sync the visual board
              if (syncGameState) {
                syncGameState(payload.fen, payload.from, payload.to);
              }
            }
            break;

          // Game over
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

          // Game initialization (new game or reconnection)
          case GameMessages.INIT_GAME:
            if (payload.fen && payload.gameId && payload.color) {
              gameStore.initGame({
                color: payload.color,
                gameId: payload.gameId,
                fen: payload.fen,
                turn: payload.turn || "w",
                whiteTimer: payload.whiteTimer,
                blackTimer: payload.blackTimer,
              });

              setFen(payload.fen);
              setValidMoves(payload.validMoves);

              if (syncGameState) syncGameState(payload.fen);

              showGameMessage(
                "Game Started",
                `You are playing as ${
                  payload.color === "w" ? "White" : "Black"
                }`,
                { type: "success" }
              );
            }
            break;

          // Game active/ready state
          case GameMessages.GAME_ACTIVE:
            showGameMessage("Game Ready", "A game is ready to start!", {
              type: "success",
            });
            break;

          // Notifications
          case GameMessages.CHECK:
            showGameMessage("Check!", "You are in check.", { type: "warning" });
            break;

          case GameMessages.STALEMATE:
            showGameMessage("Stalemate", "The game is a draw.", {
              type: "info",
            });
            break;

          // Valid moves update
          case GameMessages.VALID_MOVE:
            if (payload.validMoves) {
              setValidMoves(payload.validMoves);
            } else {
              clearValidMoves();
            }
            break;

          // Opponent reconnect
          case GameMessages.OPP_RECONNECTED:
            reconnect({
              color: payload.color,
              gameId: payload.gameId,
              fen: payload.fen,
              moves: payload.moves,
              turn: payload.turn,
              whiteTimer: payload.whiteTimer,
              blackTimer: payload.blackTimer,
            });
            if (syncGameState && payload.fen) {
              syncGameState(payload.fen);
            }
            showGameMessage(
              "Opponent Reconnected",
              "Your opponent is back online.",
              { type: "info" }
            );
            break;

          // Opponent disconnected
          case GameMessages.DISCONNECTED:
            showGameMessage(
              "Opponent Disconnected",
              "Your opponent has disconnected.",
              { type: "warning" }
            );
            break;

          // Timer exceeded
          case GameMessages.TIME_EXCEEDED:
            showGameMessage(
              "Time's Up!",
              payload.message || "You ran out of time.",
              { type: "error" }
            );
            break;

          // Server error
          case GameMessages.SERVER_ERROR:
            showGameMessage(
              "Server Error",
              payload.message || "A server error occurred.",
              { type: "error" }
            );
            break;

          // Wrong player tried to move
          case GameMessages.WRONG_PLAYER_MOVE:
            showGameMessage(
              "Invalid Move",
              "It's not your turn to move.",
              { type: "error" }
            );
            break;

          // Timer updates
          case GameMessages.TIMER_UPDATE:
            if (
              payload.whiteTimer !== undefined &&
              payload.blackTimer !== undefined
            ) {
              updateTimers(payload.whiteTimer, payload.blackTimer);
            }
            break;

          // Silent handlers or unknown events
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
  }, [
    addMove,
    setFen,
    setValidMoves,
    clearValidMoves,
    updateTimers,
    endGame,
    reconnect,
    setSelectedSquare,
    syncGameState,
    gameStore,
  ]);
}
