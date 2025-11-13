import { create } from "zustand";
import { persist } from "zustand/middleware";
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

  //room-state
  roomId:string;
  isRoomCreator: boolean;
  opponentId:number | null;
  opponentName:string | null;
  roomGameId:number | null;
  roomStatus:"WAITING" | "FULL" |"CANCELLED" | "ACTIVE" | "FINISHED" | null;
  chatMsg:Array<{
    sender:number,
    message:string,
    timestamp:number
  }>;

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
  
  // Room actions
  setRoomInfo: (roomInfo: {
    code: string;
    status: string;
    playerCount: number;
    isCreator: boolean;
    opponentId: number | null;
    opponentName: string | null;
    gameId: string | null;
  }) => void;
  
  syncRoomId: (roomId: string) => void;
  cancelRoom: () => Promise<void>;
  
  // Room game actions
  startRoomGame: () => void;
  leaveRoom: () => Promise<void>;
  exitRoom: () => void; // Just reset state without API call
  resignRoomGame: () => void;

  // Socket actions
  move: (move: Move) => void;
  initGameRequest: () => void;
  resign: () => void;
  offerDraw: () => void;
  acceptDraw: () => void;
  rejectDraw: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
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

  // ✅ Initial room state
  roomId: "",
  isRoomCreator: false,
  opponentId: null,
  opponentName: null,
  roomGameId: null,
  roomStatus: null,
  chatMsg: [],

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
    set((state) => ({
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
      drawOfferCount:payload.count ?? 0,
      // Preserve room state during reconnection
      isRoomCreator: state.isRoomCreator,
      roomId: state.roomId,
      roomStatus: state.roomStatus,
      opponentName: state.opponentName,
      roomGameId: state.roomGameId,
    }));
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
    const { gameId, roomGameId } = get();
    
    // Check if it's a room game or regular game
    if (roomGameId) {
      // Room game move
      SocketManager.getInstance().send({
        type: GameMessages.ROOM_MOVE,
        payload: { ...move, roomGameId },
      });
    } else if (gameId) {
      // Regular game move
      SocketManager.getInstance().send({
        type: GameMessages.MOVE,
        payload: { ...move, gameId },
      });
    } else {
      console.error("No gameId or roomGameId available for move");
    }
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
    const { gameId, roomGameId } = get();
    if (!gameId && !roomGameId) return;

    SocketManager.getInstance().send({
      type: GameMessages.OFFER_DRAW,
      payload: roomGameId ? { roomGameId } : {},
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
    const { gameId, roomGameId } = get();
    if (!gameId && !roomGameId) return;

    SocketManager.getInstance().send({
      type: GameMessages.ACCEPT_DRAW,
      payload: roomGameId ? { roomGameId } : {},
    });

    set({
      drawOfferReceived: false,
      gameStatus: GameMessages.GAME_OVER,
      winner: "draw",
      loser: null,
    });
  },

  rejectDraw: () => {
    const { gameId, roomGameId } = get();
    if (!gameId && !roomGameId) return;

    SocketManager.getInstance().send({
      type: GameMessages.REJECT_DRAW,
      payload: roomGameId ? { roomGameId } : {},
    });

    set({
      drawOfferReceived: false,
      drawOfferSent: false,
    });
  },

  // ✅ Room action
  setRoomInfo: (roomInfo) => {
    // console.log("🏠 setRoomInfo called with:", roomInfo);
    set({
      roomId: roomInfo.code,
      isRoomCreator: roomInfo.isCreator,
      opponentId: roomInfo.opponentId,
      opponentName: roomInfo.opponentName,
      roomStatus: roomInfo.status as "WAITING" | "FULL" | "CANCELLED" | "ACTIVE" | "FINISHED",
      roomGameId: roomInfo.gameId ? Number(roomInfo.gameId) : null,
    });
    // console.log("✅ Room state updated - isCreator:", roomInfo.isCreator);
  },

  syncRoomId: (roomId) => {
    // console.log("🔄 syncRoomId called with:", roomId);
    const { roomId: currentRoomId } = get();
    
    // Only update if the store doesn't have a roomId or it's different
    if (!currentRoomId || currentRoomId !== roomId) {
      set({
        roomId: roomId,
        // Set minimal state indicating we have a room but need more info
        roomStatus: null,
      });
      // console.log("✅ Room ID synced from URL:", roomId);
    }
  },

  // ✅ Cancel room and reset state
  cancelRoom: async () => {
    const { roomId } = get();
    // console.log("❌ cancelRoom called with:", roomId);
    
    if (!roomId) {
      // console.log("❌ No roomId found, cannot cancel");
      return;
    }

    try {
      const { roomApis } = await import("../api/api");
      await roomApis.cancelRoom(roomId);
      // console.log(`✅ Room ${roomId} cancelled successfully`);
      
      // Reset room state
      set({
        roomId: "",
        isRoomCreator: false,
        opponentId: null,
        opponentName: null,
        roomGameId: null,
        roomStatus: null,
      });
    } catch (error) {
      console.error("❌ Failed to cancel room:", error);
      throw error;
    }
  },

  // ✅ Start room game (only room creator can do this)
  startRoomGame: () => {
    const { roomId } = get();
    if (!roomId) {
      console.error("No room ID available");
      return;
    }

    SocketManager.getInstance().send({
      type: GameMessages.INIT_ROOM_GAME,
      payload: { roomId },
    });
  },

  // ✅ Leave room (before game starts) - ONLY CALLS CANCEL API
  leaveRoom: async () => {
    const { roomId, roomStatus, isRoomCreator } = get();
    
    // console.log("🚪 leaveRoom called with:", { roomId, roomStatus, isRoomCreator });
    
    if (!roomId) {
      // console.log("❌ No roomId found, returning early");
      return;
    }

    // ALWAYS call the cancel API - NO WebSocket messages
    console.log("🔄 Calling cancel API for room:", roomId);
    try {
      const { roomApis } = await import("../api/api");
      await roomApis.cancelRoom(roomId);
      // console.log(`✅ Room ${roomId} cancelled successfully via API`);
    } catch (error) {
      console.error("❌ Failed to cancel room:", error);
      throw error; // Re-throw so caller knows it failed
    }

    // Reset room state ONLY after successful API call
    // console.log("🧹 Resetting room state");
    set({
      roomId: "",
      isRoomCreator: false,
      opponentId: null,
      opponentName: null,
      roomGameId: null,
      roomStatus: null,
      chatMsg: [],
    });
  },

  // ✅ Exit room after game is over - NO API CALL
  exitRoom: () => {
    console.log("👋 exitRoom called - just resetting state (no API call)");
    
    // Just reset the room state without calling cancel API
    set({
      roomId: "",
      isRoomCreator: false,
      opponentId: null,
      opponentName: null,
      roomGameId: null,
      roomStatus: null,
      chatMsg: [],
      // Also reset game state
      gameStatus: GameMessages.INIT_GAME,
      gameStarted: false,
      moves: [],
      validMoves: [],
      selectedSquare: null,
      winner: null,
      loser: null,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      whiteTimer: 600,
      blackTimer: 600,
    });
  },

  // ✅ Resign from room game (during game)
  resignRoomGame: () => {
    const { roomGameId } = get();
    if (!roomGameId) return;

    SocketManager.getInstance().send({
      type: GameMessages.ROOM_LEAVE_GAME,
      payload: { roomGameId },
    });

    set({
      gameStatus: GameMessages.GAME_OVER,
    });
  },
}),
    {
      name: "chess-game-storage", // localStorage key
      partialize: (state) => ({
        // Only persist room-related state
        roomId: state.roomId,
        isRoomCreator: state.isRoomCreator,
        opponentId: state.opponentId,
        opponentName: state.opponentName,
        roomStatus: state.roomStatus,
        roomGameId: state.roomGameId,
      }),
    }
  )
);
