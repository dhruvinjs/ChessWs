// useSocketHandlers.ts
import { useEffect } from "react";
import { useGameStore } from "../stores/useGameStore";
import { useSocket } from "./useSocket";
import { GameMessages } from "../constants";

export function useSocketHandlers() {
  const socket = useSocket();
  const { initGame, endGame, setFen, addMove, reconnect } = useGameStore();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      const { type, payload } = message;

      switch (type) {
        case GameMessages.INIT_GAME: {
          const { color, gameId,fen } = payload;
          initGame(color, gameId,fen);
          break;
        }

        case GameMessages.GAME_FOUND: {
          const { fen, color, gameId, moves } = payload;
          setFen(fen);
          reconnect(color, gameId, fen, moves);
          break;
        }

        case GameMessages.MOVE: {
          const { fen, move } = payload;
          setFen(fen);
          addMove(move);
          break;
        }

        case GameMessages.CHECK: {
          // you can still alert if you want, but server drives this
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
  }, [socket, initGame, endGame, setFen, addMove, reconnect]);
}
