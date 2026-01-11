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
        const user = response.userProfile;
        return { ...user, isGuest: false };
      } catch (error: unknown) {
        // Always fallback to guest on any error
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        console.log("Auth failed, creating guest user:", status);
        try {
          const guestResponse = await authApis.getOrCreateGuest();
          const guest = guestResponse.user || guestResponse;
          return { ...guest, isGuest: true };
        } catch (guestError) {
          // If even guest creation fails, return a minimal guest user
          console.error("Guest creation failed:", guestError);
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
    staleTime: 30 * 1000, // 30 seconds - reduced to get fresh data on reconnection
    gcTime: Infinity, // Keep in cache forever
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch on component mount
    refetchOnReconnect: true, // Refetch on network reconnection
    // Ensure query never fails - always return data
    throwOnError: false,
  });
}
