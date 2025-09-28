import { create } from "zustand";
// --- THIS IS THE FIX: A simple, direct import for chess.js as requested. ---
import { Chess } from "chess.js";
import { GameMessages } from "../constants";
import { SocketManager } from "../lib/socketManager";

interface Move {
  from: string;
  to: string;
  promotion?: string;
}

type Color = "w" | "b" | null;

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
  turn: Color;
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
  turn: "w",
  whiteTimer: 600,
  blackTimer: 600,
  selectedSquare: null,

  initGame: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
      validMoves: payload.validMoves || [],
      gameStatus: GameMessages.GAME_ACTIVE,
      gameStarted: true,
      moves: [],
      winner: null,
      loser: null,
    })),

  processServerMove: (payload) =>
    set((state) => ({
      ...state,
      fen: payload.fen,
      turn: payload.turn,
      validMoves: payload.validMoves || [],
      moves: [...state.moves, payload.move],
      whiteTimer: payload.whiteTimer ?? state.whiteTimer,
      blackTimer: payload.blackTimer ?? state.blackTimer,
      selectedSquare: null,
    })),

  reconnect: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
      validMoves: payload.validMoves || [],
      gameStatus: GameMessages.GAME_ACTIVE,
      gameStarted: true,
      oppConnected: true,
    })),

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
      turn: "w",
      whiteTimer: 600,
      blackTimer: 600,
      selectedSquare: null,
    }),

  setSelectedSquare: (square) => set({ selectedSquare: square }),

  move: (move) => {
    const { gameId, fen } = get();
    if (!gameId) return;

    const chess = new Chess(fen);
    const result = chess.move(move);

    if (result) {
      set({
        fen: chess.fen(),
        turn: chess.turn(),
        selectedSquare: null,
        validMoves: [], 
      });
    }

    SocketManager.getInstance().send({ type: GameMessages.MOVE, payload: { ...move, gameId } });
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
      turn: "w",
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
