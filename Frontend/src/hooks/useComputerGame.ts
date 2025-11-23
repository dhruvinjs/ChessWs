import { useComputerGameStore } from "../stores/useComputerGameStore";

// Simple hook that just returns the store state and actions
export const useComputerGame = () => {
  return useComputerGameStore();
};