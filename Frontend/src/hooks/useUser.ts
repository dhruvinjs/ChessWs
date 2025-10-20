import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import { authApi, LoginPayload, LoginResponse } from "../api/auth";
import { useNavigate } from "react-router-dom";


export function useLoginMutation() {
  const {setUser}=useUserStore()
  const {login}=authApi
  const nav=useNavigate()
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {
      toast.success(data.message || "Login successful!");
      setUser(data.user,false)
      console.log('navigating')
      nav('/home')
    },
    onError: (error) => {
      toast.error(error.message || "Login failed. Please try again.");
    },
  });
}

export function useLogoutMutation() {
  const {logout}=authApi
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logged out successfully");
      queryClient.clear();
      // Refresh page to create new guest
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error("Logout failed");
      console.error(error);
    },
  });
}

