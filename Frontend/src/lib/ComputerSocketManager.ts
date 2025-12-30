import { useComputerGameStore } from '../stores/useComputerGameStore';
import toast from 'react-hot-toast';
import { ComputerGameMessages } from '../types/chess';

export interface ComputerMove {
  from: string;
  to: string;
  promotion?: string;
}

export interface ComputerGamePayload {
  computerGameId?: number;
  fen?: string;
  playerColor?: 'w' | 'b';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  moves?: ComputerMove[];
  move?: ComputerMove;
  message?: string;
  capturedPiece?: string;
  capturedPieces?: string[];
  validMoves?: Array<{ from: string; to: string; promotion?: string | null }>;
}

export interface ComputerGameMessage {
  type: string;
  payload: ComputerGamePayload;
}

export class ComputerSocketManager {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  public connect(): Promise<void> {
    const store = useComputerGameStore.getState();

    // Don't try to connect if already connected or connecting
    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      console.log('⚠️ Already connected or connecting, skipping');
      return Promise.resolve();
    }

    store.setConnectionStatus('connecting');

    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host =
        import.meta.env.VITE_WS_URL?.replace(/^wss?:\/\//, '') ||
        'localhost:8080';
      const url = `${protocol}//${host}/computer`;

      console.log(`[WebSocket] Connecting to: ${url}`);
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.reconnectAttempts = 0;
        store.setConnectionStatus('connected');
        resolve();
      };

      this.socket.onerror = (err) => {
        console.error('❌ WebSocket error:', err);
        store.setConnectionStatus('error');
        toast.error('Failed to connect to game server');
        reject(err);
      };

      this.socket.onclose = (event) => {
        console.log(
          `🔌 WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`
        );
        store.setConnectionStatus('disconnected');
        store.setIsThinking(false);
        this.socket = null;

        // Auto-reconnect logic (optional)
        if (
          event.code !== 1000 &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectAttempts++;
          console.log(
            `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
          );
          setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
      };

      this.socket.onmessage = (event) => this.handleMessage(event);
    });
  }

  private handleMessage(event: MessageEvent) {
    const store = useComputerGameStore.getState();
    let message: ComputerGameMessage;

    try {
      message = JSON.parse(event.data);
    } catch {
      console.error('❌ Invalid message received:', event.data);
      return;
    }

    const { type, payload } = message;
    console.log('📨 Received message:', { type, payload });

    switch (type) {
      case ComputerGameMessages.COMPUTER_GAME_ACTIVE:
        console.log('🎮 Game active, setting data:', payload);

        if (!payload.computerGameId || !payload.fen) {
          console.error('❌ Invalid game data received:', payload);
          toast.error('Invalid game data received');
          return;
        }

        store.setGameData({
          computerGameId: payload.computerGameId,
          fen: payload.fen,
          moves: payload.moves || [],
          capturedPieces: payload.capturedPieces || [],
          playerColor: payload.playerColor || 'w',
          difficulty: payload.difficulty || 'MEDIUM',
          validMoves: payload.validMoves || [],
        });
        store.setGameStatus('active');
        store.setIsThinking(false);
        toast.success(payload.message || 'Game loaded!');
        break;

      case ComputerGameMessages.PLAYER_MOVE:
        // 🎯 Backend sends: { fen, capturedPiece } (NO validMoves, NO move)
        if (!payload.fen) {
          console.error('❌ Invalid PLAYER_MOVE payload:', payload);
          return;
        }

        console.log('✅ Player move validated by server');
        console.log('📊 Updated FEN:', payload.fen);

        // Just update the FEN, don't touch validMoves (will come with COMPUTER_MOVE)
        store.updateGameState(payload.fen, store.gameData?.validMoves || []);

        // Show "Computer is thinking..."
        store.setIsThinking(true);

        if (payload.capturedPiece) {
          store.addCapturedPiece(payload.capturedPiece);
        }
        break;

      case ComputerGameMessages.COMPUTER_MOVE:
        // 🎯 Backend sends: { move, fen, capturedPiece, validMoves }
        if (!payload.fen || !payload.move) {
          console.error('❌ Invalid COMPUTER_MOVE payload:', payload);
          return;
        }

        console.log('🤖 Computer move:', payload.move);
        console.log(
          "📊 Valid moves for player's turn:",
          payload.validMoves?.length
        );

        // Update with computer's move + new validMoves for player's turn
        store.updateGameState(
          payload.fen,
          payload.validMoves || [],
          payload.move
        );

        // Computer done thinking
        store.setIsThinking(false);

        if (payload.capturedPiece) {
          store.addCapturedPiece(payload.capturedPiece);
        }

        toast('Computer moved!', { icon: '🤖' });
        break;

      case ComputerGameMessages.PLAYER_CHECK:
        toast('You put the computer in check!', {
          icon: '⚡',
          style: {
            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
            color: '#000',
            fontWeight: '700',
          },
        });
        break;

      case ComputerGameMessages.COMPUTER_CHECK:
        toast.error('Computer put you in check!', {
          icon: '🔥',
          style: {
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            color: '#fff',
            fontWeight: '700',
          },
        });
        break;

      case ComputerGameMessages.PLAYER_WON:
        store.setGameStatus('finished');
        store.setGameResult('win');
        store.setIsThinking(false);
        toast.success(payload.message || 'You won!', {
          icon: '🏆',
          style: {
            background:
              'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 50%, #e17055 100%)',
            fontWeight: '800',
          },
        });
        break;

      case ComputerGameMessages.COMPUTER_WON:
        store.setGameStatus('finished');
        store.setGameResult('loss');
        store.setIsThinking(false);
        toast.error(payload.message || 'Computer won!', { icon: '💔' });
        break;

      case ComputerGameMessages.COMPUTER_GAME_OVER:
        store.setGameStatus('finished');
        store.setGameResult('draw');
        store.setIsThinking(false);
        toast(payload.message || 'Game drawn', { icon: '🤝' });
        break;

      case ComputerGameMessages.NOT_YOUR_TURN:
        toast.error(payload.message || 'Not your turn', { icon: '⏸️' });
        break;

      case ComputerGameMessages.NO_ACTIVE_GAME:
        console.log('ℹ️ No active game found - backend says no game exists');
        store.setGameStatus('idle');
        store.setGameData(null);
        store.setIsThinking(false);
        break;

      default:
        console.warn('⚠️ Unknown message type:', type);
    }
  }

  public makeMove(gameId: number, move: ComputerMove) {
    console.log('📤 Sending move:', { gameId, move });
    this.send({
      type: ComputerGameMessages.PLAYER_MOVE,
      payload: { computerGameId: gameId, move },
    });
  }

  public quitGame(gameId: number) {
    console.log('👋 Quitting game:', gameId);
    this.send({
      type: ComputerGameMessages.PLAYER_QUIT,
      payload: { computerGameId: gameId },
    });
  }

  private send(msg: ComputerGameMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error(
        '❌ Cannot send - socket not connected. State:',
        this.socket?.readyState
      );
      toast.error('Connection lost');
      return;
    }
    console.log('📤 Sending message:', msg.type, msg.payload);
    this.socket.send(JSON.stringify(msg));
  }

  public disconnect() {
    console.log('🔌 Manually disconnecting WebSocket');
    const store = useComputerGameStore.getState();
    store.setConnectionStatus('disconnected');
    store.setIsThinking(false);

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
  }

  public isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public getConnectionState() {
    if (!this.socket) return 'disconnected';
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

export const computerSocketManager = new ComputerSocketManager();
