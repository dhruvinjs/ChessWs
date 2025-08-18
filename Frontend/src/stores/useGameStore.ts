import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Chess } from "chess.js";

interface Move {
  from: string;
  to: string;
  promotion?: string;
}

type GameStatus = "ended" | "waiting" | "started" | "reconnecting" | "reconnected";
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
  initGame: (color: Color, gameId: string) => void;
  setOppStatus: (status: boolean) => void;
  endGame: (winner: Color, loser: Color) => void;
  resetGame: () => void;
  setFen: (fen: string) => void;
  storeInitGame:()=>void,
  reconnect: (color: Color, gameId: string, fen?: string, moves?: Move[]) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      guestId: "",
      color: null,
      moves: [],
      winner: null,
      loser: null,
      gameId: null,
      oppConnected: true,
      gameStatus: "waiting",
      fen: new Chess().fen(),
      gamestarted: false,

      setFen: (fen) => set({ fen }),
      setGuestId: (id) => set({ guestId: id }),

      initGame: (color, gameId) =>
        set({
          color,
          gameId,
          gameStatus: "started",
          moves: [],
          fen: new Chess().fen(), // always fresh start
          gamestarted: true,
          winner: null,
          loser: null,
        }),
storeInitGame: () => {
  set({
    guestId: "",
    color: null,
    moves: [],
    winner: null,
    loser: null,
    gameId: null,
    oppConnected: true,
    gameStatus: "waiting",
    fen: new Chess().fen(),
    gamestarted: false,
  });
  localStorage.removeItem("game-storage"); // remove persisted store
},
      setOppStatus: (status) => set({ oppConnected: status }),

      addMove: (move) =>
        set((state) => {
          const chess = new Chess(state.fen); // replay current FEN
          chess.move(move); // update game state
          return {
            moves: [...state.moves, move],
            fen: chess.fen(), // always update fen consistently
          };
        }),

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
          fen: new Chess().fen(),
          gamestarted: false,
        }),

      reconnect: (color, gameId, fen, moves) =>
        set((state) => ({
          color,
          gameId,
          gameStatus: "reconnected",
          gamestarted: true,
          fen: fen ?? state.fen,
          moves: moves ?? state.moves,
        })),
    }),
    {
      name: "game-storage",
      //Persist only the minimum required to resume game after reload
      partialize: (state) => ({
        guestId: state.guestId,
        color: state.color,
        gameId: state.gameId,
        moves: state.moves,
        fen: state.fen,
        gamestarted: state.gamestarted,
        gameStatus: state.gameStatus,
      }),
    }
  )
);