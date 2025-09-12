import { useQuery } from "@tanstack/react-query";
import { GamePayload } from "../types/socket";

export function useGame() {
  return useQuery<GamePayload>({
    queryKey: ["game"],
    queryFn: async () => {
      // Dummy initial state — satisfies TypeScript
      const initialState: GamePayload = {
        gameId: "",
        color: "w",          // default starting color
        turn: "w",
        fen: "start_fen",
        opponentId: "",       // must include opponentId
        whiteTimer: 600,
        blackTimer: 600,
      };
      return initialState;
    },
    enabled: true,
  });
}
