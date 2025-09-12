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

      // If payload is not needed, just send type
      const message = payload ? { type, payload } : { type };
      socket.send(JSON.stringify(message));
    },
    [socket]
  );

  return {
    initGame: () => {
        send(GameMessages.INIT_GAME)
        toast.success("added in queue!");

    },

    move: (move:MovePayload) =>
      send(GameMessages.MOVE, {  move }),

    // offerDraw: (gameId: string) =>
    //   send(GameMessages.OFFER_DRAW, { gameId }),

    resign: () =>
      send(GameMessages.LEAVE_GAME)

    // acceptDraw: (gameId: string) =>
    //   send(GameMessages.ACCEPT_DRAW, { gameId }),

    // declineDraw: (gameId: string) =>
    //   send(GameMessages.DECLINE_DRAW, { gameId }),
  };
}
    