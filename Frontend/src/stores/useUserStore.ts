import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/auth";

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
  logout: () => Promise<void>;
  checkAndInitUser: () => Promise<void>;
  setError: (error: Error | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: true,
      isLoading: false,
      error: null,
      initialized: false,

      setUser: (user, isGuest) => set({ user, isGuest, error: null, initialized: true }),

      setError: (error) => set({ error, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        try {
          await authApi.logout();
          set({ user: null, isGuest: true, initialized: true });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },

      checkAndInitUser: async () => {
        const state = get();

        // Skip if already loading or initialized
        if (state.isLoading || state.initialized) return;

        set({ isLoading: true, error: null });

        try {
          // ✅ FIX: Check for auth token FIRST (via checkAuth)
          try {
            const authCheck = await authApi.checkAuth();
            
            if (authCheck?.success) {
              // User has valid token - get their profile
              const profile = await authApi.getProfile();
              
              set({
                user: {
                  id: profile.user.id || String(profile.user.email),
                  name: profile.user.name,
                  chessLevel: profile.user.chessLevel,
                },
                isGuest: false,
                isLoading: false,
                initialized: true,
              });
              return; // ✅ Exit - don't create guest!
            }
          } catch (authError: any) {
            // No valid token or token expired - continue to guest creation
            console.log("No auth token found, creating guest");
          }

          // ✅ No auth token - create guest user
          const guest = await authApi.getOrCreateGuest();
          
          if (!guest?.success) {
            throw new Error("Failed to create guest");
          }

          set({
            user: {
              id: guest.guestId,
              name: "Guest",
              chessLevel: "BEGINNER",
            },
            isGuest: true,
            isLoading: false,
            initialized: true,
          });
        } catch (err) {
          console.error("Init user failed:", err);
          set({ 
            error: err as Error, 
            isLoading: false, 
            initialized: true 
          });
        }
      },
    }),
    {
      name: "user-storage", // localStorage key
      // Only persist user info, not loading states
      partialize: (state) => ({ 
        user: state.user, 
        isGuest: state.isGuest 
      }),
    }
  )
);