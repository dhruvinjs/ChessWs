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

        case GameMessages.ASSIGN_ID_FOR_ROOM:
          console.log("✅ Room ID assigned");
          showMessage("Connected to Room", "Successfully connected to room server", { type: "info" });
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
            payload.message || "Waiting for opponent's response...", 
            { type: "info" }
          );
          break;

        case GameMessages.DRAW_OFFERED:
          setDrawOfferReceived(true);
          showMessage(
            "🤝 Draw Offered", 
            payload.message || "Your opponent offered a draw.", 
            { type: "info" }
          );
          break;

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
          const isReconnection = payload.moves && payload.moves.length > 0;
          
          if (isReconnection) {
            reconnect(payload);
            showMessage(
              "🔄 Reconnected",
              "Welcome back to your game!",
              { type: "info" }
            );
          } else {
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
          useGameStore.getState().reconnect({
            fen,
            color,
            opponentId,
            gameId,
            whiteTimer,
            blackTimer,
            validMoves,
            moves,
            count
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
            payload.message || "It's a draw!",
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
            "They've left the game.",
            { type: "warning" }
          );
          break;

        case GameMessages.TIME_EXCEEDED:
          endGame(payload.winner, payload.loser);
          showMessage(
            "⏰ Time's Up!",
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

        case GameMessages.USER_HAS_JOINED:
          const { 
            opponentId: joinedOpponentId, 
            opponentName, 
            roomCode, 
            roomStatus: joinRoomStatus, 
            isCreator: joinIsCreator 
          } = payload;
          
          // Use provided creator status or preserve existing
          const currentState = useGameStore.getState();
          const finalIsCreator = joinIsCreator !== undefined ? joinIsCreator : currentState.isRoomCreator;
          
          useGameStore.setState({
            opponentId: joinedOpponentId,
            opponentName: opponentName,
            roomStatus: joinRoomStatus || "FULL",
            isRoomCreator: finalIsCreator,
            // Update room code if provided
            ...(roomCode && { roomId: roomCode })
          });
          
          console.log(`✅ USER_HAS_JOINED - syncing state: isCreator=${finalIsCreator}, opponent=${opponentName}`);
          showMessage(
            "👤 Room Updated",
            payload.message || `${opponentName || "A player"} has joined the room!`,
            { type: "success" }
          );
          break;

        case GameMessages.INIT_ROOM_GAME:
          const { color: roomColor, fen: roomFen, whiteTimer, blackTimer, opponentId: roomOppId, roomGameId } = payload;
          
          // Preserve existing room state while starting game
          const currentGameState = useGameStore.getState();
          useGameStore.setState({
            color: roomColor,
            fen: roomFen,
            whiteTimer,
            blackTimer,
            opponentId: roomOppId,
            gameId: roomGameId,
            gameStatus: GameMessages.GAME_ACTIVE,
            // Explicitly preserve creator status
            isRoomCreator: currentGameState.isRoomCreator,
            roomStatus: "ACTIVE",
          });

          showMessage(
            "🎮 Game Started!",
            `You are playing as ${roomColor === "w" ? "⚪ White" : "⚫ Black"}`,
            { type: "success" }
          );
          break;

        // ✅ Room move received
        case GameMessages.ROOM_MOVE:
          const { move: roomMove, fen: roomMoveFen, validMoves: roomValidMoves } = payload;
          
          useGameStore.setState({
            fen: roomMoveFen,
            validMoves: roomValidMoves || [],
          });

          // Add move to history if needed
          if (roomMove) {
            const currentMoves = useGameStore.getState().moves || [];
            useGameStore.setState({
              moves: [...currentMoves, roomMove],
            });
          }
          break;

        // ✅ Room game over
        case GameMessages.ROOM_GAME_OVER:
          const { result, winner: roomWinner, loser: roomLoser, message: gameOverMsg } = payload;
          
          if (payload.fen) setFen(payload.fen);
          endGame(roomWinner, roomLoser);

          if (result === "win") {
            showMessage("🏆 You Won!", gameOverMsg || "Congratulations!", { type: "success" });
            launchConfetti();
          } else if (result === "lose") {
            showMessage("💔 You Lost", gameOverMsg || "Better luck next time!", { type: "error" });
          } else if (result === "draw") {
            showMessage("🤝 Draw", gameOverMsg || "Game ended in a draw", { type: "info" });
          }
          break;

        // ✅ Room timer updates
        case GameMessages.ROOM_TIMER_UPDATE:
          if (payload.whiteTimer !== undefined && payload.blackTimer !== undefined) {
            updateTimers(payload.whiteTimer, payload.blackTimer);
          }
          break;

        // ✅ Room time exceeded
        case GameMessages.ROOM_TIME_EXCEEDED:
          const { winner: timeWinner, loser: timeLoser } = payload;
          endGame(timeWinner, timeLoser);
          showMessage(
            "⏰ Time's Up!",
            payload.message || "Time ran out!",
            { type: "error" }
          );
          break;

        // ✅ Illegal room move
        case GameMessages.ILLEGAL_ROOM_MOVE:
          showMessage(
            "❌ Illegal Move",
            payload.message || "That move is not allowed.",
            { type: "error" }
          );
          break;

        // ✅ Room draw
        case GameMessages.ROOM_DRAW:
          endGame("draw", null);
          showMessage(
            "🤝 Draw",
            payload.message || "The game ended in a draw.",
            { type: "info" }
          );
          break;

        // ✅ Room reconnect
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
              roomGameId: payload.roomGameId,
              roomStatus: "ACTIVE",
            });
            console.log(`🔄 Room reconnection - syncing host status: isCreator=${payload.isCreator}`);
          }
          
          showMessage(
            "🔄 Reconnected",
            "Welcome back to your room game!",
            { type: "info" }
          );
          break;

        // ✅ Room opponent left
        case GameMessages.ROOM_OPPONENT_LEFT:
          showMessage(
            "👋 Opponent Left",
            payload.message || "Your opponent has left the game.",
            { type: "warning" }
          );
          break;

        // ✅ Room game not found
        case GameMessages.ROOM_GAME_NOT_FOUND:
          showMessage(
            "❌ Game Not Found",
            payload.message || "The room game could not be found.",
            { type: "error" }
          );
          break;

        // ✅ Room left confirmation
        case GameMessages.ROOM_LEFT:
          showMessage(
            "👋 Left Room",
            payload.message || "You have left the room.",
            { type: "info" }
          );
          break;
          
        case GameMessages.ROOM_READY_TO_START:
          // Update room state to FULL while preserving creator status
          const currentStore = useGameStore.getState();
          useGameStore.setState({
            roomStatus: "FULL",
            // Explicitly preserve creator status
            isRoomCreator: currentStore.isRoomCreator,
          });
          console.log(`✅ ROOM_READY_TO_START - preserving isRoomCreator: ${currentStore.isRoomCreator}`);
          showMessage(
            "✅ Room Ready",
            payload.message || "Both players are ready! You can start the game.",
            { type: "success" }
          );
          break;

        case GameMessages.OPP_ROOM_RECONNECTED:
          showMessage(
            "🔌 Opponent Reconnected",
            payload.message || "Your opponent has reconnected to the room.",
            { type: "info" }
          );
          break;

        case GameMessages.ROOM_OPP_DISCONNECTED:
          showMessage(
            "🔴 Opponent Disconnected",
            payload.message || "Your opponent has disconnected from the room.",
            { type: "warning" }
          );
          break;

        case GameMessages.ROOM_NOT_FOUND:
          showMessage(
            "❌ Room Not Found",
            payload.message || "The room you're trying to join doesn't exist.",
            { type: "error" }
          );
          break;

        case GameMessages.ROOM_NOT_READY:
          showMessage(
            "⏳ Room Not Ready",
            payload.message || "Waiting for opponent to join the room.",
            { type: "info" }
          );
          break;

        case GameMessages.ROOM_GAME_ACTIVE_ERROR:
          showMessage(
            "⚠️ Game Already Active",
            payload.message || "A game is already active in this room.",
            { type: "error" }
          );
          break;

        case GameMessages.UNAUTHORIZED:
          showMessage(
            "🚫 Unauthorized",
            payload.message || "You don't have permission to perform this action.",
            { type: "error" }
          );
          break;

        case GameMessages.PAYLOAD_ERROR:
          showMessage(
            "❌ Invalid Request",
            payload.message || "The request data is invalid.",
            { type: "error" }
          );
          break;

        case GameMessages.NO_ROOM_RECONNECTION:
          showMessage(
            "❌ Cannot Reconnect",
            payload.message || "Unable to reconnect to the room game.",
            { type: "error" }
          );
          break;

        case GameMessages.ROOM_CHAT:
          console.log("Room chat message:", payload);
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

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public init(type: GameModes, userId?: number): void {
    // If already connected to the same type, don't reconnect
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
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
      this.closeSocket();
    }

    let wsUrl = "";

    switch (type) {
      case "guest":
        if (!userId || typeof userId !== 'number') {
          console.warn("⚠️ No valid user ID provided for guest.");
          return;
        }
        wsUrl = `${this.wsBaseUrl}/guest?id=${userId}`;
        break;

      case "room":
        if (!userId || typeof userId !== 'number') {
          console.warn("⚠️ No valid user ID provided for room game.");
          return;
        }
        wsUrl = `${this.wsBaseUrl}/room?userId=${userId}`;
        break;

      case "computer":
        wsUrl = `${this.wsBaseUrl}/computer`;
        break;

      default:
        console.error("❌ Invalid game type");
        return;
    }

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`✅ Connected to ${type} WebSocket:`, wsUrl);
      };

      this.socket.onclose = (event) => {
        console.log(`🔌 ${type} WebSocket closed`, event.reason);
        this.socket = null;
      };

      this.socket.onerror = (err) => {
        console.error(`❌ ${type} WebSocket error:`, err);
      };

      this.socket.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.error(`❌ Failed to connect ${type} socket:`, error);
      this.socket = null;
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