import { useState, useCallback, useMemo } from 'react';
import { Chess, Move, Square } from 'chess.js';
import { GameState, ChessBoard as ChessBoardType, MovePayload } from '../types/chess';
import { useSendSocket } from './useSendSocket';
import { useGame } from './useGame';
import { useUserStore } from '../stores/useUserStore';
import toast from 'react-hot-toast';

export function useChess() {
  const [chess] = useState(() => new Chess());
  const [gameVersion, setGameVersion] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMoveSquares, setLastMoveSquares] = useState<Square[]>([]);

  const { move: sendMove } = useSendSocket();
  const { data: gameData } = useGame();
  const { user } = useUserStore();

  const convertBoard = useCallback((): ChessBoardType => {
    const board: ChessBoardType = [];
    for (let i = 0; i < 8; i++) {
      board[i] = [];
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = chess.get(square as any);
        board[i][j] = piece
          ? { type: piece.type, color: piece.color, square }
          : null;
      }
    }
    return board;
  }, [chess, gameVersion]);

  const gameState = useMemo((): GameState => ({
    board: convertBoard(),
    turn: chess.turn(),
    isGameOver: chess.isGameOver(),
    isCheck: chess.inCheck(),
    moveHistory: chess.history()
  }), [chess, convertBoard, gameVersion]);

  const validMoves = useMemo((): Move[] => {
    if (!selectedSquare) return [];
    return chess.moves({ square: selectedSquare as any, verbose: true });
  }, [chess, selectedSquare, gameVersion]);

  const handleSquareClick = useCallback((square: Square) => {
    if (gameState.isGameOver) return;

    // ✅ Check player's turn for online game
    if (gameData && user) {
      const isPlayerTurn =
        (gameData.color === "w" && gameState.turn === "w") ||
        (gameData.color === "b" && gameState.turn === "b");
      if (!isPlayerTurn) {
        toast.error("It's not your turn!");
        return;
      }
    }

    // ✅ Select piece if none selected
    if (!selectedSquare) {
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    // ✅ Deselect if clicking same square
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    try {
      const movePayload: MovePayload = {
        from: selectedSquare,
        to: square,
        promotion: "q", // auto promote to queen
      };

      const move = chess.move(movePayload);

      if (!move) {
        const piece = chess.get(square);
        if (piece && piece.color === chess.turn()) setSelectedSquare(square);
        else setSelectedSquare(null);
        return;
      }

      // ✅ Send only the payload to backend; backend handles gameId
      sendMove(move)

      setLastMoveSquares([selectedSquare, square]);
      setSelectedSquare(null);
      setGameVersion(prev => prev + 1);

    } catch (error) {
      console.error("Move error:", error);
      toast.error("Invalid move!");
      setSelectedSquare(null);
    }
  }, [chess, selectedSquare, gameState.isGameOver, gameState.turn, gameData, user, sendMove]);

  const applyOpponentMove = useCallback((movePayload: MovePayload) => {
    try {
      const move = chess.move(movePayload);
      if (move) {
        setLastMoveSquares([movePayload.from, movePayload.to]);
        setSelectedSquare(null);
        setGameVersion(prev => prev + 1);
        console.log('Opponent move applied:', movePayload);
      }
    } catch (error) {
      console.error('Error applying opponent move:', error);
    }
  }, [chess]);

  const syncGameState = useCallback((fen: string) => {
    try {
      chess.load(fen);
      setSelectedSquare(null);
      setGameVersion(prev => prev + 1);
      console.log('Game state synced with FEN:', fen);
    } catch (error) {
      console.error('Error syncing game state:', error);
    }
  }, [chess]);

  return {
    gameState,
    selectedSquare,
    validMoves,
    lastMoveSquares,
    handleSquareClick,
    applyOpponentMove,
    syncGameState
  };
}
