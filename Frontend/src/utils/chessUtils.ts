import { ChessPiece } from '../types/chess';

export const getSquare = (row: number, col: number, playerColor: 'w' | 'b'): string => {
  const file = String.fromCharCode('a'.charCodeAt(0) + (playerColor === 'w' ? col : 7 - col));
  const rank = playerColor === 'w' ? 8 - row : row + 1;
  return `${file}${rank}`;
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

export const getSquareColor = (row: number, col: number): 'light' | 'dark' => {
  return (row + col) % 2 === 0 ? 'light' : 'dark';
};
