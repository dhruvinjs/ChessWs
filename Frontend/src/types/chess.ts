import { Move, Square, Piece } from "chess.js";

export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  square?: string;
}

export type BoardType=ChessPiece | null
export type ChessBoard=BoardType[][]
export type ChessLevel = "BEGINNER" | "INTERMEDIATE" | "PRO";

//GameState
export interface GameState{
    board:ChessBoard,
    turn:PieceColor,
    isGameOver: boolean;
    isCheck: boolean;
    moveHistory:string[],
}

export type{Move,Square,Piece}

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

export interface SquareProps{
    piece:string |  null,
    isLight:boolean,
    isSelected:boolean,
    isLastMove:boolean,
    isValidMove:boolean,
    onClick:()=>void
}


export  const  GameMessages= {
  INIT_GAME : 'init_game',
  MOVE : 'move',
  GAME_OVER : 'game_over',
  GAME_STARTED : 'game_started',
  GAME_ENDED : 'game_ended',
  DISCONNECTED : 'player_left',
  CHECK : 'check_move',
  WRONG_PLAYER_MOVE : 'wrong_player_move',
  STALEMATE : 'game_drawn',
  OPP_RECONNECTED : 'opp_reconnected',
  GAME_FOUND : 'existing_game_found',
  TIME_EXCEEDED:"time_exceeded",
  GAME_ACTIVE:"ongoing_game",
  LEAVE_GAME:"leave_game",
  TIMER_UPDATE:"timer_update",
  SERVER_ERROR:"server_error",
  SEARCHING: "searching",
  ASSIGN_ID:"assign_id",
  RECONNECT:"reconnect",
 OFFER_DRAW:"offer_draw",
 DRAW_OFFERED : "draw_offered",
 ACCEPT_DRAW : "accept_draw",
 REJECT_DRAW : "reject_draw",
 DRAW_ACCEPTED : "draw_accepted",
 DRAW_REJECTED : "draw_rejected",
} 

// Unicode chess pieces
export const PIECE_SYMBOLS: Record<string, string> = {
  'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
  'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
};
