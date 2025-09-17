// hooks/useValidMoves.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Move } from "chess.js";

/**
 * Hook to manage valid moves (cache is updated by useSocketHandlers)
 */
export function useValidMoves() {
  const queryClient = useQueryClient();

  const { data: validMoves = [] } = useQuery<Move[]>({
    queryKey: ["validMoves"],
    initialData: [],
    enabled: false, // we don't fetch via react-query network; socket writes into cache
  });

  const clearValidMoves = () => {
    queryClient.setQueryData(["validMoves"], []);
  };

  return { validMoves, clearValidMoves };
}
