import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { GameMessages } from "../constants";
import { useQueryClient } from "@tanstack/react-query";
import { ServerMessage } from "../types/socket";
export function useSocketHandlers() {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const message: ServerMessage = JSON.parse(event.data);
      const { type, payload } = message;

      switch (type) {
        case GameMessages.INIT_GAME: {
          console.log(payload);
          queryClient.setQueryData(["game"], payload);
          break;
        }

        case GameMessages.GAME_FOUND: {
                    console.log(payload);

          queryClient.setQueryData(["game"], payload);
          break;
        }

        case GameMessages.MOVE: {
                    console.log(payload);

          queryClient.setQueryData(["game"], (old: any) => ({
            ...old,
            fen: payload.fen,
            moves: [...(old?.moves ?? []), payload.move],
          }));
          break;
        }

        case GameMessages.CHECK: {
          console.log(payload);
          queryClient.setQueryData(["game"], (old: any) => ({
            ...old,
            isCheck: true,
            lastMove: payload.move,
          }));
          break;
        }

        case GameMessages.TIME_EXCEEDED: {
                    console.log(payload);
          queryClient.setQueryData(["game"], (old: any) => ({
            ...old,
            fen: payload.fen,
          }));
          break;
        }

        case GameMessages.GAME_OVER: {
                    console.log(payload);
          queryClient.setQueryData(["game"], (old: any) => ({
            ...old,
            winner: payload.winner,
            status: "over",
          }));
          break;
        }

        default:
          console.log("Unknown message type:", type, payload);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, queryClient]);
}
