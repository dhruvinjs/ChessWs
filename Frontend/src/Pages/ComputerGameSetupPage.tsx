import React, { useEffect } from "react";
import { ComputerGameSetup } from "../Components/computerGame/ComputerGameSetup";
import { FloatingPieces } from "../Components/FloatingPieces";
import { computerSocketManager } from "../lib/ComputerSocketManager";
import { useComputerGameStore } from "../stores/useComputerGameStore";

export const ComputerGameSetupPage: React.FC = () => {
  const resetGame = useComputerGameStore((state) => state.resetGame);

  // Cleanup: Disconnect WebSocket and reset store when on setup page
  useEffect(() => {
    console.log(
      "ComputerGameSetupPage mounted - disconnecting WebSocket and resetting store"
    );

    // Disconnect WebSocket to prevent stale messages
    computerSocketManager.disconnect();

    // Reset the game store to clear any previous game data
    resetGame();

    return () => {
      console.log("ComputerGameSetupPage unmounting");
    };
  }, [resetGame]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 flex justify-center items-start pt-32 px-4 transition-colors duration-300 relative overflow-hidden">
        <FloatingPieces />
        <ComputerGameSetup />
      </div>
    </>
  );
};
