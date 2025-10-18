import { ChessPiece } from '../types/chess';
import { Square } from 'chess.js';

export const getSquare = (row: number, col: number, playerColor: 'w' | 'b'): Square => {
  const file = String.fromCharCode('a'.charCodeAt(0) + (playerColor === 'w' ? col : 7 - col));
  const rank = playerColor === 'w' ? 8 - row : row + 1;
  return `${file}${rank}` as Square;
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

export const getPieceFromFen = (fen: string, squareName: string): string | null => {
    const fenBoard = fen.split(" ")[0];
    const rows = fenBoard.split("/");
    const file = squareName.charCodeAt(0) - "a".charCodeAt(0);
    const rank = 8 - parseInt(squareName.substring(1), 10);

    if (rank < 0 || rank >= 8 || file < 0 || file >= 8) {
        return null;
    }

    const rowFen = rows[rank];
    if (!rowFen) return null;

    let currentFile = 0;
    for (const char of rowFen) {
        if (isNaN(parseInt(char, 10))) {
            if (currentFile === file) {
                const pieceColor = char === char.toUpperCase() ? "w" : "b";
                return `${pieceColor}${char.toUpperCase()}`;
            }
            currentFile++;
        } else {
            const emptySquares = parseInt(char, 10);
            if (currentFile + emptySquares > file) {
                return null;
            }
            currentFile += emptySquares;
        }
    }

    return null;
};
