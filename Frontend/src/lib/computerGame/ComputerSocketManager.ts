import { useComputerGameStore } from "../../stores/useComputerGameStore";

export interface ComputerMove {
  from: string;
  to: string;
  promotion?: string;
}

export interface ComputerGamePayload {
  computerGameId?: number;
  fen?: string;
  playerColor?: "w" | "b";
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  moves?: any[];
  move?: ComputerMove;
  message?: string;
  isCheck?: boolean;
  capturedPiece?: string;
  result?: string;
  reason?: string;
  validMoves?: Array<{ from: string; to: string; promotion?: string | null }>;
}

export interface ComputerGameMessage {
  type: string;
  payload: ComputerGamePayload;
}

// Message types matching backend
export const ComputerGameMessages = {
  INIT_COMPUTER_GAME: "init_computer_game",
  COMPUTER_GAME_ACTIVE: "computer_game_active",
  COMPUTER_GAME_OVER: "computer_game_over",
  PLAYER_MOVE: "player_move",
  COMPUTER_MOVE: "computer_move",
  PLAYER_CHECK: "player_check",
  COMPUTER_CHECK: "computer_check",
  PLAYER_WON: "player_won",
  COMPUTER_WON: "computer_won",
  PLAYER_QUIT: "player_quit",
  NOT_YOUR_TURN: "not_your_turn"
} as const;

export const ErrorMessages = {
  PAYLOAD_ERROR: "payload_error",
  SERVER_ERROR: "server_error"
} as const;

class ComputerSocketManager {
  private socket: WebSocket | null = null;
  private userId: number | null = null;
  private isConnecting: boolean = false;

