import { useState, useCallback, useMemo } from 'react';
import { Chess, Move } from 'chess.js';
import type { GameState, ChessBoard as ChessBoardType, MovePayload } from '../types/chess';
import { useSendSocket } from './useSendSocket';
import { useGame } from './useGame';
import { useUserStore } from '../stores/useUserStore';
import toast from 'react-hot-toast';

export function useChess() {
  const [chess] = useState(() => new Chess());
  const [gameVersion, setGameVersion] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMoveSquares, setLastMoveSquares] = useState<string[]>([]);
  
  const { move } = useSendSocket();
  const gameData  = useGame();
  const { user } = useUserStore();

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
  }, [chess, gameVersion]); // Remove dependency on gameData to prevent unnecessary re-renders

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
    
    console.log('Square clicked:', square);
    console.log('Current turn:', gameState.turn);
    console.log('Player color:', gameData?.color);
    console.log('Game data:', gameData);
    
    // Check if it's the player's turn in online game
    if (gameData && user) {
      const isPlayerTurn = gameData.color === gameState.turn;
      
      if (!isPlayerTurn) {
        console.log('Not player turn - Player:', gameData.color, 'Current turn:', gameState.turn);
        toast.error(`It's not your turn! Current turn: ${gameState.turn === 'w' ? 'White' : 'Black'}`);
        return;
      }
    }

    // If no square is selected, select this square if it has a piece of current player
    if (!selectedSquare) {
      const piece = chess.get(square as any);
      if (piece && piece.color === gameState.turn) {
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
      const movePayload: MovePayload = {
        from: selectedSquare as any,
        to: square as any,
        promotion: 'q' // Always promote to queen for simplicity
      };
      
      console.log('Attempting move:', movePayload);
      const moveResult = chess.move(movePayload);

      if (move) {
        console.log('Move successful:', moveResult);
        
        // Send move to backend if in online game
        if (gameData && user) {
          console.log('Sending move to backend:', movePayload);
          move(movePayload);
        }
        
        setLastMoveSquares([selectedSquare, square]);
        setSelectedSquare(null);
        setGameVersion(prev => prev + 1); // Force re-render
        console.log('Move applied locally');
      } else {
        console.log('Move failed, trying to select new square');
        // If move failed, try selecting the new square
        const piece = chess.get(square as any);
        if (piece && piece.color === gameState.turn) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      }
    } catch (error) {
      console.error('Move error:', error);
      toast.error('Invalid move!');
      // If move failed, try selecting the new square
      const piece = chess.get(square as any);
      if (piece && piece.color === gameState.turn) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    }
  }, [chess, selectedSquare, gameState.isGameOver, gameState.turn, gameData, user, move]);

  // Function to apply move from opponent
      const applyOpponentMove = useCallback((movePayload: MovePayload & { fen?: string; turn?: "w" | "b" }) => {
        try {
          if (movePayload.fen) {
            // backend is source of truth
            chess.load(movePayload.fen);
            setLastMoveSquares([movePayload.from, movePayload.to]);
            setSelectedSquare(null);
            setGameVersion(prev => prev + 1);
            console.log("Opponent move applied from backend FEN:", movePayload);
          } else {
            // fallback if no FEN provided
            const move = chess.move(movePayload);
            if (move) {
              setLastMoveSquares([movePayload.from, movePayload.to]);
              setSelectedSquare(null);
              setGameVersion(prev => prev + 1);
              console.log("Opponent move applied locally:", movePayload);
            }
          }
        } catch (error) {
          console.error("Error applying opponent move:", error);
        }
      }, [chess]);

      // Function to sync game state from FEN
      const syncGameState = useCallback((fen: string) => {
        try {
          chess.load(fen);
          setSelectedSquare(null);
          setGameVersion(prev => prev + 1);
          console.log("Game state synced with FEN:", fen);
        } catch (error) {
          console.error("Error syncing game state:", error);
        }
      }, [chess]);

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
    resetGame,
    applyOpponentMove,
    syncGameState
  };
}