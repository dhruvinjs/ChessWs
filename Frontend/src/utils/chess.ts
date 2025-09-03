import { ChessPiece } from '../types/chess';

export function getSquareName  (row: number, col: number) {
  return String.fromCharCode(97 + col) + (8 - row);
};

export function getPieceNotation (piece: ChessPiece | null) {
  if (!piece) return null;
  return `${piece.color}${piece.type.toUpperCase()}`;
};