import React from "react";
import { useComputerGame } from "../../hooks/useComputerGame";
import { computerSocketManager } from "../../lib/computerGame/ComputerSocketManager";
import { Button } from "../Button";

interface GameControlsProps {
  className?: string;
}

export const ComputerGameControls: React.FC<GameControlsProps> = ({ className = "" }) => {
  const { gameData, gameStatus, resetGame } = useComputerGame();

  const handleQuitGame = () => {
    if (window.confirm("Are you sure you want to quit this game? This will count as a loss.")) {
      if (gameData) {
        computerSocketManager.quitGame(gameData.computerGameId);
      }
      resetGame();
    }
  };

  const handleNewGame = () => {
    if (gameStatus === "active" && window.confirm("Are you sure you want to start a new game? This will quit the current game.")) {
      if (gameData) {
        computerSocketManager.quitGame(gameData.computerGameId);
      }
    }
    resetGame();
  };

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {gameData && gameStatus === "active" && (
        <Button
          onClick={handleQuitGame}
          variant="secondary"
          size="sm"
          text="Quit Game"
          className="bg-red-600 hover:bg-red-700"
        />
      )}
      
      <Button
        onClick={handleNewGame}
        variant="secondary"
        size="sm"
        text={gameStatus === "active" ? "New Game" : "Play Again"}
      />
      
      {gameStatus === "finished" && (
        <Button
          onClick={() => {
            computerSocketManager.disconnect();
            resetGame();
          }}
          variant="outline"
          size="sm"
          text="Exit"
        />
      )}
    </div>
  );
};