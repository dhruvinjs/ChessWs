import { useState, useRef } from "react";
import { Chess } from "chess.js";
import { useGameStore } from "../stores/useGameStore";
import { useSocket } from "./useSocket";
import { GameMessages } from "../constants";

export function useChess() {
  const chess = useRef(new Chess()); 
  const [fen, setFen] = useState(chess.current.fen()); 
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const { addMove, gameId } = useGameStore(); 
  const socket = useSocket();

  const makeMove = (from: string, to: string) => {
    const move = chess.current.move({ from, to, promotion: "q" });
    if (move) {
      setFen(chess.current.fen());
      addMove({ from, to });

  
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: GameMessages.MOVE,
          payload: {
            gameId,
            from,
            to,
            promotion: "q",
          },
        }));
      }
    }
  };

  const handleSquareClick = (square: string) => {
    if (!selectedSquare) {
      setSelectedSquare(square);
    } else {
      makeMove(selectedSquare, square);
      setSelectedSquare(null);
    }
  };

  return {
    fen,
    handleSquareClick,
    selectedSquare,
    makeMove,
    reset: () => {
      chess.current.reset();
      setFen(chess.current.fen());
    },
  };
}
