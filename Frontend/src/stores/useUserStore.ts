import { create } from "zustand";
import { userApi } from "../api/axios";
import { persist } from 'zustand/middleware';

export type ChessLevel = "BEGINNER" | "INTERMEDIATE" | "PRO";

export interface User {
  id: string;
  name: string;
  chessLevel: ChessLevel;
}

interface UserState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  error: Error | null;
  initialized: boolean;
}

interface UserActions {
  setUser: (user: User, isGuest: boolean) => void;
  logout: () => void;
  checkAndInitGuest: () => Promise<void>;
  setError: (error: Error | null) => void;
  setLoading: (isLoading: boolean) => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isGuest: true,
      isLoading: false,
      error: null,
      initialized: false,

      // Actions
      setUser: (user, isGuest) => 
        set({ user, isGuest, error: null, initialized: true }),

      logout: () => 
        set({ user: null, isGuest: true, error: null }),

      setError: (error) => 
        set({ error, isLoading: false }),

      setLoading: (isLoading) => 
        set({ isLoading }),

      checkAndInitGuest: async () => {
        const state = get();
        // Skip if we already have a user or are loading
        if (state.user || state.isLoading || state.initialized) return;

        try {
          set({ isLoading: true, error: null });
          const res = await userApi.get<{ guestId: string }>("/cookie");
          
          if (res.data?.guestId) {
            const guest: User = {
              id: res.data.guestId,
              name: "Guest",
              chessLevel: "BEGINNER",
            };
            set({ 
              user: guest, 
              isGuest: true, 
              isLoading: false, 
              initialized: true 
            });
          } else {
            throw new Error("No guest ID received");
          }
        } catch (error) {
          console.error("Failed to initialize guest:", error);
          set({ 
            error: error as Error, 
            isLoading: false,
            initialized: true 
          });
        }
      },
    }),
    {
      name: 'chess-user-storage',
      partialize: (state) => ({ 
        user: state.user,
        isGuest: state.isGuest,
        initialized: state.initialized
      })
    }
  )
);
