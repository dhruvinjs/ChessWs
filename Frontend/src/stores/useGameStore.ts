import { create } from "zustand";
import { SocketManager } from "../lib/socketManager";
import { GameMessages } from "../types/chess";

interface Move {
  from: string;
  to: string;
  promotion?: string | null;
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
  whiteTimer: number;
  blackTimer: number;
  selectedSquare: string | null;

  // ✅ Draw offer state
  drawOfferReceived: boolean;
  drawOfferSent: boolean;
  drawOfferCount: number;

  // Actions
  initGame: (payload: any) => void;
  processServerMove: (payload: any) => void;
  reconnect: (payload: any) => void;
  setFen: (fen: string) => void;
  setOppStatus: (status: boolean) => void;
  updateTimers: (white: number, black: number) => void;
  endGame: (winner: Color | "draw", loser: Color | null) => void;
  resetGame: () => void;
  setSelectedSquare: (square: string | null) => void;
  setDrawOfferCount: (count: number) => void;
  setDrawOfferSent: (sent: boolean) => void;
  setDrawOfferReceived: (received: boolean) => void;

  // Socket actions
  move: (move: Move) => void;
  initGameRequest: () => void;
  resign: () => void;
  offerDraw: () => void;
  acceptDraw: () => void;
  rejectDraw: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  guestId: "",
  color: null,
  moves: [],
  winner: null,
  loser: null,
  gameId: null,
  oppConnected: true,
  gameStatus: GameMessages.INIT_GAME,
  gameStarted: false,
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  validMoves: [],
  whiteTimer: 600,
  blackTimer: 600,
  selectedSquare: null,

  // ✅ Initial draw state
  drawOfferReceived: false,
  drawOfferSent: false,
  drawOfferCount: 0,

  initGame: (payload) =>
    set({
      ...payload,
      validMoves: payload.validMoves || [],
      gameStatus: GameMessages.GAME_ACTIVE,
      gameStarted: true,
      moves: [],
      winner: null,
      loser: null,
      drawOfferReceived: false,
      drawOfferSent: false,
      drawOfferCount: 0,
    }),

  processServerMove: (payload) => {
    set((state) => ({
      fen: payload.fen,
      moves: [...state.moves, payload.move],
      validMoves: payload.validMoves || [],
      whiteTimer: payload.whiteTimer ?? state.whiteTimer,
      blackTimer: payload.blackTimer ?? state.blackTimer,
      selectedSquare: null,
    }));
  },

  reconnect: (payload) => {
    set({
      fen: payload.fen,
      color: payload.color,
      gameId: payload.gameId,
      validMoves: payload.validMoves || [],
      moves: payload.moves || [],
      whiteTimer: payload.whiteTimer,
      blackTimer: payload.blackTimer,
      gameStatus: GameMessages.GAME_ACTIVE,
      gameStarted: true,
      oppConnected: true,
      drawOfferReceived: false,
      drawOfferSent: false,
      drawOfferCount:payload.count ?? 0
    });
  },

  setFen: (fen) => set({ fen }),
  setOppStatus: (status) => set({ oppConnected: status }),
  updateTimers: (white, black) => set({ whiteTimer: white, blackTimer: black }),

  endGame: (winner, loser) =>
    set({
      gameStatus: GameMessages.GAME_OVER,
      winner,
      loser,
      validMoves: [],
      drawOfferReceived: false,
      drawOfferSent: false,
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
      whiteTimer: 600,
      blackTimer: 600,
      selectedSquare: null,
      drawOfferReceived: false,
      drawOfferSent: false,
      drawOfferCount: 0,
    }),

  setSelectedSquare: (square) => set({ selectedSquare: square }),
  setDrawOfferCount: (count) => set({ drawOfferCount: count ?? 0 }),
  setDrawOfferSent: (sent) => set({ drawOfferSent: sent }),
  setDrawOfferReceived: (received) => set({ drawOfferReceived: received }),

  move: (move) => {
    const { gameId } = get();
    if (!gameId) return;
    SocketManager.getInstance().send({
      type: GameMessages.MOVE,
      payload: { ...move, gameId },
    });
  },

  initGameRequest: () => {
    SocketManager.getInstance().send({
      type: GameMessages.INIT_GAME,
      payload: {},
    });
    set({
      gameStatus: GameMessages.SEARCHING,
      gameStarted: false,
      moves: [],
      validMoves: [],
      selectedSquare: null,
      color: null,
      winner: null,
      loser: null,
      drawOfferReceived: false,
      drawOfferSent: false,
      drawOfferCount: 0,
    });
  },

  resign: () => {
    const { gameId, color } = get();
    if (!gameId) return;
    SocketManager.getInstance().send({
      type: GameMessages.LEAVE_GAME,
      payload: { gameId },
    });
    set({
      gameStatus: GameMessages.GAME_OVER,
      winner: color === "w" ? "b" : "w",
      loser: color,
    });
  },

  // ✅ Draw actions
  offerDraw: () => {
    const { gameId } = get();
    if (!gameId) return;

    SocketManager.getInstance().send({
      type: GameMessages.OFFER_DRAW,
      payload: {},
    });

    set({ drawOfferSent: true });

    // Fallback reset if no response (15s)
    setTimeout(() => {
      if (get().drawOfferSent && get().gameStatus === GameMessages.GAME_ACTIVE) {
        set({ drawOfferSent: false });
      }
    }, 15000);
  },

  acceptDraw: () => {
    const { gameId } = get();
    if (!gameId) return;

    SocketManager.getInstance().send({
      type: GameMessages.ACCEPT_DRAW,
      payload: {},
    });

    set({
      drawOfferReceived: false,
      gameStatus: GameMessages.GAME_OVER,
      winner: "draw",
      loser: null,
    });
  },

  rejectDraw: () => {
    const { gameId } = get();
    if (!gameId) return;

    SocketManager.getInstance().send({
      type: GameMessages.REJECT_DRAW,
      payload: {},
    });

    set({
      drawOfferReceived: false,
      drawOfferSent: false,
    });
  },
}));
