// useGameStore.ts
import { create } from "zustand";
import { GameMessages } from "../constants";
import { SocketManager } from "../lib/socket"; // Import the SocketManager
import { SocketMessage } from "../types/socket"; // Import the SocketMessage type

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
  setGuestId: (guestId: string) => void;
  initGame: (payload: {
    color: Color;
    gameId: string;
    fen: string;
    validMoves?: Move[]; // <--- Add validMoves to the payload
    whiteTimer?: number;
    blackTimer?: number;
    turn?: Color;
  }) => void;
  addMove: (move: Move) => void;
  setFen: (fen: string) => void;
  setValidMoves: (moves: Move[]) => void;
  clearValidMoves: () => void;
  setOppStatus: (status: boolean) => void;
  updateTimers: (white: number, black: number) => void;
  endGame: (winner: Color | "draw", loser: Color | null) => void;
  resetGame: () => void;
  reconnect: (payload: {
    color: Color;
    gameId: string;
    fen: string;
    moves?: Move[];
    turn?: Color;
    whiteTimer?: number;
    blackTimer?: number;
  }) => void;
  setSelectedSquare: (square: string | null) => void;

  // socket actions
  move: (move: Move) => void;
  initGameRequest: () => void;
  resign: () => void;
  sendSocketMessage: (message: SocketMessage) => void; // <--- Use SocketMessage type
  getValidMoves: (square: string) => void; // <--- Add getValidMoves action
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

  setGuestId: (guestId) => set({ guestId }),

  initGame: ({
    color,
    gameId,
    fen,
    validMoves = [], // <--- Default to empty array
    whiteTimer = 600,
    blackTimer = 600,
    turn = "w",
  }) =>
    set({
      color,
      gameId,
      gameStatus: GameMessages.GAME_ACTIVE,
      gameStarted: true,
      moves: [],
      fen,
      validMoves, // <--- Set validMoves
      winner: null,
      loser: null,
      turn,
      whiteTimer,
      blackTimer,
    }),

  addMove: (move) =>
    set((state) => ({
      moves: [...state.moves, move],
      selectedSquare: null,
    })),

  setFen: (fen) => set({ fen }),

  setValidMoves: (moves) => set({ validMoves: moves }),
  clearValidMoves: () => set({ validMoves: [] }),

  setOppStatus: (status) => set({ oppConnected: status }),

  updateTimers: (white, black) => set({ whiteTimer: white, blackTimer: black }),

  endGame: (winner, loser) =>
    set({
      gameStatus: GameMessages.GAME_OVER,
      winner,
      loser,
      selectedSquare: null,
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

  reconnect: ({
    color,
    gameId,
    fen,
    moves = [],
    turn = "w",
    whiteTimer = 600,
    blackTimer = 600,
  }) =>
    set({
      color,
      gameId,
      gameStatus: GameMessages.GAME_ACTIVE,
      gameStarted: true,
      fen,
      moves,
      turn,
      whiteTimer,
      blackTimer,
      oppConnected: true,
    }),

  setSelectedSquare: (square) => set({ selectedSquare: square }),

  // ✅ WebSocket actions
  sendSocketMessage: (message) => {
    SocketManager.getInstance().send(message); // <--- No more 'as any'
  },

  getValidMoves: (square) => {
    const { gameId } = get();
    if (!gameId) return;
    get().sendSocketMessage({
      type: GameMessages.VALID_MOVE,
      payload: { square, gameId },
    });
  },

  move: (move) => {
    const { gameId } = get();
    if (!gameId) return;

    get().sendSocketMessage({ type: GameMessages.MOVE, payload: { ...move, gameId } });

    // We will no longer update the state optimistically.
    // The server will send a MOVE message back to us with the new state.
  },

  initGameRequest: () => {
    console.log("🎮 Requesting new game");
    get().sendSocketMessage({ type: GameMessages.INIT_GAME, payload: {} });
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

    get().sendSocketMessage({ type: GameMessages.LEAVE_GAME, payload: { gameId } });

    set({
      gameStatus: GameMessages.GAME_OVER,
      winner: color === "w" ? "b" : "w",
      loser: color,
    });
  },
}));
