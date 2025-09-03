// useGameStore.ts
import { create } from "zustand";

interface Move {
  from: string;
  to: string;
  promotion?: string;
}

type GameStatus = "idle" | "active" | "reconnecting" | "ended" | "waiting";
type Color = "w" | "b" | null;

interface GameState {
  guestId: string;
  color: Color;
  moves: Move[];
  winner: Color;
  loser: Color;
  gameId: string | null;
  oppConnected: boolean;
  gameStatus: GameStatus;
  fen: string;
  gamestarted: boolean;

  addMove: (move: Move) => void;
  setGuestId: (guestId: string) => void;
  initGame: (color: Color, gameId: string, fen: string) => void;
  setOppStatus: (status: boolean) => void;
  endGame: (winner: Color, loser: Color) => void;
  resetGame: () => void;
  setFen: (fen: string) => void;
  reconnect: (color: Color, gameId: string, fen?: string, moves?: Move[]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  guestId: "",
  color: null,
  moves: [],
  winner: null,
  loser: null,
  gameId: null,
  oppConnected: true,
  gameStatus: "waiting",
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  gamestarted: false,

  setFen: (fen) => set({ fen }),
  setGuestId: (id) => set({ guestId: id }),

  initGame: (color, gameId, fen) =>
    set({
      color,
      gameId,
      gameStatus: "active",
      moves: [],
      fen,
      gamestarted: true,
      winner: null,
      loser: null,
    }),

  setOppStatus: (status) => set({ oppConnected: status }),

  addMove: (move) =>
    set((state) => ({
      moves: [...state.moves, move],
    })),

  endGame: (winner, loser) =>
    set({
      gameStatus: "ended",
      winner,
      loser,
      gamestarted: false,
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
      gameStatus: "waiting",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",      
    gamestarted: false,
    }),

  reconnect: (color, gameId, fen, moves) =>
    set((state) => ({
      color,
      gameId,
      gameStatus: "active",
      gamestarted: true,
      fen: fen ?? state.fen,
      moves: moves ?? state.moves,
    })),
}));
