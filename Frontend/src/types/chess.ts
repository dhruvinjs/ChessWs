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