  public connect(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Prevent duplicate connections - stronger check
        if (this.socket) {
          if (this.socket.readyState === WebSocket.OPEN) {
            console.log("[ComputerSocketManager] WebSocket already connected");
            resolve();
            return;
          }
          if (this.socket.readyState === WebSocket.CONNECTING) {
            console.log("[ComputerSocketManager] WebSocket connection in progress");
            reject(new Error("Connection already in progress"));
            return;
          }
        }

        // Prevent multiple concurrent connection attempts
        if (this.isConnecting) {
          console.log("[ComputerSocketManager] Connection flag already set");
          reject(new Error("Connection already in progress"));
          return;
        }

        // Close existing socket if any
        if (this.socket) {
          console.log("Closing existing socket before reconnecting");
          this.socket.close();
          this.socket = null;
        }

        this.isConnecting = true;
        this.userId = userId;
        const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}/computer?userId=${userId}`;
        
        console.log("[ComputerSocketManager] Connecting to:", wsUrl);
        this.socket = new WebSocket(wsUrl);
        
        // Add timeout to prevent hanging connections
        const connectionTimeout = setTimeout(() => {
          if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
            console.error("[ComputerSocketManager] Connection timeout");
            this.isConnecting = false;
            this.socket.close();
            reject(new Error("Connection timeout"));
          }
        }, 10000); // 10 second timeout
        
        this.socket.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log("[ComputerSocketManager] WebSocket connected successfully");
          this.isConnecting = false;
          useComputerGameStore.getState().setConnectionStatus("connected");
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.socket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log("[ComputerSocketManager] WebSocket disconnected", event.code, event.reason);
          this.isConnecting = false;
          
          // Only update store if socket was successfully opened
          if (event.wasClean || this.socket?.readyState === WebSocket.CLOSED) {
            useComputerGameStore.getState().setConnectionStatus("disconnected");
          }
        };

        this.socket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error("[ComputerSocketManager] WebSocket error:", error);
          this.isConnecting = false;
          useComputerGameStore.getState().setConnectionStatus("error");
          reject(error);
        };

      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: ComputerGameMessage = JSON.parse(event.data);
      const { type, payload } = message;
      
      console.log("Computer game message received:", type, payload);

      switch (type) {
        case ComputerGameMessages.INIT_COMPUTER_GAME:
          this.handleGameInitialized(payload);
          break;

        case ComputerGameMessages.COMPUTER_GAME_ACTIVE:
          this.handleGameReconnected(payload);
          break;

        case ComputerGameMessages.PLAYER_MOVE:
          this.handlePlayerMoveConfirmed(payload);
          break;

        case ComputerGameMessages.COMPUTER_MOVE:
          this.handleComputerMove(payload);
          break;

        case ComputerGameMessages.PLAYER_CHECK:
          this.handlePlayerCheck(payload);
          break;

        case ComputerGameMessages.COMPUTER_CHECK:
          this.handleComputerCheck(payload);
          break;

        case ComputerGameMessages.PLAYER_WON:
          this.handlePlayerWon(payload);
          break;

        case ComputerGameMessages.COMPUTER_WON:
          this.handleComputerWon(payload);
          break;

        case ComputerGameMessages.COMPUTER_GAME_OVER:
          this.handleGameOver(payload);
          break;

        case ComputerGameMessages.NOT_YOUR_TURN:
          this.handleNotYourTurn(payload);
          break;

        case ErrorMessages.PAYLOAD_ERROR:
        case ErrorMessages.SERVER_ERROR:
          this.handleError(payload);
          break;

        default:
          console.warn("Unknown computer game message type:", type);
      }
    } catch (error) {
      console.error("Error parsing computer game message:", error);
    }
  }

  private handleGameInitialized(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    store.setGameData({
      computerGameId: payload.computerGameId!,
      fen: payload.fen!,
      playerColor: payload.playerColor!,
      difficulty: payload.difficulty!,
      moves: [],
      capturedPieces: [],
      validMoves: []
    });
    store.setGameStatus("active");
    store.addNotification("success", "Game started! Good luck!");
  }

  private handleGameReconnected(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    
    // Check if this is an error message about trying to start a new game when one exists
    if (payload.message && !payload.computerGameId) {
      // This is a block message - show warning but don't change game status if already active
      store.addNotification("warning", payload.message);
      return;
    }
    
    // This is a valid game reconnection with game data
    store.setGameData({
      computerGameId: payload.computerGameId!,
      fen: payload.fen!,
      playerColor: payload.playerColor!,
      difficulty: payload.difficulty!,
      moves: payload.moves || [],
      capturedPieces: [],
      validMoves: []
    });
    store.setGameStatus("active");
    store.addNotification("info", payload.message || "Reconnected to your game");
  }

  private handlePlayerMoveConfirmed(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    if (payload.fen) {
      store.updateGameState(payload.fen, payload.move);
      // Set thinking state - computer is now calculating its move
      store.setIsThinking(true);
      
      if (payload.capturedPiece) {
        store.addCapturedPiece(payload.capturedPiece);
      }
    }
  }

  private handleComputerMove(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    console.log("[ComputerSocketManager] Computer move received:", payload);
    
    if (payload.fen && payload.move) {
      store.updateGameState(payload.fen, payload.move);
      store.setIsThinking(false); // Computer finished thinking
      
      // Store valid moves from backend (for player's next turn)
      if (payload.validMoves) {
        store.setValidMoves(payload.validMoves);
      }
      
      if (payload.capturedPiece) {
        store.addCapturedPiece(payload.capturedPiece);
      }
    }
  }

  private handlePlayerCheck(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    store.addNotification("warning", payload.message || "You put the computer in check!");
  }

  private handleComputerCheck(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    store.addNotification("danger", payload.message || "Computer has put you in check!");
  }

  private handlePlayerWon(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    store.setGameStatus("finished");
    store.setGameResult("win");
    store.addNotification("success", payload.message || "Congratulations! You won!");
  }

  private handleComputerWon(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    store.setGameStatus("finished");
    store.setGameResult("loss");
    store.addNotification("danger", payload.message || "Computer won! Better luck next time.");
  }

  private handleGameOver(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    store.setGameStatus("finished");
    
    if (payload.result === "draw") {
      store.setGameResult("draw");
      store.addNotification("info", payload.message || "Game ended in a draw");
    } else {
      store.addNotification("info", payload.message || "Game over");
    }
  }

  private handleNotYourTurn(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    store.addNotification("warning", payload.message || "Wait for your turn!");
  }

  private handleError(payload: ComputerGamePayload): void {
    const store = useComputerGameStore.getState();
    store.addNotification("danger", payload.message || "An error occurred");
  }

  // Public methods for sending messages
  public startNewGame(difficulty: "EASY" | "MEDIUM" | "HARD", playerColor: "w" | "b"): void {
    this.sendMessage({
      type: ComputerGameMessages.INIT_COMPUTER_GAME,
      payload: { difficulty, playerColor }
    });
  }

  public makeMove(computerGameId: number, move: ComputerMove): void {
    this.sendMessage({
      type: ComputerGameMessages.PLAYER_MOVE,
      payload: { computerGameId, ...move }
    });
  }

  public quitGame(computerGameId: number): void {
    this.sendMessage({
      type: ComputerGameMessages.PLAYER_QUIT,
      payload: { computerGameId }
    });
  }

  private sendMessage(message: ComputerGameMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
      useComputerGameStore.getState().addNotification("danger", "Connection lost. Please reconnect.");
    }
  }

  public disconnect(): void {
    console.log("Disconnecting WebSocket...");
    this.isConnecting = false;
    
    if (this.socket) {
      // Remove event listeners to prevent memory leaks
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      
      if (this.socket.readyState === WebSocket.OPEN || 
          this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }
      this.socket = null;
    }
    this.userId = null;
  }

  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const computerSocketManager = new ComputerSocketManager();