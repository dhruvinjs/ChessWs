import React from "react";
import { ComputerGameSetup } from "../Components/computerGame/ComputerGameSetup";
import { FloatingPieces } from "../Components/FloatingPieces";

export const ComputerGameSetupPage: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 flex justify-center items-start pt-32 px-4 transition-colors duration-300 relative overflow-hidden">
        <FloatingPieces />
        <ComputerGameSetup />
      </div>
    </>
  );
};