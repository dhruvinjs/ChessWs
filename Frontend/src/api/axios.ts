// api/axios.ts
import axios from "axios";
import { toast } from "react-hot-toast";
import { queryClient } from "../lib/reactQueryClient";

const user_base_url = import.meta.env.VITE_USER_BASE_URL;
const game_base_url = import.meta.env.VITE_GAME_BASE_URL;

export const userApi = axios.create({
  baseURL: user_base_url,
  withCredentials: true,
});

export const gamesApi = axios.create({
  baseURL: game_base_url,
  withCredentials: true,
});

export const roomApi=axios.create({
    baseURL:`${user_base_url}/room`,
    withCredentials:true
})

// ✅ Global interceptor for handling token/session expiry gracefully
userApi.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => {
    // Check if the error is due to an expired session (401 Unauthorized) or (403 Forbidden)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't show toast if it's the initial getProfile request (handled by useUserQuery)
      const url = error.config?.url;
      const isProfileRequest = url?.includes('/getProfile');
      
      if (!isProfileRequest) {
        // Invalidate the user query to trigger re-authentication flow
        queryClient.invalidateQueries({ queryKey: ["user"] });
        toast.error("Session expired. Please log in again.");
      }
    }
    // Important: still reject the promise so that individual useQuery/useMutation hooks can handle the error further if needed.
    return Promise.reject(error);
  }
);