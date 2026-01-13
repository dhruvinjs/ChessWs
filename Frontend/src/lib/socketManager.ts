// lib/SocketManager.ts
import { useGameStore } from "../stores/useGameStore";
import { showMessage } from "../Components";
import { GameMessages } from "../types/chess";
import { GameModes, SocketMessage } from "../types/socket";
import { launchConfetti } from "./confetti";

export class SocketManager {
  private static instance: SocketManager;
  private socket: WebSocket | null = null;
  private wsBaseUrl = import.meta.env.VITE_WS_URL;
  private currentConnectionType: GameModes | null = null;

  private constructor() { }

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

      console.log("🔌 WebSocket message received:", type, payload);

      const {
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
        // ========================================
        // SILENT / CONSOLE ONLY - Internal Setup
        // ========================================
        // case GameMessages.ASSIGN_ID:
        //   break;

        // case GameMessages.ASSIGN_ID_FOR_ROOM:
        //   break;

        // ========================================
        // GAME MECHANICS - No Toast Needed
        // ========================================
        case GameMessages.MOVE: {
          const {
            move: guestMove,
            fen: guestMoveFen,
            validMoves: guestMoveValidMoves,
            capturedPiece: guestCapturedPiece,
            whiteTimer: guestWhiteTimer,
            blackTimer: guestBlackTimer,
          } = payload;

          console.log("📥 MOVE received:", {
            guestMoveFen,
            guestMove,
            validMovesCount: guestMoveValidMoves?.length,
            myColor: useGameStore.getState().color,
          });

          // Update game state with new position and captured piece (same pattern as ROOM_MOVE)
          const guestGameState = useGameStore.getState();
          const currentMoves = guestGameState.moves || [];
          const currentCapturedPieces = guestGameState.capturedPieces || [];

          useGameStore.setState({
            fen: guestMoveFen,
            validMoves: guestMoveValidMoves || [],
            moves: guestMove ? [...currentMoves, guestMove] : currentMoves,
            capturedPieces: guestCapturedPiece
              ? [...currentCapturedPieces, guestCapturedPiece]
              : currentCapturedPieces,
            whiteTimer: guestWhiteTimer ?? guestGameState.whiteTimer,
            blackTimer: guestBlackTimer ?? guestGameState.blackTimer,
            selectedSquare: null,
          });

          break;
        }

        // ========================================
        // GAME END - Keep Toasts (Important)
        // ========================================
        case GameMessages.GAME_OVER: {
          if (payload.fen) setFen(payload.fen);
          endGame(payload.winner, payload.loser);

          const { color } = useGameStore.getState();
          if (color === payload.winner) {
            showMessage("🏆 You Won!", payload.message || "Congratulations!", {
              type: "success",
            });
            launchConfetti();
          } else if (payload.winner === "draw") {
            showMessage("🤝 Draw", payload.message || "Game ended in a draw", {
              type: "info",
            });
          } else {
            showMessage(
              "� Game Over",
              payload.message || "Better luck next time",
              { type: "error" }
            );
          }
          break;
        }

        // ========================================
        // DRAW ACTIONS - Keep Toasts (Interactive)
        // ========================================

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
          break;

        case GameMessages.GAME_DRAW:
          setDrawOfferSent(false);
          setDrawOfferReceived(false);
          endGame("draw", null);
          showMessage("🤝 Draw", payload.reason || "Game ended in a draw.", {
            type: "info",
          });
          break;

        case GameMessages.DRAW_LIMIT_REACHED:
          setDrawOfferSent(false);
          showMessage(
            "⚠️ Draw Limit Reached",
            payload.message || "You've used all your draw offers.",
            { type: "warning" }
          );
          break;

        case GameMessages.DRAW_COOLDOWN:
          showMessage(
            "⏳ Cooldown Active",
            payload.message || "Please wait before offering another draw.",
            { type: "warning" }
          );
          break;

        // ========================================
        // GAME START - Keep Toast
        // ========================================
        case GameMessages.INIT_GAME: {
          const isReconnection = payload.moves && payload.moves.length > 0;

          if (isReconnection) {
            reconnect(payload);
            // console.log("🔄 Reconnected to game");
          } else {
            initGame(payload);
            showMessage(
              "🎯 Match Started",
              `You are ${payload.color === "w" ? "⚪ White" : "⚫ Black"}`,
              { type: "success" }
            );
          }
          break;
        }

        // ========================================
        // RECONNECTION - Silent (Just Restore State)
        // ========================================

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
            count,
            capturedPieces,
          } = payload;

