import { useQuery } from "@tanstack/react-query";
import { authApis } from "../api/api";
import { User } from "../types/user";

export function useUserQuery() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await authApis.getProfile();
        const user = response.user || response;
        return { ...user, isGuest: false };
      } catch (error: any) {
        // Always fallback to guest on any error
        console.log("Auth failed, creating guest user:", error?.response?.status);
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
            chessLevel: "BEGINNER" as any
          } as User;
        }
      }
    },
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Ensure query never fails - always return data
    throwOnError: false,
  });
}
