// useSocketHandlers.ts
import { useEffect } from "react";
import { useGameStore } from "../stores/useGameStore";
import { useSocket } from "./useSocket";
import { GameMessages } from "../constants";
import { Chess } from "chess.js";

export function useSocketHandlers() {
  const socket = useSocket();
  const { initGame, endGame, setFen, addMove, reconnect, fen } = useGameStore();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      const { type, payload } = message;

      switch (type) {
        case GameMessages.INIT_GAME: {
          const { color, gameId } = payload;
          initGame(color, gameId);
          break;
        }

        case GameMessages.GAME_FOUND: {
          const { fen, color, gameId } = payload;
          setFen(fen);
          reconnect(color, gameId);
          break;
        }

        case GameMessages.MOVE: {
          const { from, to, promotion } = payload;
          const chess = new Chess(fen);
          const move = chess.move({ from, to, promotion });
          if (move) {
            setFen(chess.fen());
            addMove(move);
          }
          break;
        }

        case GameMessages.CHECK: {
          alert("Check is there");
          break;
        }

        case GameMessages.TIME_EXCEEDED: {   
          const { fen } = payload;
          setFen(fen);
          break;
        }

        case GameMessages.GAME_OVER: {
          const { winner } = payload;
          const loser = winner === "w" ? "b" : "w";
          endGame(winner, loser);
          break;
        }

        default:
          console.warn("Unknown message type:", type, payload);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, fen]);
}
