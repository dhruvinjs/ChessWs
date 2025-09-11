// hooks/useGuestInit.ts
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/axios";
import { useUserStore, User} from "../stores/useUserStore";

// Response from backend
interface GuestResponse {
  guestId: string;
}

// Typed function to fetch guest and set it in Zustand
function fetchGuestAndSet(setUser: (user: User, isGuest: boolean) => void) {
  return async (): Promise<GuestResponse> => {
    const res = await userApi.get<GuestResponse>("/cookie");
    const data = res.data;

    if (data?.guestId) {
      const guest: User = {
        id: data.guestId,
        name: "Guest",
        chessLevel: "BEGINNER",
      };
      setUser(guest, true);
    }

    return data;
  };
}

// Hook to fetch guest and store in Zustand
export function useGuestInit() {
  const setUser = useUserStore((s) => s.setUser);

  return useQuery<GuestResponse>({
    queryKey: ["guest"],
    queryFn: fetchGuestAndSet(setUser),
    retry: false,
    refetchOnWindowFocus:false,
    refetchOnReconnect:true,
    staleTime:30 * 60 * 1000
  });
}
