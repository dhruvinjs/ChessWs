import { Move } from "chess.js";
export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  square?: string;
}

export type BoardType=ChessPiece | null
// A chess board is an 8×8 2D array of squares
export type ChessBoard=BoardType[][]

//GameState
export interface GameState{
    board:ChessBoard,
    turn:PieceColor,
    isGameOver: boolean;
    isCheck: boolean;
    moveHistory:string[],
}

export type{Move}
export interface SquareProps{
    piece:string |  null,
    isLight:boolean,
    isSelected:boolean,
    isLastMove:boolean,
    isValidMove:boolean,
    onClick:()=>void
}



