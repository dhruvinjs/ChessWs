import { create } from "zustand";
import { GameMessages } from "../constants";
import { SocketManager } from "../lib/socketManager";

interface Move {
  from: string;
  to: string;
  promotion?: string | null;
}

type Color = "w" | "b" | null;

// --- FIX: `turn` property removed from the interface ---
interface GameState {
  guestId: string;
  color: Color;
  moves: Move[];
  winner: Color | "draw" | null;
  loser: Color | null;
  gameId: string | null;
  oppConnected: boolean;
  gameStatus: string;
  gameStarted: boolean;
  fen: string;
  validMoves: Move[];
  whiteTimer: number;
  blackTimer: number;
  selectedSquare: string | null;

  // actions
  initGame: (payload: any) => void;
  processServerMove: (payload: any) => void;
  setFen: (fen: string) => void;
  setOppStatus: (status: boolean) => void;
  updateTimers: (white: number, black: number) => void;
  endGame: (winner: Color | "draw", loser: Color | null) => void;
  resetGame: () => void;
  reconnect: (payload: any) => void;
  setSelectedSquare: (square: string | null) => void;

  // socket actions
  move: (move: Move) => void;
  initGameRequest: () => void;
  resign: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  guestId: "",
  color: null,
  moves: [],
  winner: null,
  loser: null,
  gameId: null,
  oppConnected: true,
  gameStarted: false,
  gameStatus: GameMessages.INIT_GAME,
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  validMoves: [],
  // --- FIX: `turn` property removed from initial state ---
  whiteTimer: 600,
  blackTimer: 600,
  selectedSquare: null,

  initGame: (payload) =>
    set({
      ...payload,
      validMoves: payload.validMoves || [],
      gameStatus: GameMessages.GAME_ACTIVE,
      gameStarted: true,
      moves: [],
      winner: null,
      loser: null,
    }),

  processServerMove: (payload) => {
    set((state) => ({
      fen: payload.fen,
      // --- FIX: `turn` is no longer set here. FEN is the source of truth. ---
      validMoves: payload.validMoves || [],
      moves: [...state.moves, payload.move],
      whiteTimer: payload.whiteTimer ?? state.whiteTimer,
      blackTimer: payload.blackTimer ?? state.blackTimer,
      selectedSquare: null,
    }));
  },

  reconnect: (payload) =>
    set({
      ...payload,
      validMoves: payload.validMoves || [],
      gameStatus: GameMessages.GAME_ACTIVE,
      gameStarted: true,
      oppConnected: true,
    }),

  setFen: (fen) => set({ fen }),

  setOppStatus: (status) => set({ oppConnected: status }),

  updateTimers: (white, black) => set({ whiteTimer: white, blackTimer: black }),

  endGame: (winner, loser) =>
    set({
      gameStatus: GameMessages.GAME_OVER,
      winner,
      loser,
      selectedSquare: null,
      validMoves: [],
    }),

  resetGame: () =>
    set({
      guestId: "",
      color: null,
      moves: [],
      winner: null,
      loser: null,
      gameId: null,
      oppConnected: true,
      gameStarted: false,
      gameStatus: GameMessages.INIT_GAME,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      validMoves: [],
      // --- FIX: `turn` removed from reset state ---
      whiteTimer: 600,
      blackTimer: 600,
      selectedSquare: null,
    }),

  setSelectedSquare: (square) => set({ selectedSquare: square }),

  move: (move) => {
    const { gameId } = get();
    if (!gameId) return;

    set({ selectedSquare: null });

    SocketManager.getInstance().send({ 
      type: GameMessages.MOVE, 
      payload: { ...move, gameId } 
    });
  },

  initGameRequest: () => {
    SocketManager.getInstance().send({ type: GameMessages.INIT_GAME, payload: {} });
    set({
      gameStatus: GameMessages.SEARCHING,
      gameStarted: false,
      moves: [],
      validMoves: [],
      selectedSquare: null,
      color: null,
      // --- FIX: `turn` removed from init request ---
      winner: null,
      loser: null,
    });
  },

  resign: () => {
    const { gameId, color } = get();
    if (!gameId) return;
    SocketManager.getInstance().send({ type: GameMessages.LEAVE_GAME, payload: { gameId } });
    set({
      gameStatus: GameMessages.GAME_OVER,
      winner: color === "w" ? "b" : "w",
      loser: color,
    });
  },
}));

export const useGameActions = () =>
  useGameStore((state) => ({
    move: state.move,
    initGameRequest: state.initGameRequest,
    resign: state.resign,
    setSelectedSquare: state.setSelectedSquare,
  }));
