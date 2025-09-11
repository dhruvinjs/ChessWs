import { useState, useCallback, useMemo } from 'react';
import { Chess, Move } from 'chess.js';
import { GameState, ChessBoard as ChessBoardType } from '../types/chess';

export function useChess() {
  const [chess] = useState(() => new Chess());
  const [gameVersion, setGameVersion] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMoveSquares, setLastMoveSquares] = useState<string[]>([]);

  // Convert chess.js board to our board format
  const convertBoard = useCallback((): ChessBoardType => {
    const board: ChessBoardType = [];
    for (let i = 0; i < 8; i++) {
      board[i] = [];
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = chess.get(square as any);
        board[i][j] = piece ? {
          type: piece.type,
          color: piece.color,
          square
        } : null;
      }
    }
    return board;
  }, [chess, gameVersion]);

  // Memoized game state to prevent unnecessary recalculations
  const gameState = useMemo((): GameState => ({
    board: convertBoard(),
    turn: chess.turn(),
    isGameOver: chess.isGameOver(),
    isCheck: chess.inCheck(),
    moveHistory: chess.history()
  }), [chess, convertBoard, gameVersion]);

  // Get valid moves for selected square
  const validMoves = useMemo((): Move[] => {
    if (!selectedSquare) return [];
    return chess.moves({ square: selectedSquare as any, verbose: true });
  }, [chess, selectedSquare, gameVersion]);

  // Handle square click with optimized logic
  const handleSquareClick = useCallback((square: string) => {
    if (gameState.isGameOver) return;

    // If no square is selected, select this square if it has a piece of current player
    if (!selectedSquare) {
      const piece = chess.get(square as any);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    // If clicking the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // Try to make a move
    try {
      const move = chess.move({
        from: selectedSquare as any,
        to: square as any,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move) {
        setLastMoveSquares([selectedSquare, square]);
        setSelectedSquare(null);
        setGameVersion(prev => prev + 1); // Force re-render
      } else {
        // If move failed, try selecting the new square
        const piece = chess.get(square as any);
        if (piece && piece.color === chess.turn()) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      }
    } catch (error) {
      // If move failed, try selecting the new square
      const piece = chess.get(square as any);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    }
  }, [chess, selectedSquare, gameState.isGameOver]);

  // Reset game function
  const resetGame = useCallback(() => {
    chess.reset();
    setSelectedSquare(null);
    setLastMoveSquares([]);
    setGameVersion(prev => prev + 1); // Force re-render
  }, [chess]);

  return {
    gameState,
    selectedSquare,
    validMoves,
    lastMoveSquares,
    handleSquareClick,
    resetGame
  };
}