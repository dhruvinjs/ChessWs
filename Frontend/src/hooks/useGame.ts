import { useQueryClient } from "@tanstack/react-query";
import { GamePayload } from "../types/socket";

export function useGame() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<GamePayload>(["game"]);
}
