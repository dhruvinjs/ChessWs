import { useGameStore } from "../stores/useGameStore";
import { showMessage } from "../Components";
import { GameMessages, MovePayload, RoomGameMessage } from "../types/chess";
import { launchConfetti } from "./confetti";

export class RoomSocketManager {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isManuallyDisconnecting = false;
  private reconnectTimeout: number | null = null;

  public connect(): Promise<void> {
    // If already connected, return immediately
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log(
        "✅ RoomSocket already connected, reusing existing connection"
      );
      return Promise.resolve();
    }

    // If currently connecting, wait for it to complete
    if (this.socket?.readyState === WebSocket.CONNECTING) {
      console.log("⏳ RoomSocket already connecting, waiting...");
      return new Promise((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          } else if (this.socket?.readyState === WebSocket.CLOSED) {
            clearInterval(checkConnection);
            reject(new Error("Connection failed"));
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkConnection);
          reject(new Error("Connection timeout"));
        }, 5000);
      });
    }

    console.log("🔌 Creating new RoomSocket connection...");
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host =
        import.meta.env.VITE_WS_URL?.replace(/^wss?:\/\//, "") ||
        "localhost:8080";
      const url = `${protocol}//${host}/room`;

      console.log(`🏠 [RoomSocket] Connecting to: ${url}`);
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("✅ RoomSocket connected successfully");
        this.reconnectAttempts = 0;
        resolve();
      };

      this.socket.onerror = (err) => {
        console.error("❌ RoomSocket error:", err);
        showMessage("Connection Error", "Failed to connect to room server", {
          type: "error",
        });
        reject(err);
      };

      this.socket.onclose = (event) => {
        console.log(
          `🔌 RoomSocket closed. Code: ${event.code}, Reason: ${event.reason}`
        );
        this.socket = null;

        if (this.isManuallyDisconnecting || event.code === 1000) {
          console.log("✅ Clean disconnect - not reconnecting");
          this.reconnectAttempts = 0;
          return;
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts),
            10000
          );
          console.log(
            `🔄 Attempting to reconnect room socket (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`
          );
          this.reconnectTimeout = setTimeout(() => {
            if (!this.isManuallyDisconnecting) {
              this.connect().catch((err) => {
                console.error("Failed to reconnect:", err);
              });
            }
          }, delay);
        } else {
          console.error("❌ Max reconnection attempts reached");
          showMessage(
            "Connection Lost",
            "Unable to reconnect to room server. Please refresh the page.",
            { type: "error" }
          );
        }
      };

      this.socket.onmessage = (event) => this.handleMessage(event);
    });
  }

  private handleMessage(event: MessageEvent) {
    let message: RoomGameMessage;

    try {
      message = JSON.parse(event.data);
    } catch {
      console.error("❌ Invalid room message received:", event.data);
      return;
    }

    const { type, payload } = message;
    console.log("📩 RoomSocket message received:", type, payload);

    const {
      setFen,
      endGame,
      reconnect,
      updateTimers,
      setDrawOfferReceived,
      setDrawOfferSent,
    } = useGameStore.getState();

    switch (type) {
      case GameMessages.ASSIGN_ID_FOR_ROOM:
        console.log("✅ Room ID assigned");
        break;

      case GameMessages.USER_HAS_JOINED: {
        const currentState = useGameStore.getState();
        const finalIsCreator =
          payload.isCreator !== undefined
            ? payload.isCreator
            : currentState.isRoomCreator;

        console.log(`👥 USER_HAS_JOINED:`, payload);

        useGameStore.setState({
          opponentId: payload.opponentId || null,
          opponentName: payload.opponentName || null,
          roomStatus:
            (payload.roomStatus as
              | "WAITING"
              | "FULL"
              | "CANCELLED"
              | "ACTIVE"
              | "FINISHED") || "FULL",
          isRoomCreator: finalIsCreator,
          currentUserId: payload.currentUserId || null,
          ...(payload.roomCode && { roomId: payload.roomCode }),
          ...(payload.chat &&
            payload.chat.length > 0 && { chatMsg: payload.chat }),
        });

        // Show toast when opponent joins
        if (payload.opponentId && payload.opponentName) {
          showMessage(
            "👥 Player Joined!",
            `${payload.opponentName} has joined the room`,
            { type: "success", duration: 3000 }
          );
        }
        break;
      }

      case GameMessages.INIT_ROOM_GAME: {
        const currentGameState = useGameStore.getState();
        useGameStore.setState({
          color: payload.color || null,
          fen: payload.fen || currentGameState.fen,
          whiteTimer: payload.whiteTimer || 600,
          blackTimer: payload.blackTimer || 600,
          opponentId: payload.opponentId || null,
          gameId: payload.roomGameId?.toString() || null,
          roomGameId: payload.roomGameId || null,
          gameStatus: GameMessages.GAME_ACTIVE,
          gameStarted: true,
          validMoves: payload.validMoves || [],
          moves: [],
          capturedPieces: [],
          isRoomCreator: currentGameState.isRoomCreator,
          roomStatus: "ACTIVE",
        });

        showMessage(
          "🎮 Game Started!",
          `You are ${payload.color === "w" ? "⚪ White" : "⚫ Black"}`,
          { type: "success" }
        );
        break;
      }

      case GameMessages.ROOM_MOVE: {
        const roomGameState = useGameStore.getState();
        const currentMoves = roomGameState.moves || [];
        const currentCapturedPieces = roomGameState.capturedPieces || [];

        useGameStore.setState({
          fen: payload.fen || roomGameState.fen,
          validMoves: payload.validMoves || [],
          moves: payload.move ? [...currentMoves, payload.move] : currentMoves,
          capturedPieces: payload.capturedPiece
            ? [...currentCapturedPieces, payload.capturedPiece]
            : currentCapturedPieces,
          selectedSquare: null,
        });
        break;
      }

      case GameMessages.ROOM_TIMER_UPDATE:
        if (
          payload.whiteTimer !== undefined &&
          payload.blackTimer !== undefined
        ) {
          updateTimers(payload.whiteTimer, payload.blackTimer);
        }
        break;

      case GameMessages.ROOM_GAME_OVER: {
        if (payload.fen) setFen(payload.fen);
        endGame(payload.winner || null, payload.loser || null);

        if (payload.roomStatus) {
          useGameStore.setState({
            roomStatus: payload.roomStatus as
              | "WAITING"
              | "FULL"
              | "CANCELLED"
              | "ACTIVE"
              | "FINISHED",
          });
        }
        if (payload.gameStatus) {
          useGameStore.setState({ gameStatus: payload.gameStatus });
        }

        if (
          payload.reason === "ROOM_TIME_EXCEEDED" ||
          payload.reason === "room_timer_exceeded"
        ) {
          // Don't show duplicate toast
        } else if (payload.message?.includes("won")) {
          showMessage("🏆 Victory!", payload.message, { type: "success" });
          launchConfetti();
        } else if (
          payload.message &&
          (payload.message.includes("lost") ||
            payload.message.includes("resigned"))
        ) {
          showMessage("Game Over", payload.message, { type: "info" });
        } else if (payload.reason === "draw" || payload.winner === "draw") {
          showMessage("🤝 Draw", payload.message || "Game ended in a draw", {
            type: "info",
          });
        }

        setTimeout(() => {
          window.location.href = "/home";
        }, 3000);
        break;
      }

      case GameMessages.ROOM_TIME_EXCEEDED:
        endGame(payload.winner || null, payload.loser || null);
        showMessage("⏰ Time's Up!", payload.message || "Time ran out!", {
          type: "error",
        });
        break;

      case GameMessages.ROOM_DRAW:
        endGame("draw", null);

        if (payload.roomStatus) {
          useGameStore.setState({
            roomStatus: payload.roomStatus as
              | "WAITING"
              | "FULL"
              | "CANCELLED"
              | "ACTIVE"
              | "FINISHED",
          });
        }
        if (payload.gameStatus) {
          useGameStore.setState({ gameStatus: payload.gameStatus });
        }

        showMessage("🤝 Draw", payload.message || "Game ended in a draw", {
          type: "info",
        });
        break;

      case GameMessages.CHECK:
        showMessage("⚠️ Check!", payload.message || "King is under attack", {
          type: "warning",
        });
        break;

      case GameMessages.OFFER_DRAW:
        setDrawOfferSent(true);
        showMessage(
          "🤝 Draw Offer Sent",
          payload.message || "Waiting for opponent's response...",
          { type: "info" }
        );
        break;

      case GameMessages.DRAW_OFFERED:
        setDrawOfferReceived(true);
        showMessage(
          "🤝 Draw Offer Received",
          "Your opponent has offered a draw",
          { type: "info" }
        );
        break;

      case GameMessages.DRAW_ACCEPTED:
        setDrawOfferSent(false);
        setDrawOfferReceived(false);
        endGame("draw", null);
        showMessage("🤝 Draw Accepted", "The game ended in a draw.", {
          type: "success",
        });
        break;

      case GameMessages.DRAW_REJECTED:
        setDrawOfferSent(false);
        setDrawOfferReceived(false);
        showMessage(
          "❌ Draw Rejected",
          "Your opponent rejected the draw offer",
          { type: "info" }
        );
        break;

      case GameMessages.DRAW_LIMIT_REACHED:
        setDrawOfferSent(false);
        showMessage(
          "⚠️ Draw Limit Reached",
          payload.message || "You've used all your draw offers.",
          { type: "warning" }
        );
        break;

      case GameMessages.ROOM_RECONNECT:
        if (payload.roomGameId && payload.fen && payload.color) {
          reconnect({
            fen: payload.fen,
            color: payload.color,
            gameId: payload.roomGameId.toString(),
            whiteTimer: payload.whiteTimer || 600,
            blackTimer: payload.blackTimer || 600,
            validMoves: payload.validMoves || [],
            moves: payload.moves || [],
            count: payload.count,
            capturedPieces: payload.capturedPieces,
            opponentId: payload.opponentId || null,
            opponentName: payload.opponentName || null,
          });

          if (payload.chat && Array.isArray(payload.chat)) {
            useGameStore.setState({
              chatMsg: payload.chat,
            });
          }
        }

        if (payload.roomCode && payload.isCreator !== undefined) {
          useGameStore.setState({
            roomId: payload.roomCode,
            isRoomCreator: payload.isCreator,
            opponentId: payload.opponentId || null,
            opponentName: payload.opponentName || null,
            roomGameId: payload.roomGameId || null,
            roomStatus: "ACTIVE",
            gameStarted: true,
            validMoves: payload.validMoves || [],
          });
        }

        console.log("🔄 Reconnected to room game");
        break;

      case GameMessages.ROOM_LEFT: {
        console.log("🚪 ROOM_LEFT received:", payload);

        if (payload.roomStatus) {
          useGameStore.setState({
            roomStatus: payload.roomStatus as
              | "WAITING"
              | "FULL"
              | "CANCELLED"
              | "ACTIVE"
              | "FINISHED",
          });
        }
        if (payload.gameStatus) {
          useGameStore.setState({ gameStatus: payload.gameStatus });
        }

        const { exitRoom } = useGameStore.getState();
        exitRoom();

        // Only disconnect after navigating
        showMessage("Room Left", payload.message || "You have left the room.", {
          type: "info",
        });

        setTimeout(() => {
          if (window.location.pathname.includes("/room/")) {
            console.log("🔌 Disconnecting socket after leaving room");
            this.disconnect();
            window.location.href = "/room";
          }
        }, 1000);
        break;
      }

      // ✅ FIXED: Proper handling of ROOM_OPPONENT_LEFT
      case GameMessages.ROOM_OPPONENT_LEFT: {
        if (payload.roomStatus === "CANCELLED") {
          console.log("🔴 Room CANCELLED - exiting and redirecting...");

          useGameStore.setState({
            roomStatus: "CANCELLED",
            opponentId: null,
            opponentName: null,
            chatMsg: [],
          });

          const { exitRoom } = useGameStore.getState();
          exitRoom();

          this.disconnect();

          showMessage(
            "❌ Room Cancelled",
            payload.message || "Room creator left. Room has been cancelled.",
            { type: "error", duration: 4000 }
          );

          setTimeout(() => {
            console.log("🔄 Redirecting to /room");
            window.location.href = "/room";
          }, 2000);
        } else if (payload.roomStatus === "WAITING") {
          console.log("⏳ Room status changed to WAITING - clearing opponent");

          // Update state to reflect opponent leaving
          useGameStore.setState({
            roomStatus: "WAITING",
            opponentId: null,
            opponentName: null,
            chatMsg: [],
          });

          // Show prominent toast notification
          showMessage(
            "🚪 Opponent Left",
            payload.message ||
              "Opponent left the room. Waiting for new player...",
            { type: "warning", duration: 5000 }
          );

          console.log("✅ State updated - room now WAITING for new player");
        }
        break;
      }

      case GameMessages.ROOM_READY_TO_START: {
        const currentStore = useGameStore.getState();
        useGameStore.setState({
          roomStatus: "FULL",
          isRoomCreator: currentStore.isRoomCreator,
        });
        break;
      }

      case GameMessages.OPP_ROOM_RECONNECTED:
        showMessage(
          "🔌 Opponent Reconnected",
          payload.message || "Your opponent is back",
          { type: "info" }
        );
        break;

      case GameMessages.ROOM_OPP_DISCONNECTED:
        showMessage(
          "🔴 Opponent Disconnected",
          payload.message || "Waiting for reconnection...",
          { type: "warning" }
        );
        break;

      case GameMessages.ILLEGAL_ROOM_MOVE:
        showMessage(
          "❌ Illegal Move",
          payload.message || "That move is not allowed",
          { type: "error" }
        );
        break;

      case GameMessages.ROOM_GAME_NOT_FOUND:
        showMessage(
          "❌ Game Not Found",
          payload.message || "Room game not found",
          { type: "error" }
        );
        break;

      case GameMessages.ROOM_NOT_FOUND:
        showMessage(
          "❌ Room Not Found",
          payload.message || "Room doesn't exist",
          { type: "error" }
        );
        break;

      case GameMessages.ROOM_NOT_READY:
        console.log("⏳ Room not ready - waiting for players");
        break;

      case GameMessages.ROOM_GAME_ACTIVE_ERROR:
        showMessage(
          "⚠️ Game Active",
          payload.message || "Game already in progress",
          { type: "error" }
        );
        break;

      case GameMessages.UNAUTHORIZED:
        showMessage("🚫 Unauthorized", payload.message || "Permission denied", {
          type: "error",
        });
        break;

      case GameMessages.PAYLOAD_ERROR:
        showMessage(
          "❌ Invalid Request",
          payload.message || "Request data is invalid",
          { type: "error" }
        );
        break;

      case GameMessages.NO_ROOM_RECONNECTION:
        showMessage(
          "❌ Cannot Reconnect",
          payload.message || "Unable to reconnect",
          { type: "error" }
        );
        break;

      case GameMessages.WRONG_PLAYER_MOVE:
        showMessage(
          "🚫 Not Your Turn",
          payload.message || "Wait for your opponent",
          { type: "error" }
        );
        break;

      case GameMessages.SERVER_ERROR:
        showMessage(
          "💥 Server Error",
          payload.message || "Something went wrong on the server",
          { type: "error" }
        );
        break;

      case GameMessages.ROOM_CHAT: {
        const currentChatMessages = useGameStore.getState().chatMsg || [];
        useGameStore.setState({
          chatMsg: [
            ...currentChatMessages,
            {
              sender: payload.sender!,
              message: payload.message!,
              timestamp: payload.timestamp!,
            },
          ],
        });
        break;
      }

      default:
        console.warn(`Unknown room message type: ${type}`);
    }
  }

  public startGame(roomCode: string) {
    console.log("🎮 Starting game for room:", roomCode);
    this.send({
      type: GameMessages.INIT_ROOM_GAME,
      payload: { roomCode },
    });
  }

  public makeMove(roomGameId: number, move: MovePayload) {
    console.log("📤 Sending room move:", { roomGameId, move });
    this.send({
      type: GameMessages.ROOM_MOVE,
      payload: { roomGameId, ...move },
    });
  }

  public resignGame(roomGameId: number) {
    console.log("👋 Resigning from room game:", roomGameId);
    this.send({
      type: GameMessages.ROOM_LEAVE_GAME,
      payload: { roomGameId },
    });
  }

  public sendChatMessage(
    roomGameId: number | null,
    roomId: string | null,
    message: string
  ) {
    const payload: { message: string; roomGameId?: number; roomId?: string } = {
      message,
    };
    if (roomGameId) {
      payload.roomGameId = roomGameId;
    }
    if (roomId) {
      payload.roomId = roomId;
    }

    this.send({
      type: GameMessages.ROOM_CHAT,
      payload: payload,
    });
  }

  public leaveRoom(roomId: string) {
    console.log("🚪 Leaving room:", roomId);
    this.send({
      type: GameMessages.LEAVE_ROOM,
      payload: { roomId },
    });
  }

  public offerDraw(roomGameId: number) {
    this.send({
      type: GameMessages.OFFER_DRAW,
      payload: { roomGameId },
    });
  }

  public acceptDraw(roomGameId: number) {
    this.send({
      type: GameMessages.ACCEPT_DRAW,
      payload: { roomGameId },
    });
  }

  public rejectDraw(roomGameId: number) {
    this.send({
      type: GameMessages.REJECT_DRAW,
      payload: { roomGameId },
    });
  }

  public reconnect(roomGameId: number) {
    this.send({
      type: GameMessages.ROOM_RECONNECT,
      payload: { roomGameId },
    });
  }

  private send(msg: RoomGameMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error(
        "❌ Cannot send - room socket not connected. State:",
        this.socket?.readyState
      );
      showMessage("Connection Error", "Connection lost", { type: "error" });
      return;
    }
    console.log("📤 Sending room message:", msg.type, msg.payload);
    this.socket.send(JSON.stringify(msg));
  }

  // ✅ FIXED: Proper disconnect method without duplicates
  public disconnect() {
    console.log("🔌 Disconnecting room socket...");

    // Clear any pending reconnection timeouts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Set flag to prevent auto-reconnect
    this.isManuallyDisconnecting = true;
    this.reconnectAttempts = 0;

    // Close socket if exists
    if (this.socket) {
      this.socket.close(1000, "Client disconnect");
      this.socket = null;
    }

    // Reset flag after a short delay to allow for intentional reconnections
    setTimeout(() => {
      this.isManuallyDisconnecting = false;
    }, 1000);
  }

  public isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public getConnectionState() {
    if (!this.socket) return "disconnected";
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "unknown";
    }
  }
}

export const roomSocketManager = new RoomSocketManager();
