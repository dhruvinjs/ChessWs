import { create } from "zustand";
import { ComputerMove } from "../lib/ComputerSocketManager";

export interface ComputerGameData {
  computerGameId: number;
  fen: string;
  playerColor: "w" | "b";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  moves: ComputerMove[];
  capturedPieces: string[];
  validMoves: Array<{ from: string; to: string; promotion?: string | null }>;
}

export interface ComputerGameState {
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  gameData: ComputerGameData | null;
  gameStatus: "idle" | "active" | "finished";
  gameResult: "win" | "loss" | "draw" | null;
  isThinking: boolean;
  showExistingGameModal: boolean;
  existingGameMessage: string;

  setConnectionStatus: (status: ComputerGameState["connectionStatus"]) => void;
  setGameData: (data: ComputerGameData | null) => void;
  setGameStatus: (status: "idle" | "active" | "finished") => void;
  setGameResult: (result: ComputerGameState["gameResult"]) => void;

  updateGameState: (
    fen: string,
    validMoves: Array<{ from: string; to: string; promotion?: string | null }>,
    lastMove?: ComputerMove
  ) => void;

  addCapturedPiece: (piece: string) => void;
  setValidMoves: (moves: Array<{ from: string; to: string; promotion?: string | null }>) => void;
  setIsThinking: (thinking: boolean) => void;
  setShowExistingGameModal: (show: boolean) => void;
  setExistingGameMessage: (message: string) => void;
  resetGame: () => void;
}

// ❗ FIX: Use "as const" so TypeScript keeps literal types
const initialState = {
  connectionStatus: "disconnected" as const,
  gameData: null,
  gameStatus: "idle" as const,
  gameResult: null,
  isThinking: false,
  showExistingGameModal: false,
  existingGameMessage: "",
};

export const useComputerGameStore = create<ComputerGameState>((set, get) => ({
  ...initialState,

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setGameData: (data) => set({ gameData: data }),

  setGameStatus: (status) =>
    set({
      gameStatus: status,
      isThinking: status === "finished" ? false : get().isThinking,
    }),

  setGameResult: (result) => set({ gameResult: result }),

  updateGameState: (fen, validMoves, lastMove) =>
    set((state) => {
      const old = state.gameData;

      if (!old) {
        return {
          gameData: {
            computerGameId: 0,
            playerColor: "w",
            difficulty: "MEDIUM",
            capturedPieces: [],
            fen,
            validMoves: [...validMoves],
            moves: lastMove ? [{ ...lastMove }] : [],
          },
        };
      }

      return {
        gameData: {
          ...old,
          fen,
          validMoves: [...validMoves],
          moves: lastMove ? [...old.moves, { ...lastMove }] : [...old.moves],
        },
      };
    }),

  addCapturedPiece: (piece) =>
    set((state) => {
      if (!state.gameData) return {};
      return {
        gameData: {
          ...state.gameData,
          capturedPieces: [...state.gameData.capturedPieces, piece],
        },
      };
    }),

  setValidMoves: (moves) =>
    set((state) => {
      if (!state.gameData) return {};
      return { gameData: { ...state.gameData, validMoves: [...moves] } };
    }),

  setIsThinking: (thinking) => set({ isThinking: thinking }),

  setShowExistingGameModal: (show) => set({ showExistingGameModal: show }),

  setExistingGameMessage: (message) => set({ existingGameMessage: message }),

  resetGame: () => set({ ...initialState }),
}));
