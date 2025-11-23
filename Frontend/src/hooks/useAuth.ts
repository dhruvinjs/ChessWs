// hooks/useAuthMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authApis } from "../api/api";
import { useNavigate } from "react-router-dom";
import { User } from "../types/user";

// Helper function to add delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      
      // ✅ Set the data
      queryClient.setQueryData(["user"], user);
      
      // ✅ Wait a tiny bit for React Query to sync (50ms is usually enough)
      await sleep(50);
      
      // ✅ Navigate after sync
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

      // ✅ Set the data
      queryClient.setQueryData(["user"], user);
      
      // ✅ Wait a tiny bit for React Query to sync
      await sleep(50);
      
      // ✅ Navigate after sync
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
        const guestUser = {
          ...(guestData.user || guestData),
          isGuest: true
        };
        queryClient.setQueryData(["user"], guestUser);
        
        // Small delay before redirect
        await sleep(50);
        window.location.href = "/";
      } catch (error) {
        queryClient.removeQueries({ queryKey: ["user"] });
        window.location.href = "/";
      }
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });
}