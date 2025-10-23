// hooks/useAuthMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authApis } from "../api/api";
import { useNavigate } from "react-router-dom";
import { User } from "../types/user";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const nav = useNavigate();

  return useMutation({
    mutationFn: authApis.login,
    onSuccess: (data) => {
      toast.success(data.message || "Login successful");

      const user: User = {
        id: data.id,
        name: data.username,
        chessLevel: data.chessLevel,
        email: data.email,
        isGuest: false,
      };

      // ✅ Update react-query cache
      queryClient.setQueryData(["user"], user);
      nav("/home");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApis.logout,
    onSuccess: async () => {
      toast.success("Logged out successfully");
      
      try {
        const guestData = await authApis.getOrCreateGuest();
        queryClient.setQueryData(["user"], guestData.user || guestData);
        // Redirect to landing page (not /home)
        window.location.href = "/";
      } catch (error) {
        // If guest creation fails, remove user data
        queryClient.removeQueries({ queryKey: ["user"] });
        window.location.href = "/";
      }
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });
}