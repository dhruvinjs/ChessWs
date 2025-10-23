// 1. First, update your useGameStore.ts to handle draw state

import { create } from "zustand";
import { GameMessages } from "../types/chess";
import { SocketManager } from "../lib/socketManager";

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
  
  // ✅ NEW: Draw offer state
  drawOfferReceived: boolean;
  drawOfferSent: boolean;

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

  // ✅ NEW: Draw actions
  setDrawOfferReceived: (received: boolean) => void;
  setDrawOfferSent: (sent: boolean) => void;

  // socket actions
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
  gameStarted: false,
  gameStatus: GameMessages.INIT_GAME,
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  validMoves: [],
  whiteTimer: 600,
  blackTimer: 600,
  selectedSquare: null,
  
  // ✅ NEW: Draw offer state
  drawOfferReceived: false,
  drawOfferSent: false,

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
    const {
      fen,
      color,
      gameId,
      whiteTimer,
      blackTimer,
      validMoves,
      moves = [],
    } = payload;

    set({
      fen,
      color,
      gameId,
      moves,
      validMoves: validMoves || [],
      whiteTimer,
      blackTimer,
      gameStatus: GameMessages.GAME_ACTIVE,
      gameStarted: true,
      oppConnected: true,
      drawOfferReceived: false,
      drawOfferSent: false,
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
      selectedSquare: null,
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
    }),

  setSelectedSquare: (square) => set({ selectedSquare: square }),

  // ✅ NEW: Draw state setters
  setDrawOfferReceived: (received) => set({ drawOfferReceived: received }),
  setDrawOfferSent: (sent) => set({ drawOfferSent: sent }),

  move: (move) => {
    const { gameId } = get();
    if (!gameId) return;

    set({ selectedSquare: null });

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

  // ✅ NEW: Draw actions
  offerDraw: () => {
    const { gameId } = get();
    if (!gameId) return;
    
    SocketManager.getInstance().send({
      type: GameMessages.OFFER_DRAW,
      payload: {},
    });
    
    set({ drawOfferSent: true });
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
    
    set({ drawOfferReceived: false });
  },
}));

export const useGameActions = () =>
  useGameStore((state) => ({
    move: state.move,
    initGameRequest: state.initGameRequest,
    resign: state.resign,
    setSelectedSquare: state.setSelectedSquare,
    offerDraw: state.offerDraw,
    acceptDraw: state.acceptDraw,
    rejectDraw: state.rejectDraw,
  }));