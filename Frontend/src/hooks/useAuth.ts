// hooks/useAuthMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { authApis } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/user';
import axios from 'axios';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to extract error message from unknown error types
 */
const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'An unexpected error occurred';
};

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const nav = useNavigate();

  return useMutation({
    mutationFn: authApis.login,
    onSuccess: async (data) => {
      toast.success(data.message || 'Login successful');

      const user: User = {
        id: data.id,
        name: data.username,
        chessLevel: data.chessLevel,
        email: data.email,
        isGuest: false,
      };

      queryClient.setQueryData(['user'], user);
      await sleep(50);
      nav('/home', { replace: true });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const nav = useNavigate();

  return useMutation({
    mutationFn: authApis.register,
    onSuccess: async (data) => {
      toast.success(data.message || 'Registration successful');

      const user: User = {
        id: data.id,
        name: data.username,
        chessLevel: data.chessLevel,
        email: data.email,
        isGuest: false,
      };

      queryClient.setQueryData(['user'], user);
      await sleep(50);
      nav('/home', { replace: true });
    },
    onError: (err: unknown) => {
      // Handle Zod/Validation errors specifically if they exist
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        const errors = err.response.data.errors as Array<{ message: string }>;
        errors.forEach((error) => toast.error(error.message));
      } else {
        toast.error(getErrorMessage(err));
      }
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApis.logout,
    onSuccess: async () => {
      toast.success('Logged out successfully');

      try {
        const guestData = await authApis.getOrCreateGuest();
        const guestUser = {
          ...(guestData.user || guestData),
          isGuest: true,
        };
        queryClient.setQueryData(['user'], guestUser);

        await sleep(50);
        window.location.href = '/';
      } catch (error: unknown) {
        // Log the error for debugging but don't crash
        console.error('Guest profile restoration failed:', error);
        queryClient.removeQueries({ queryKey: ['user'] });
        window.location.href = '/';
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err) || 'Logout failed');
    },
  });
}
