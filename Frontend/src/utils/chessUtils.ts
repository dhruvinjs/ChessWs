import { ChessPiece } from '../types/chess';

export function getSquareName  (row: number, col: number) {
  return String.fromCharCode(97 + col) + (8 - row);
};

export function getPieceNotation (piece: ChessPiece | null) {
  if (!piece) return null;
  return `${piece.color}${piece.type.toUpperCase()}`;
};

// Convert square name to coordinates
export function getSquareCoordinates(square: string): [number, number] {
  const col = square.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
  const row = 8 - parseInt(square[1]); // '8' = 0, '7' = 1, etc.
  return [row, col];
}