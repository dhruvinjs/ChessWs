import { Move, Square, Piece } from "chess.js";

export type PieceColor = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  square?: string;
}

export type BoardType = ChessPiece | null;
export type ChessBoard = BoardType[][];
export type ChessLevel = "BEGINNER" | "INTERMEDIATE" | "PRO";

//GameState
export interface GameState {
  board: ChessBoard;
  turn: PieceColor;
  isGameOver: boolean;
  isCheck: boolean;
  moveHistory: string[];
}

export type { Move, Square, Piece };

// Move payload for socket communication
export interface MovePayload {
  from: Square;
  to: Square;
  promotion?: string;
}

// Enhanced Move with game context
export interface GameMove extends Move {
  gameId: string;
}

export interface SquareProps {
  piece: string | null;
  isLight: boolean;
  isSelected: boolean;
  isLastMove: boolean;
  isValidMove: boolean;
  onClick: () => void;
  rankLabel?: string | null;
  fileLabel?: string | null;
}

export const GameMessages = {
  INIT_GAME: "init_game",
  MOVE: "move",
  GAME_OVER: "game_over",
  GAME_DRAW: "game_draw",
  GAME_STARTED: "game_started",
  GAME_ENDED: "game_ended",
  DISCONNECTED: "player_left",
  CHECK: "check_move",
  WRONG_PLAYER_MOVE: "wrong_player_move",
  STALEMATE: "game_drawn",
  OPP_RECONNECTED: "opp_reconnected",
  GAME_FOUND: "existing_game_found",
  TIME_EXCEEDED: "time_exceeded",
  GAME_ACTIVE: "ongoing_game",
  LEAVE_GAME: "leave_game",
  TIMER_UPDATE: "timer_update",
  SERVER_ERROR: "server_error",
  SEARCHING: "searching",
  ASSIGN_ID: "assign_id",
  RECONNECT: "reconnect",
  OFFER_DRAW: "offer_draw",
  DRAW_OFFERED: "draw_offered",
  ACCEPT_DRAW: "accept_draw",
  REJECT_DRAW: "reject_draw",
  DRAW_ACCEPTED: "draw_accepted",
  DRAW_REJECTED: "draw_rejected",
  DRAW_LIMIT_REACHED: "draw_limit_reached",
  DRAW_COOLDOWN: "draw_cooldown",
  USER_HAS_JOINED: "user_has_joined",
  INIT_ROOM_GAME: "init_room_game",
  ASSIGN_ID_FOR_ROOM: "assign_id_for_room",
  ROOM_GAME_ACTIVE: "room_game_active",
  ROOM_GAME_OVER: "room_game_over",
  ROOM_TIMER_UPDATE: "room_timer_update",
  ROOM_TIME_EXCEEDED: "room_timer_exceeded",
  ROOM_MOVE: "room_move",
  ROOM_GAME_NOT_FOUND: "room_game_not_found",
  ROOM_LEAVE_GAME: "room_leave_game",
  NO_ROOM_RECONNECTION: "no_room_reconnection",
  WRONG_ROOM_MESSAGE: "wrong_room_message",
  ILLEGAL_ROOM_MOVE: "illegal_room_move",
  ROOM_DRAW: "room_draw",
  ROOM_RECONNECT: "room_reconnect",
  OPP_ROOM_RECONNECTED: "opp_room_reconnect",
  ROOM_OPPONENT_LEFT: "room_opponent_left",
  ROOM_NOT_FOUND: "room_not_found",
  ROOM_GAME_ACTIVE_ERROR: "room_game_active_error",
  ROOM_NOT_READY: "room_not_ready",
  UNAUTHORIZED: "unauthorized",
  PAYLOAD_ERROR: "payload_error",
  ROOM_OPP_DISCONNECTED: "room_opp_disconnected",
  ROOM_READY_TO_START: "room_ready_to_start",
  ROOM_CHAT: "room_chat",
  LEAVE_ROOM: "leave_room",
  ROOM_LEFT: "room_left",
  // Queue related messages
  ALREADY_IN_QUEUE: "already_in_queue",
  QUEUE_EXPIRED: "queue_expired",
  NO_ACTIVE_USERS: "no_active_users",
  MATCH_NOT_FOUND: "match_not_found",
  CANCEL_SEARCH: "cancel_search",
  SEARCH_CANCELLED: "search_cancelled",
};
// Add this to your types/chess.ts file in frontend

export const ComputerGameMessages = {
  //No Draw offers are there either you win or lose
  COMPUTER_GAME_ACTIVE: "computer_game_active",
  COMPUTER_GAME_OVER: "computer_game_over",
  INIT_COMPUTER_GAME: "init_computer_game",
  NO_ACTIVE_GAME: "no_active_game",
  CHECK_ACTIVE_GAME: "check_active_game",
  RECONNECT_COMPUTER_GAME: "reconnect_computer_game",
  PLAYER_MOVE: "player_move",
  PLAYER_QUIT: "player_quit",
  PLAYER_WON: "player_won",
  COMPUTER_WON: "computer_won",
  COMPUTER_LOST: "computer_lost",
  COMPUTER_MOVE: "computer_move",
  NOT_YOUR_TURN: "not_your_turn",
  PLAYER_CHECK: "player_check",
  COMPUTER_CHECK: "computer_check",
  EXISTING_COMPUTER_GAME: "existing_computer_game",
} as const;

// Unicode chess pieces
export const PIECE_SYMBOLS: Record<string, string> = {
  wK: "♔",
  wQ: "♕",
  wR: "♖",
  wB: "♗",
  wN: "♘",
  wP: "♙",
  bK: "♚",
  bQ: "♛",
  bR: "♜",
  bB: "♝",
  bN: "♞",
  bP: "♟",
};
