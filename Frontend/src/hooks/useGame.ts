import { useQuery } from '@tanstack/react-query';
import { gamesApi } from '../api/axios';

async function fetchGuestGamesTotal(): Promise<number> {
  const response = await gamesApi.get('/guest-games/total');
  if (response.data.success) {
    return response.data.count;
  }
  return 0;
}

export function useGuestGamesTotalQuery() {
  return useQuery({
    queryKey: ['guestGamesTotal'],
    queryFn: fetchGuestGamesTotal,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
}
