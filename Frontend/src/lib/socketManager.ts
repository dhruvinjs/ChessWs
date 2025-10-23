// lib/SocketManager.ts
import { useGameStore } from "../stores/useGameStore";
import { showGameMessage } from "../Components/chess/ChessGameMessage";
import { GameMessages } from "../types/chess";
import { SocketMessage } from "../types/socket";
import { launchConfetti } from "./confetti";

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

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      const { type, payload } = message;

       const {
      processServerMove,
      setFen,
      endGame,
      reconnect,
      setOppStatus,
      updateTimers,
      initGame,
      setDrawOfferReceived,
      setDrawOfferSent,
    } = useGameStore.getState();
    
      switch (type) {
        case GameMessages.ASSIGN_ID:
          console.log("Assign Id");
          showGameMessage("Assign ID", "Guest Id Assigned", { type: "info" });
          break;

        case GameMessages.MOVE:
          processServerMove(payload);
          break;

        case GameMessages.GAME_OVER:
          if (payload.fen) setFen(payload.fen);
          endGame(payload.winner, payload.loser);

          const { color } = useGameStore.getState();
          if (color === payload.winner) {
            showGameMessage(
              "🏆 You Won!",
              payload.message || "Congratulations! You won the match.",
              { type: "success" }
            );
            launchConfetti();
          } else {
            showGameMessage(
              "👎 You Lost!",
              payload.message || "Better luck next time!",
              { type: "error" }
            );
          }
          break;

       case GameMessages.OFFER_DRAW:
        setDrawOfferSent(true);
        showGameMessage(
          "🤝 Draw Offer Sent", 
          payload.message || "Waiting for opponent's response...", 
          { type: "info" }
        );
        break;

      // ✅ Draw offer received from opponent
      case GameMessages.DRAW_OFFERED:
        setDrawOfferReceived(true);
        showGameMessage(
          "🤝 Draw Offered", 
          payload.message || "Your opponent offered a draw.", 
          { type: "info" }
        );
        break;

      // ✅ Draw accepted - game ends
      case GameMessages.DRAW_ACCEPTED:
        setDrawOfferSent(false);
        setDrawOfferReceived(false);
        endGame("draw", null);
        showGameMessage(
          "🤝 Draw Accepted", 
          "The game ended in a draw.", 
          { type: "success" }
        );
        break;

      // ✅ Draw rejected - continue playing
      case GameMessages.DRAW_REJECTED:
        setDrawOfferSent(false);
        setDrawOfferReceived(false);
        showGameMessage(
          "❌ Draw Rejected", 
          payload.message || "The opponent rejected the draw offer.", 
          { type: "error" }
        );
        break;
        case GameMessages.INIT_GAME:
          // Check if this is a reconnection or a new game
          const isReconnection = payload.moves && payload.moves.length > 0;
          
          if (isReconnection) {
            // Handle reconnection
            reconnect(payload);
            showGameMessage(
              "🔄 Reconnected",
              "Welcome back to your game!",
              { type: "info" }
            );
          } else {
            // Handle new game initialization
            initGame(payload);
            showGameMessage(
              "🎯 Match Started",
              `You are playing as ${payload.color === "w" ? "⚪ White" : "⚫ Black"}.`,
              { type: "success" }
            );
          }
          break;

        case GameMessages.RECONNECT: {
              const {
                fen,
                color,
                opponentId,
                gameId,
                whiteTimer,
                blackTimer,
                validMoves,
              } = payload;

              console.log("[RECONNECT] restoring game state", payload);

              // Update your store
              useGameStore.getState().reconnect({
                fen,
                color,
                opponentId,
                gameId,
                whiteTimer,
                blackTimer,
                validMoves,
              });

              showGameMessage(
                "🔄 Reconnected",
                "Welcome back to your game!",
                { type: "info" }
              );
              break;
            }

        case GameMessages.GAME_ACTIVE:
          showGameMessage(
            "✅ Game Ready",
            "A new match is ready to begin!",
            { type: "success" }
          );
          break;

        case GameMessages.CHECK:
          showGameMessage(
            "⚠️ Check!",
            payload.message || "Your king is under attack!",
            { type: "warning" }
          );
          break;

        case GameMessages.STALEMATE:
          showGameMessage(
            "🤝 Stalemate",
            payload.message || "It's a draw!",
            { type: "info" }
          );
          break;

        case GameMessages.OPP_RECONNECTED:
          setOppStatus(true);
          showGameMessage(
            "🔌 Opponent Reconnected",
            "Your opponent is back online.",
            { type: "info" }
          );
          break;

        case GameMessages.DISCONNECTED:
          setOppStatus(false);
          showGameMessage(
            "🔴 Opponent Disconnected",
            "They've left the game.",
            { type: "warning" }
          );
          break;

        case GameMessages.TIME_EXCEEDED:
          endGame(payload.winner, payload.loser);
          showGameMessage(
            "⏰ Time's Up!",
            payload.message || "Time ran out!",
            { type: "error" }
          );
          break;

        case GameMessages.SERVER_ERROR:
          showGameMessage(
            "💥 Server Error",
            "Something went wrong on the server.",
            { type: "error" }
          );
          break;

        case GameMessages.WRONG_PLAYER_MOVE:
          showGameMessage(
            "🚫 Not Your Turn",
            payload.message || "Please wait for your opponent to move.",
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
        "There was a problem processing a server message.",
        { type: "error" }
      );
    }
  }

  public init(userId: string): WebSocket | null {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return this.socket;
    }
    if (this.isConnecting) return this.socket;
    if (!userId) {
      console.warn("⚠️ Cannot initialize socket without userId.");
      return null;
    }

    const wsUrl = `${this.wsBaseUrl}/ws?id=${userId}`;
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
      this.socket.onmessage = null;
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