// lib/SocketManager.ts
import { useGameStore } from "../stores/useGameStore";
import { showMessage } from "../Components";
import { GameMessages } from "../types/chess";
import { GameModes, SocketMessage } from "../types/socket";
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
      setDrawOfferCount,
    } = useGameStore.getState();
    
      switch (type) {
        case GameMessages.ASSIGN_ID:
          console.log("Assign Id");
          showMessage("Assign ID", "Guest Id Assigned", { type: "info" });
          break;

        case GameMessages.MOVE:
          processServerMove(payload);
          break;

        case GameMessages.GAME_OVER:
          if (payload.fen) setFen(payload.fen);
          endGame(payload.winner, payload.loser);

          const { color } = useGameStore.getState();
          if (color === payload.winner) {
            showMessage(
              "🏆 You Won!",
              payload.message || "Congratulations! You won the match.",
              { type: "success" }
            );
            launchConfetti();
          } else {
            showMessage(
              "👎 You Lost!",
              payload.message || "Better luck next time!",
              { type: "error" }
            );
          }
          break;

       case GameMessages.OFFER_DRAW:
        setDrawOfferSent(true);
        setDrawOfferCount(payload.count)
        showMessage(
          "🤝 Draw Offer Sent", 
          payload.message || "Waiting for opponent\'s response...", 
          { type: "info" }
        );
        break;

      // ✅ Draw offer received from opponent
      case GameMessages.DRAW_OFFERED:
        setDrawOfferReceived(true);
        showMessage(
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
        showMessage(
          "🤝 Draw Accepted", 
          "The game ended in a draw.", 
          { type: "success" }
        );
        break;

      // ✅ Draw rejected - continue playing
      case GameMessages.DRAW_REJECTED:
        setDrawOfferSent(false);
        setDrawOfferReceived(false);
        showMessage(
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
            showMessage(
              "🔄 Reconnected",
              "Welcome back to your game!",
              { type: "info" }
            );
          } else {
            // Handle new game initialization
            initGame(payload);
            showMessage(
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
                moves, 
                count
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
                moves,
                count // Pass moves to the store
              });

              showMessage(
                "🔄 Reconnected",
                "Welcome back to your game!",
                { type: "info" }
              );
              break;
            }

        case GameMessages.GAME_ACTIVE:
          showMessage(
            "✅ Game Ready",
            "A new match is ready to begin!",
            { type: "success" }
          );
          break;

        case GameMessages.CHECK:
          showMessage(
            "⚠️ Check!",
            payload.message || "Your king is under attack!",
            { type: "warning" }
          );
          break;

        case GameMessages.STALEMATE:
          showMessage(
            "🤝 Stalemate",
            payload.message || "It\'s a draw!",
            { type: "info" }
          );
          break;

        case GameMessages.OPP_RECONNECTED:
          setOppStatus(true);
          showMessage(
            "🔌 Opponent Reconnected",
            "Your opponent is back online.",
            { type: "info" }
          );
          break;

        case GameMessages.DISCONNECTED:
          setOppStatus(false);
          showMessage(
            "🔴 Opponent Disconnected",
            "They\'ve left the game.",
            { type: "warning" }
          );
          break;

        case GameMessages.TIME_EXCEEDED:
          endGame(payload.winner, payload.loser);
          showMessage(
            "⏰ Time\'s Up!",
            payload.message || "Time ran out!",
            { type: "error" }
          );
          break;

        case GameMessages.SERVER_ERROR:
          showMessage(
            "💥 Server Error",
            "Something went wrong on the server.",
            { type: "error" }
          );
          break;

        case GameMessages.WRONG_PLAYER_MOVE:
          showMessage(
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

        // ✅ When second player joins the room (sent to room creator)
        case GameMessages.USER_HAS_JOINED:
          const { opponentId: joinedOpponentId, opponentName } = payload;
          useGameStore.setState({
            opponentId: joinedOpponentId,
            opponentName: opponentName,
            roomStatus: "FULL",
          });
          showMessage(
            "👤 Player Joined",
            `${opponentName || "A player"} has joined the room!`,
            { type: "success" }
          );
          break;

        case GameMessages.INIT_ROOM_GAME:

          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      showMessage(
        "Error",
        "There was a problem processing a server message.",
        { type: "error" }
      );
    }
  }

public init(type: GameModes, userId?: string, token?: string){
      if (this.socket) {
        const state = this.socket.readyState;
        if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
          return this.socket;
        }
      }

    if (this.isConnecting) return this.socket;

    let wsUrl = "";

    switch (type) {
      case "guest":
        if (!userId) {
          console.warn("⚠️ No guest ID provided.");
          return null;
        }
        wsUrl = `${this.wsBaseUrl}/guest?id=${userId}`;
        break;

      case "room":
        if (!token) {
          console.warn("⚠️ No auth token provided for room game.");
          return null;
        }
        wsUrl = `${this.wsBaseUrl}/room?token=${token}`;
        break;

      case "computer":
        wsUrl = `${this.wsBaseUrl}/computer`;
        break;

      default:
        console.error("❌ Invalid game type");
        return null;
    }

    this.isConnecting = true;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`✅ Connected to ${type} WebSocket:`, wsUrl);
        this.isConnecting = false;
      };

      this.socket.onclose = (event) => {
        console.log(`🔌 ${type} WebSocket closed`, event.reason);
        this.socket = null;
        this.isConnecting = false;
      };

      this.socket.onerror = (err) => {
        console.error(`❌ ${type} WebSocket error:`, err);
        this.socket = null;
        this.isConnecting = false;
      };

      this.socket.onmessage = this.handleMessage.bind(this);
      return this.socket;
    } catch (error) {
      console.error(`❌ Failed to connect ${type} socket:`, error);
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
