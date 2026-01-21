import { useQuery } from "@tanstack/react-query";
import { authApis } from "../api/api";
import { User } from "../types/user";
// import axios from "axios";

export function useUserQuery() {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await authApis.getProfile();
        const userData = response.user;
        if (!userData) {
          throw new Error("User data not found in response");
        }

        return { 
          id: userData.id,
          name: userData.name,
          email: userData.email,
          chessLevel: userData.chessLevel,
          isGuest: response.isGuest 
        };
      } catch (error: unknown) {
        try {
          const guestResponse = await authApis.getOrCreateGuest();     
          const guestId = guestResponse.id || guestResponse.guestId; 
          
          return {
            id: guestId, 
            name: "Guest",
            email: "",
            isGuest: true,
            chessLevel: "BEGINNER",
          } as User;
        } catch (guestError) {
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
    staleTime: 5 * 60 * 1000,
    gcTime: Infinity,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    throwOnError: false,
  });
}