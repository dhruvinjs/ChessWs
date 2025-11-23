import { create } from "zustand";
import { ComputerMove } from "../lib/computerGame/ComputerSocketManager";

export interface Notification {
  id: string;
  type: "success" | "danger" | "warning" | "info";
  message: string;
  timestamp: number;
}

export interface ComputerGameData {
  computerGameId: number;
  fen: string;
  playerColor: "w" | "b";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  moves: any[];
  capturedPieces: string[];
  validMoves: Array<{ from: string; to: string; promotion?: string | null }>;
}

export interface ComputerGameState {
  // Connection state
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  
  // Game state
  gameData: ComputerGameData | null;
  gameStatus: "idle" | "active" | "finished";
  gameResult: "win" | "loss" | "draw" | null;
  
  // UI state
  notifications: Notification[];
  isThinking: boolean; // When computer is calculating move
  
  // Actions
  setConnectionStatus: (status: "disconnected" | "connecting" | "connected" | "error") => void;
  setGameData: (data: ComputerGameData) => void;
  setGameStatus: (status: "idle" | "active" | "finished") => void;
  setGameResult: (result: "win" | "loss" | "draw" | null) => void;
  updateGameState: (fen: string, lastMove?: ComputerMove) => void;
  addCapturedPiece: (piece: string) => void;
  setValidMoves: (moves: Array<{ from: string; to: string; promotion?: string | null }>) => void;
  addNotification: (type: Notification["type"], message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setIsThinking: (thinking: boolean) => void;
  resetGame: () => void;
}

const initialState = {
  connectionStatus: "disconnected" as const,
  gameData: null,
  gameStatus: "idle" as const,
  gameResult: null,
  notifications: [],
  isThinking: false,
};

export const useComputerGameStore = create<ComputerGameState>((set, get) => ({
  ...initialState,

  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },

  setGameData: (data) => {
    set({ gameData: data });
  },

  setGameStatus: (status) => {
    set({ gameStatus: status });
    
    // Set thinking state based on game status
    if (status === "finished") {
      set({ isThinking: false });
    }
  },

  setGameResult: (result) => {
    set({ gameResult: result });
  },

  updateGameState: (fen, lastMove) => {
    const { gameData } = get();
    if (!gameData) return;

    const updatedData = {
      ...gameData,
      fen,
      moves: lastMove ? [...gameData.moves, lastMove] : gameData.moves
    };

    set({ 
      gameData: updatedData,
      isThinking: false // Stop thinking when move is received
    });
  },

  addCapturedPiece: (piece) => {
    const { gameData } = get();
    if (!gameData) return;

    const updatedData = {
      ...gameData,
      capturedPieces: [...gameData.capturedPieces, piece]
    };

    set({ gameData: updatedData });
  },

  setValidMoves: (moves) => {
    const { gameData } = get();
    if (!gameData) return;

    const updatedData = {
      ...gameData,
      validMoves: moves
    };

    set({ gameData: updatedData });
  },

  addNotification: (type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type,
      message,
      timestamp: Date.now()
    };

    set(state => ({
      notifications: [...state.notifications, notification]
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setIsThinking: (thinking) => {
    set({ isThinking: thinking });
  },

  resetGame: () => {
    set({
      gameData: null,
      gameStatus: "idle",
      gameResult: null,
      isThinking: false,
      notifications: []
    });
  }
}));