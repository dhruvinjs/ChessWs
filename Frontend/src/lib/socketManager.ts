// lib/SocketManager.ts
import { useGameStore } from "../stores/useGameStore";
import { showGameMessage } from "../Components/chess/ChessGameMessage";
import { GameMessages } from "../constants";
import { SocketMessage } from "../types/socket";

export class SocketManager {
  private static instance: SocketManager;
  private socket: WebSocket | null = null;
  private isConnecting = false;
  private wsBaseUrl = import.meta.env.VITE_WS_URL;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // --- THIS IS THE FIX ---
  // The message handling logic is now part of the SocketManager class.
  // This avoids the stale state issues caused by the React hook.
  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      const { type, payload } = message;

      // Always get the latest state and actions from the store.
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
          break;
        case GameMessages.GAME_OVER:
          if (payload.fen) setFen(payload.fen);
          endGame(payload.winner, payload.loser);
          showGameMessage("Game Over", payload.message || "The game has ended.", { type: "info" });
          break;
        case GameMessages.INIT_GAME:
          reconnect(payload);
          if (payload.moves && payload.moves.length > 0) {
            showGameMessage("Rejoined Game", "Welcome back!", { type: "info" });
          } else {
            showGameMessage("Game Started", `You are playing as ${payload.color === "w" ? "White" : "Black"}`, { type: "success" });
          }
          break;
        case GameMessages.GAME_ACTIVE:
            showGameMessage("Game Ready", "A game is ready to start!", {
              type: "success",
            });
            break;

          case GameMessages.CHECK:
            showGameMessage("Check!", payload.message || "You are in check.", { type: "warning" });
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
      showGameMessage("Error", "There was a problem processing a server message.", { type: "error" });
    }
  }

  public init(userId: string): WebSocket | null {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return this.socket;
    }
    if (this.isConnecting) return this.socket;
    if (!userId) {
      console.warn("⚠️ Cannot initialize socket without userId.");
      return null;
    }

    const wsUrl = `${this.wsBaseUrl}/ws?guestId=${userId}`;
    this.isConnecting = true;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("✅ WebSocket connected:", wsUrl);
        this.isConnecting = false;
      };

      this.socket.onclose = (event) => {
        console.log("🔌 WebSocket disconnected", event.reason);
        this.socket = null;
        this.isConnecting = false;
      };

      this.socket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        this.socket = null;
        this.isConnecting = false;
      };

      // Assign the class method as the message handler.
      this.socket.onmessage = this.handleMessage.bind(this);

      return this.socket;
    } catch (error) {
      console.error("❌ WebSocket creation failed:", error);
      this.socket = null;
      this.isConnecting = false;
      return null;
    }
  }

  public getSocket(): WebSocket | null {
    return this.socket;
  }

  public closeSocket() {
    if (this.socket) {
      this.socket.onmessage = null; // Clean up the listener
      this.socket.close();
      this.socket = null;
    }
  }

  public send(message: SocketMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("Cannot send message, socket is not open.");
    }
  }
}
