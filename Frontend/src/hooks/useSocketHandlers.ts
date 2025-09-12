import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { GameMessages } from "../constants";
import { useQueryClient } from "@tanstack/react-query";
import { MovePayload } from "../types/chess";
import toast from "react-hot-toast";

export function useSocketHandlers(applyOpponentMove?: (move: MovePayload) => void, syncGameState?: (fen: string) => void) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;
        
        console.log("📥 Received message:", type, payload);

        switch (type) {

          case GameMessages.INIT_GAME: {
            console.log("Game started:", payload);
            toast.success(`Game started! You are ${payload.color === 'w' ? 'White' : 'Black'}`);
            queryClient.setQueryData(["game"], payload);
            
            // Sync the chess board with the initial FEN
            if (syncGameState && payload.fen) {
              syncGameState(payload.fen);
            }
            break;
          }

          case GameMessages.GAME_FOUND: {
            console.log("Existing game found:", payload);
            toast.success("Reconnected to existing game!");
            queryClient.setQueryData(["game"], payload);
            
            // Sync the chess board with the current FEN
            if (syncGameState && payload.fen) {
              syncGameState(payload.fen);
            }
            break;
          }

          case GameMessages.MOVE: {
            console.log("Move received:", payload);
            
            // Apply the opponent's move to the chess board
            if (applyOpponentMove && payload.move) {
              const movePayload: MovePayload = {
                from: payload.move.from,
                to: payload.move.to,
                promotion: payload.move.promotion
              };
              applyOpponentMove(movePayload);
            }
            
            toast.success("Opponent moved!");
            break;
          }

          case GameMessages.CHECK: {
            console.log("Check:", payload);
            
              toast("Check applied!", {
                      icon: "⚠️",
                      style: {
                        background: "#f59e0b", // amber warning color
                        color: "#000",
                        fontWeight: "600",
                      },
                      duration: 3000, // auto close in 3s
                });
            break;
          }

          case GameMessages.TIMER_UPDATE: {
            // console.log("Timer update:", payload);
            queryClient.setQueryData(["game"], (old: any) => ({
              ...old,
              whiteTimer: payload.whitetimer || payload.whiteTimer,
              blackTimer: payload.blackTimer,
            }));
            break;
          }

          case GameMessages.TIME_EXCEEDED: {
            console.log("Time exceeded:", payload);
            toast.error("Time exceeded!");
            break;
          }

          case GameMessages.GAME_OVER: {
            console.log("Game over:", payload);
            const winnerText = payload.winner === 'w' ? 'White' : payload.winner === 'b' ? 'Black' : 'Draw';
            toast.success(`Game Over! Winner: ${winnerText}`);
            break;
          }

          // case GameMessages.MATCH_NOT_FOUND: {
          //   console.log("No match found:", payload);
          //   toast.error("No opponent available right now");
          //   break;
          // }

          case GameMessages.DISCONNECTED: {
            console.log("Opponent disconnected:", payload);
            toast.error("Opponent disconnected");
            break;
          }

          case GameMessages.OPP_RECONNECTED: {
            console.log("Opponent reconnected:", payload);
            toast.success("Opponent reconnected!");
            break;
          }

          case GameMessages.WRONG_PLAYER_MOVE: {
            console.log("Wrong player move:", payload);
            toast.error("Not your turn!");
            break;
          }

          case GameMessages.SERVER_ERROR: {
            console.log("Server error:", payload);
            toast.error(payload.message || "Server error occurred");
            break;
          }

          default:
            console.log("Unknown message type:", type, payload);
        }
      } catch (error) {
        console.error("Error parsing socket message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, queryClient, applyOpponentMove, syncGameState]);
}
