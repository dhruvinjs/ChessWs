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

        // Backend returns { success: true, userProfile: { user: {...} }, isGuest: false }
        const userData = response.user;
        console.log(userData)
        if (!userData) {
          throw new Error("User data not found in response");
        }

        // Return the user object with isGuest flag from response
        return { 
          id: userData.id,
          name: userData.name,
          email: userData.email,
          chessLevel: userData.chessLevel,
          isGuest: response.isGuest 
        };
      } catch (error: unknown) {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        console.log("Auth failed, creating guest user. Status:", status);

        try {
          const guestResponse = await authApis.getOrCreateGuest();
          // Backend returns { id: string, success: true, isGuest: true }
          return {
            id: 0, // Guest ID is a string but we use 0 for frontend
            name: "Guest",
            email: "",
            isGuest: true,
            chessLevel: "BEGINNER",
          } as User;
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
