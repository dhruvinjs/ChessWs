// src/store/useThemeStore.ts
import { create } from "zustand";

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;

      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }

      return { isDarkMode: newMode };
    }),

  initTheme: () => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const dark =
      savedTheme === "dark" || (!savedTheme && prefersDark) ? true : false;

    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    set({ isDarkMode: dark });
  },
  
}));
