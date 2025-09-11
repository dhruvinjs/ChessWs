import { useQuery } from "@tanstack/react-query";
import { GamePayload } from "../types/socket";

export function useGame() {
  return useQuery<GamePayload>({
    queryKey: ["game"],
    enabled: true, // ensures subscription is always active
  });
  
}
