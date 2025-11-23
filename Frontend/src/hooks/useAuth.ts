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
    onSuccess: async (data) => {
      toast.success(data.message || "Login successful");

      const user: User = {
        id: data.id,
        name: data.username,
        chessLevel: data.chessLevel,
        email: data.email,
        isGuest: false,
      };
      
      // ✅ Update react-query cache and invalidate to trigger refetch
      queryClient.setQueryData(["user"], user);
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      
      // ✅ Use replace to avoid back button issues
      nav("/home", { replace: true });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const nav = useNavigate();

  return useMutation({
    mutationFn: authApis.register,
    onSuccess: async (data) => {
      toast.success(data.message || "Registration successful");

      const user: User = {
        id: data.id,
        name: data.username,
        chessLevel: data.chessLevel,
        email: data.email,
        isGuest: false,
      };

      // ✅ Update react-query cache and invalidate to trigger refetch
      queryClient.setQueryData(["user"], user);
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      
      // ✅ Use replace to avoid back button issues
      nav("/home", { replace: true });
    },
    onError: (err: any) => {
      // Handle Zod validation errors specifically
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errors.forEach((error: any) => {
          toast.error(error.message);
        });
      } else {
        toast.error(err.response?.data?.message || err.message || "Registration failed");
      }
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