import { create } from "zustand";

export type ChessLevel = "BEGINNER" | "INTERMEDIATE" | "PRO";

export interface User {
  id: string;
  name: string;
  chessLevel: ChessLevel;
}

interface UserStore {
  user: User | null;
  isGuest: boolean;
  setUser: (user: User, isGuest: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isGuest: true,

  setUser: (user, isGuest) => set({ user, isGuest }),
  logout: () => set({ user: null, isGuest: true }),
}));
