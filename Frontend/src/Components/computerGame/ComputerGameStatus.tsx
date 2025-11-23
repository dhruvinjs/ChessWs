import React from "react";
import { useComputerGame } from "../../hooks/useComputerGame";

interface GameStatusProps {
  className?: string;
}

export const ComputerGameStatus: React.FC<GameStatusProps> = ({ className = "" }) => {
  const { gameData, gameStatus, gameResult, isThinking } = useComputerGame();

  if (!gameData) {
    return null;
  }

  const getStatusMessage = () => {
    if (gameStatus === "finished") {
      switch (gameResult) {
        case "win": return "🎉 You Won!";
        case "loss": return "😔 Computer Won";
        case "draw": return "🤝 Draw";
        default: return "Game Over";
      }
    }

    if (isThinking) {
      return "🤖 Computer is thinking...";
    }

    return "Game Active";
  };

  const getStatusColor = () => {
    if (gameStatus === "finished") {
      switch (gameResult) {
        case "win": return "text-green-600 dark:text-green-400";
        case "loss": return "text-red-600 dark:text-red-400";
        case "draw": return "text-yellow-600 dark:text-yellow-400";
        default: return "text-gray-600 dark:text-gray-400";
      }
    }

    if (isThinking) {
      return "text-blue-600 dark:text-blue-400";
    }

    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <div className={`font-semibold text-lg ${getStatusColor()}`}>
        {getStatusMessage()}
      </div>
      
      {isThinking && (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      )}
    </div>
  );
};