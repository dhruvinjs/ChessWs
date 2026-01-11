import { useQuery } from "@tanstack/react-query";
import { gamesApi } from "../api/axios";

interface Stats {
  guestGamesCount: number;
  roomsCount: number;
}

async function fetchStats(): Promise<Stats> {
  const response = await gamesApi.get("/stats-total");
  if (response.data.success) {
    return response.data.stats;
  }
  return { guestGamesCount: 0, roomsCount: 0 };
}

export function useStatsQuery() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
}
