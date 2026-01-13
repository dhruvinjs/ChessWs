import { useQuery } from "@tanstack/react-query";
import { authApis } from "../api/api";
import { User } from "../types/user";
import axios from "axios";

export function useUserQuery() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await authApis.getProfile();

        // FIX: The backend returns 'user', not 'userProfile'
        const userData = response.user;

        if (!userData) {
          throw new Error("User data not found in response");
        }

        // Ensure we spread the actual user object found in the JSON
        return { ...userData, isGuest: false };
      } catch (error: unknown) {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        console.log("Auth failed, creating guest user. Status:", status);

        try {
          const guestResponse = await authApis.getOrCreateGuest();
          // Backend might return { user: {...} } or just the user object
          const guest = guestResponse.user || guestResponse;

          return { ...guest, isGuest: true };
        } catch (guestError) {
          console.error("Guest creation failed:", guestError);
          // Ultimate fallback to prevent application crash
          return {
            id: 0,
            name: "Guest",
            email: "",
            isGuest: true,
            chessLevel: "BEGINNER",
          } as User;
        }
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: Infinity,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    throwOnError: false,
  });
}
