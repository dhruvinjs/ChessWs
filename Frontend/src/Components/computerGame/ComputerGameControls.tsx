import React, { useState } from "react";
import { useComputerGameStore } from "../../stores/useComputerGameStore";
import { computerSocketManager } from "../../lib/ComputerSocketManager";
import { Button } from "../Button";
import { ConfirmDialog } from "../ConfirmDialog"; // Custom dialog component

interface GameControlsProps {
  className?: string;
}

export const ComputerGameControls: React.FC<GameControlsProps> = ({ className = "" }) => {
  const gameData = useComputerGameStore((state) => state.gameData);
  const gameStatus = useComputerGameStore((state) => state.gameStatus);
  const resetGame = useComputerGameStore((state) => state.resetGame);
  
  // State for all confirmation dialogs
  const [showQuitDialog, setShowQuitDialog] = useState(false); // For "Quit Game" button
  const [showNewGameDialog, setShowNewGameDialog] = useState(false); // For "New Game / Play Again" button
  const [showBackToSetupDialog, setShowBackToSetupDialog] = useState(false); // For "Back to Setup" button when game is active

  // --- Quit Game Logic ---

  const handleQuitGameClick = () => {
    setShowQuitDialog(true);
  };

  const handleQuitConfirm = () => {
    setShowQuitDialog(false);
    if (gameData) {
      // 1. Send quit message to server (socket)
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    // 2. Reset the store, which will likely navigate the user back to the setup page
    resetGame();
  };

  // --- New Game / Play Again Logic ---

  const handleNewGameClick = () => {
    if (gameStatus === "active") {
      // If active, ask for confirmation (will result in a loss)
      setShowNewGameDialog(true); 
    } else {
      // If finished or idle, just reset and navigate to setup
      resetGame(); 
    }
  };

  const handleNewGameConfirm = () => {
    setShowNewGameDialog(false);
    
    // 1. Quit the active game via socket
    if (gameData) {
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    
    // 2. Reset the store to clear game state (navigates to setup)
    resetGame(); 
  };
  
  // --- Back to Setup Logic ---
  
  const handleBackToSetupClick = () => {
    if (gameStatus === "active") {
        // If active, show dialog as this action quits the game
        setShowBackToSetupDialog(true);
    } else {
        // If finished or idle, disconnect socket and reset (which navigates)
        computerSocketManager.disconnect();
        resetGame();
    }
  }

  const handleBackToSetupConfirm = () => {
    setShowBackToSetupDialog(false);

    // 1. Quit the active game via socket
    if (gameData) {
        computerSocketManager.quitGame(gameData.computerGameId);
    }

    // 2. Disconnect and reset
    computerSocketManager.disconnect();
    resetGame();
  }


  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      
      {/* 1. Quit Game Button (Only visible when active) */}
      {gameData && gameStatus === "active" && (
        <Button
          onClick={handleQuitGameClick} // Shows dialog
          variant="secondary" 
          size="sm"
          text="Quit Game"
          className="bg-red-600 hover:bg-red-700"
        />
      )}
      
      {/* 2. New Game / Play Again Button */}
      <Button
        onClick={handleNewGameClick} // Shows dialog if active, otherwise resets
        variant="secondary" 
        size="sm"
        text={gameStatus === "active" ? "New Game" : "Play Again"}
      />
      
      {/* 3. Back to Setup Button (Only visible when finished/active) */}
      <Button
          onClick={handleBackToSetupClick} // Shows dialog if active, otherwise resets
          variant="secondary"
          size="sm"
          text="Back to Setup"
      />


      {/* --- CONFIRM DIALOGS --- */}
      
      {/* Dialog for "Quit Game" button */}
      <ConfirmDialog
        isOpen={showQuitDialog}
        onClose={() => setShowQuitDialog(false)}
        onConfirm={handleQuitConfirm}
        title="Quit Current Game?"
        message="Are you sure you want to quit this game? This action will result in a loss."
        confirmText="Quit Game"
        cancelText="Continue Playing"
      />

      {/* Dialog for "New Game" button when game is active */}
      <ConfirmDialog
        isOpen={showNewGameDialog}
        onClose={() => setShowNewGameDialog(false)}
        onConfirm={handleNewGameConfirm}
        title="Start New Game?"
        message="You have an active game. Starting a new game will automatically quit the current one, which counts as a loss. Are you sure you want to continue?"
        confirmText="Quit & Start New"
        cancelText="Cancel"
      />

      {/* Dialog for "Back to Setup" button when game is active */}
      <ConfirmDialog
        isOpen={showBackToSetupDialog}
        onClose={() => setShowBackToSetupDialog(false)}
        onConfirm={handleBackToSetupConfirm}
        title="Leave Game?"
        message="You have an active game. Leaving will quit the game and count as a loss. Do you want to return to the setup page?"
        confirmText="Leave & Quit"
        cancelText="Stay and Play"
      />
    </div>
  );
};