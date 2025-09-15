import { useCallback } from "react";
import { useSocket } from "./useSocket";
import { GameMessages } from "../constants";
import toast from "react-hot-toast";
import { MovePayload } from "../types/chess";

export function useSendSocket() {
  const socket = useSocket();

  const send = useCallback(
    (type: string, payload?: any) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn("⚠️ Socket not ready, cannot send:", type, payload);
        return;
      }

      const message = payload ? { type, payload } : { type };
      socket.send(JSON.stringify(message));
    },
    [socket]
  );

  return {
    initGame: () => {
      send(GameMessages.INIT_GAME);
      toast.success("added in queue!");
    },

    move: (move: MovePayload) =>
      send(GameMessages.MOVE, move),

    requestValidMoves: (square: string) =>
      send(GameMessages.REQUEST_VALID_MOVES, { square }),

    resign: () =>
      send(GameMessages.LEAVE_GAME),
  };
}
