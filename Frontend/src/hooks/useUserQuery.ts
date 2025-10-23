import { useQuery } from "@tanstack/react-query";
import { authApis } from "../api/api";
import { User } from "../types/user";

export function useUserQuery() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        // Try fetching the authenticated user
        const response = await authApis.getProfile();

        // ✅ Normalize shape (backend returns { success:true, user:{...} })
        const user = response.user || response;
        return { ...user, isGuest: false };
      } catch (error: any) {
        // If unauthorized, get guest user
        if (error.response?.status === 401 || error.response?.status === 403) {
          const guestResponse = await authApis.getOrCreateGuest();

          // ✅ Normalize shape (backend returns { success:true, guestId, isGuest:true })
          const guest = guestResponse.user || guestResponse;
          return { ...guest, isGuest: true };
        }

        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
  });
}