          // console.log("[RECONNECT] restoring game state", payload);
          useGameStore.getState().reconnect({
            fen,
            color,
            opponentId,
            gameId,
            whiteTimer,
            blackTimer,
            validMoves,
            moves,
            count,
            capturedPieces,
          });
          // .log("🔄 Reconnected to game");
          break;
        }

        // ========================================
        // GAME STATUS - Silent (UI State Only)
        // ========================================
        case GameMessages.GAME_ACTIVE:
          // .log("✅ Game is active");
          break;

        // ========================================
        // IN-GAME ALERTS - Keep Toast (Important)
        // ========================================

        case GameMessages.CHECK:
          showMessage("⚠️ Check!", payload.message || "King is under attack", {
            type: "warning",
          });
          break;

        case GameMessages.STALEMATE:
          // Already handled by game end state
          // console.log("Stalemate detected");
          break;

        // ========================================
        // CONNECTION STATUS - Keep Toast (Important)
        // ========================================

        case GameMessages.OPP_RECONNECTED:
          setOppStatus(true);
          showMessage("🔌 Opponent Reconnected", "Your opponent is back", {
            type: "info",
          });
          break;

        case GameMessages.DISCONNECTED:
          setOppStatus(false);
          showMessage(
            "🔴 Opponent Disconnected",
            "Waiting for reconnection...",
            { type: "warning" }
          );
          break;

        // ========================================
        // TIMER & ERRORS - Keep Toast
        // ========================================

        case GameMessages.TIME_EXCEEDED:
          endGame(payload.winner, payload.loser);
          showMessage("⏰ Time's Up!", payload.message || "Time ran out!", {
            type: "error",
          });
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
            payload.message || "Wait for your opponent",
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

        case GameMessages.USER_HAS_JOINED: {
          const {
            opponentId: joinedOpponentId,
            opponentName,
            roomCode,
            roomStatus: joinRoomStatus,
            isCreator: joinIsCreator,
          } = payload;

          // Use provided creator status or preserve existing
          const currentState = useGameStore.getState();
          const finalIsCreator =
            joinIsCreator !== undefined
              ? joinIsCreator
              : currentState.isRoomCreator;

          console.log(`👥 USER_HAS_JOINED received:`, {
            opponentId: joinedOpponentId,
            opponentName,
            roomCode,
            roomStatus: joinRoomStatus,
            isCreator: finalIsCreator,
            currentRoomId: currentState.roomId,
          });

          useGameStore.setState({
            opponentId: joinedOpponentId,
            opponentName: opponentName,
            roomStatus: joinRoomStatus || "FULL",
            isRoomCreator: finalIsCreator,
            // Update room code if provided
            ...(roomCode && { roomId: roomCode }),
          });

          console.log(
            `✅ ${opponentName} joined room - isCreator=${finalIsCreator}, roomStatus=${joinRoomStatus || "FULL"
            }`
          );
          // Room header will show this visually
          break;
        }

        // ========================================
        // ROOM GAME START - Keep Toast
        // ========================================

        case GameMessages.INIT_ROOM_GAME: {
          const {
            color: roomColor,
            fen: roomFen,
            whiteTimer,
            blackTimer,
            opponentId: roomOppId,
            roomGameId,
            validMoves: initRoomValidMoves,
          } = payload;

          // Preserve existing room state while starting game
          const currentGameState = useGameStore.getState();
          useGameStore.setState({
            color: roomColor,
            fen: roomFen,
            whiteTimer,
            blackTimer,
            opponentId: roomOppId,
            gameId: roomGameId,
            roomGameId: roomGameId,
            gameStatus: GameMessages.GAME_ACTIVE,
            gameStarted: true,
            validMoves: initRoomValidMoves || [],
            moves: [],
            // Explicitly preserve creator status
            isRoomCreator: currentGameState.isRoomCreator,
            roomStatus: "ACTIVE",
          });

          showMessage(
            "🎮 Game Started!",
            `You are ${roomColor === "w" ? "⚪ White" : "⚫ Black"}`,
            { type: "success" }
          );
          break;
        }

        // ========================================
        // ROOM GAME MECHANICS - No Toast
        // ========================================
        case GameMessages.ROOM_MOVE: {
          const {
            move: roomMove,
            fen: roomMoveFen,
            validMoves: roomMoveValidMoves,
            capturedPiece: roomCapturedPiece,
          } = payload;

          // Update game state with new position and captured piece
          const roomGameState = useGameStore.getState();
          const currentMoves = roomGameState.moves || [];
          const currentCapturedPieces = roomGameState.capturedPieces || [];

          useGameStore.setState({
            fen: roomMoveFen,
            validMoves: roomMoveValidMoves || [],
            moves: roomMove ? [...currentMoves, roomMove] : currentMoves,
            capturedPieces: roomCapturedPiece
              ? [...currentCapturedPieces, roomCapturedPiece]
              : currentCapturedPieces,
            selectedSquare: null,
          });
          break;
        }

        // ========================================
        // ROOM GAME END - Keep Toast
        // ========================================
        case GameMessages.ROOM_GAME_OVER: {
          const {
            winner: roomWinner,
            loser: roomLoser,
            message: gameOverMsg,
            reason,
            roomStatus,
            gameStatus,
          } = payload;

          if (payload.fen) setFen(payload.fen);
          endGame(roomWinner, roomLoser);

          // Update room and game status if provided
          if (roomStatus) {
            useGameStore.setState({ roomStatus });
          }
          if (gameStatus) {
            useGameStore.setState({ gameStatus });
          }

          // Determine if message indicates win, lose, or draw based on message content or reason
          if (gameOverMsg && gameOverMsg.includes("won")) {
            // Winner message
            showMessage("🏆 Victory!", gameOverMsg || "Congratulations!", {
              type: "success",
            });
            launchConfetti();
          } else if (
            gameOverMsg &&
            (gameOverMsg.includes("lost") || gameOverMsg.includes("resigned"))
          ) {
            // Loser message (for person who resigned)
            showMessage("Game Over", gameOverMsg, { type: "info" });
          } else if (reason === "draw") {
            showMessage("🤝 Draw", gameOverMsg || "Game ended in a draw", {
              type: "info",
            });
          }

          // Auto-exit room after game ends (5 seconds delay to see results)
          setTimeout(() => {
            const { exitRoom } = useGameStore.getState();
            exitRoom();
            showMessage(
              "Room Closed",
              "Game has ended. Returning to lobby...",
              { type: "info" }
            );
            // Navigate to room lobby
            if (window.location.pathname.includes("/room/")) {
              window.location.href = "/room";
            }
          }, 5000);
          break;
        }

        // ========================================
        // ROOM TIMERS - No Toast
        // ========================================
        case GameMessages.ROOM_TIMER_UPDATE:
          if (
            payload.whiteTimer !== undefined &&
            payload.blackTimer !== undefined
          ) {
            updateTimers(payload.whiteTimer, payload.blackTimer);
          }
          break;

        // ========================================
        // ROOM ERRORS - Keep Toast
        // ========================================
        case GameMessages.ROOM_TIME_EXCEEDED: {
          const { winner: timeWinner, loser: timeLoser } = payload;
          endGame(timeWinner, timeLoser);
          showMessage("⏰ Time's Up!", payload.message || "Time ran out!", {
            type: "error",
          });
          break;
        }

        case GameMessages.ILLEGAL_ROOM_MOVE:
          showMessage(
            "❌ Illegal Move",
            payload.message || "That move is not allowed",
            { type: "error" }
          );
          break;

        case GameMessages.ROOM_DRAW:
          endGame("draw", null);

          // Update room and game status if provided
          if (payload.roomStatus) {
            useGameStore.setState({ roomStatus: payload.roomStatus });
          }
          if (payload.gameStatus) {
            useGameStore.setState({ gameStatus: payload.gameStatus });
          }

          showMessage("🤝 Draw", payload.message || "Game ended in a draw", {
            type: "info",
          });

          // Auto-exit room after draw (5 seconds delay)
          setTimeout(() => {
            const { exitRoom } = useGameStore.getState();
            exitRoom();
            showMessage(
              "Room Closed",
              "Game has ended in a draw. Returning to lobby...",
              { type: "info" }
            );
            // Navigate to room lobby
            if (window.location.pathname.includes("/room/")) {
              window.location.href = "/room";
            }
          }, 5000);
          break;

        // ========================================
        // ROOM RECONNECTION - Silent
        // ========================================
        case GameMessages.ROOM_RECONNECT:
          // Reconnect with game state
          reconnect(payload);

          // Also sync room state if provided
          if (payload.roomCode && payload.isCreator !== undefined) {
            useGameStore.setState({
              roomId: payload.roomCode,
              isRoomCreator: payload.isCreator,
              opponentId: payload.opponentId,
              opponentName: payload.opponentName,
              roomGameId: payload.roomGameId || payload.gameId,
              roomStatus: "ACTIVE",
              gameStarted: true,
              // Ensure valid moves are set from reconnection
              validMoves: payload.validMoves || [],
            });
            // console.log(
            //   `🔄 Room reconnection - syncing host status: isCreator=${payload.isCreator}`
            // );
          }

          console.log("🔄 Reconnected to room game");
          break;

        // ========================================
        // ROOM STATUS CHANGES - Mixed
        // ========================================
        case GameMessages.ROOM_GAME_NOT_FOUND:
          showMessage(
            "❌ Game Not Found",
            payload.message || "Room game not found",
            { type: "error" }
          );
          break;

        case GameMessages.ROOM_LEFT:
          // Update room and game status if provided
          if (payload.roomStatus) {
            useGameStore.setState({ roomStatus: payload.roomStatus });
          }
          if (payload.gameStatus) {
            useGameStore.setState({ gameStatus: payload.gameStatus });
          }

          // Show message that user resigned
          showMessage(
            "You Resigned",
            "You have left the game. Returning to lobby...",
            { type: "info" }
          );

          // Auto-navigate after resignation (2 seconds delay)
          setTimeout(() => {
            const { exitRoom } = useGameStore.getState();
            exitRoom();
            if (window.location.pathname.includes("/room/")) {
              window.location.href = "/room";
            }
          }, 2000);

          // console.log("👋 Left room");
          break;

        case GameMessages.ROOM_READY_TO_START: {
          // Update room state to FULL while preserving creator status
          const currentStore = useGameStore.getState();
          useGameStore.setState({
            roomStatus: "FULL",
            isRoomCreator: currentStore.isRoomCreator,
          });
          // console.log(`✅ Room ready - both players present`);
          // UI will show "Start Game" button - no toast needed
          break;
        }

        // ========================================
        // ROOM CONNECTION STATUS - Keep Toast
        // ========================================

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

        // ========================================
        // ROOM ERRORS - Keep Toast
        // ========================================

        case GameMessages.ROOM_NOT_FOUND:
          showMessage(
            "❌ Room Not Found",
            payload.message || "Room doesn't exist",
            { type: "error" }
          );
          break;

        case GameMessages.ROOM_NOT_READY:
          // Room is waiting for opponent - no toast needed
          // console.log("⏳ Room not ready - waiting for players");
          break;

        case GameMessages.ROOM_GAME_ACTIVE_ERROR:
          showMessage(
            "⚠️ Game Active",
            payload.message || "Game already in progress",
            { type: "error" }
          );
          break;

        case GameMessages.UNAUTHORIZED:
          showMessage(
            "🚫 Unauthorized",
            payload.message || "Permission denied",
            { type: "error" }
          );
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

        // ========================================
        // CHAT - Handle in UI (No Toast)
        // ========================================

        case GameMessages.ROOM_CHAT: {
          // Add chat message to store
          const { sender, message: chatMessage, timestamp } = payload;
          const currentChatMessages = useGameStore.getState().chatMsg || [];
          useGameStore.setState({
            chatMsg: [
              ...currentChatMessages,
              {
                sender,
                message: chatMessage,
                timestamp,
              },
            ],
          });
          // console.log("💬 Chat message received from user:", sender);
          break;
        }

        // ========================================
        // QUEUE/MATCHMAKING MESSAGES
        // ========================================

        case GameMessages.ALREADY_IN_QUEUE:
          // Player is already in queue - restore searching state (e.g., after page reload)
          // console.log("⏳ ALREADY_IN_QUEUE received - restoring search state");
          // Always restore searching state when player is in queue
          useGameStore.setState({
            gameStatus: GameMessages.SEARCHING,
            gameStarted: false,
          });
          // Don't show toast on page reload to avoid spam
          break;

        case GameMessages.QUEUE_EXPIRED:
          // Queue expired after waiting too long
          useGameStore.setState({
            gameStatus: undefined,
            gameStarted: false,
          });
          showMessage(
            "⏰ Queue Expired",
            payload.message || "Matchmaking session expired. Please try again.",
            { type: "error" }
          );
          break;

        case GameMessages.NO_ACTIVE_USERS:
          // No active users to match with
          // console.log("👥 No active users in queue");
          showMessage(
            "🔍 Still Searching",
            payload.message || "No opponents available yet. Please wait...",
            { type: "info" }
          );
          break;

        case GameMessages.MATCH_NOT_FOUND:
          // No immediate match found, player added to queue
          // console.log("🔍 No match found, added to queue");
          // Keep searching state - match will be found when another player joins
          break;

        case GameMessages.SEARCH_CANCELLED:
          // Search was cancelled by user
          // console.log("🛑 Search cancelled");
          useGameStore.setState({
            gameStatus: undefined,
            gameStarted: false,
          });
          showMessage(
            "🛑 Search Cancelled",
            payload.message || "Matchmaking cancelled.",
            { type: "info" }
          );
          break;

        // ========================================
        // UNKNOWN MESSAGE TYPE
        // ========================================

        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      showMessage("Error", "There was a problem processing a server message.", {
        type: "error",
      });
    }
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public init(type: GameModes, userId?: number | string): void {
    console.log(
      `🔧 SocketManager.init called with type: ${type}, userId: ${userId}, currentType: ${this.currentConnectionType}`
    );

    // If trying to connect to a DIFFERENT type, close the existing connection first
    if (this.currentConnectionType && this.currentConnectionType !== type) {
      console.log(
        `🔄 Switching from ${this.currentConnectionType} to ${type} - closing old connection`
      );
      this.closeSocket();
    }

    // If already connected to the SAME type, don't reconnect
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN &&
      this.currentConnectionType === type
    ) {
      console.log(`✅ Already connected to ${type} WebSocket`);
      return;
    }

    // If currently connecting, let it finish
    if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
      console.log(`⏳ WebSocket is already connecting...`);
      return;
    }

    // Close existing socket if any
    if (this.socket) {
      console.log(`🔌 Closing existing socket before reconnecting...`);
      this.closeSocket();
    }

    let wsUrl = "";

    switch (type) {
      case "guest":
        if (!userId) {
          console.error("❌ No valid ID provided for guest. userId:", userId);
          return;
        }
        wsUrl = `${this.wsBaseUrl}/guest?id=${userId}`;
        console.log(`🎮 Creating guest WebSocket connection to: ${wsUrl}`);
        break;

      case "room":
        if (!userId || typeof userId !== "number") {
          console.error(
            "❌ No valid user ID provided for room game. userId:",
            userId
          );
          return;
        }
        wsUrl = `${this.wsBaseUrl}/room?userId=${userId}`;
        console.log(`🏠 Creating room WebSocket connection to: ${wsUrl}`);
        break;

      case "computer":
        wsUrl = `${this.wsBaseUrl}/computer`;
        console.log(`🤖 Creating computer WebSocket connection to: ${wsUrl}`);
        break;

      default:
        console.error("❌ Invalid game type:", type);
        return;
    }

    try {
      console.log(`🚀 Attempting to create WebSocket...`);
      this.socket = new WebSocket(wsUrl);
      this.currentConnectionType = type;

      this.socket.onopen = () => {
        console.log(`✅ Successfully connected to ${type} WebSocket:`, wsUrl);
      };

      this.socket.onclose = (event) => {
        console.log(
          `🔌 ${type} WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`
        );
        this.socket = null;
        this.currentConnectionType = null;
      };

      this.socket.onerror = (err) => {
        console.error(`❌ ${type} WebSocket error:`, err);
      };

      this.socket.onmessage = this.handleMessage.bind(this);

      console.log(`📡 WebSocket instance created, waiting for connection...`);
    } catch (error) {
      console.error(`❌ Failed to create WebSocket:`, error);
      this.currentConnectionType = null;
    }
  }

  public getSocket(): WebSocket | null {
    return this.socket;
  }

  public closeSocket() {
    if (this.socket) {
      this.socket.onmessage = null;
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.close();
      this.socket = null;
      this.currentConnectionType = null;
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
