import { useState, useCallback, useMemo } from 'react';
import { Chess, Move } from 'chess.js';
import { GameState } from '../types/chess';

export function useChess  ()  {
  const [game] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: game.board(),
    turn: game.turn(),
    isGameOver: game.isGameOver(),
    isCheck: game.inCheck(),
    moveHistory: game.history()
  });

  // Memoized valid moves to prevent recalculation
  const validMoves = useMemo((): Move[] => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare as any, verbose: true }) as Move[];
  }, [selectedSquare, gameState]);

  // Memoized last move squares
  const lastMoveSquares = useMemo(() => {
    const history = game.history({ verbose: true });
    if (history.length === 0) return [];
    const lastMove = history[history.length - 1];
    return [lastMove.from, lastMove.to];
  }, [gameState.moveHistory]);

  const updateGameState = useCallback(() => {
    setGameState({
      board: game.board(),
      turn: game.turn(),
      isGameOver: game.isGameOver(),
      isCheck: game.inCheck(),
      moveHistory: game.history()
    });
  }, [game]);

  const handleSquareClick = useCallback((square: string) => {
    if (selectedSquare) {
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q' // Always promote to queen for simplicity
        });
        
        if (move) {
          updateGameState();
          setSelectedSquare(null);
          return;
        }
      } catch (error) {
        // Invalid move, continue to selection logic
      }
    }

    // Select/deselect square
    const piece = game.get(square as any);
    if (piece && piece.color === gameState.turn) {
      setSelectedSquare(selectedSquare === square ? null : square);
    } else {
      setSelectedSquare(null);
    }
  }, [selectedSquare, gameState.turn, game, updateGameState]);

  const resetGame = useCallback(() => {
    game.reset();
    setSelectedSquare(null);
    updateGameState();
  }, [game, updateGameState]);

  return {
    gameState,
    selectedSquare,
    validMoves,
    lastMoveSquares,
    handleSquareClick,
    resetGame
  };
};
//todo add the tanstack query bascially to add the server side logic and make it fully functional