import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useComputerGame } from "../hooks/useComputerGame";
import { computerSocketManager } from "../lib/computerGame/ComputerSocketManager";
import { ComputerGameSetup } from "../Components/computerGame/ComputerGameSetup";
import { ComputerGameNotifications } from "../Components/computerGame/ComputerGameNotifications";
import { ComputerCapturedPieces } from "../Components/computerGame/ComputerCapturedPieces";
import { ComputerMoveHistory } from "../Components/computerGame/ComputerMoveHistory";
import { useUserQuery } from "../hooks/useUserQuery";
import { ComputerChessBoard } from "../Components/chess/ComputerChessBoard";
import { ConfirmDialog } from "../Components/ConfirmDialog";
import { useNavigate } from "react-router-dom";

export const ComputerChessPage: React.FC = () => {
  const { gameData, gameStatus, connectionStatus, setConnectionStatus, isThinking } = useComputerGame();
  const { data: user } = useUserQuery();
  const navigate = useNavigate();
  const hasConnected = useRef(false);
  const connectionInProgress = useRef(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);

  // Single connection on mount with delay to ensure component is stable
  useEffect(() => {
    // Prevent duplicate connections from React StrictMode double mounting
    if (connectionInProgress.current) {
      console.log("Connection already in progress, skipping...");
      return;
    }

    if (!hasConnected.current && user?.id && connectionStatus === "disconnected") {
      // Small delay to ensure component is mounted and stable
      const connectionTimer = setTimeout(() => {
        if (!hasConnected.current && !connectionInProgress.current) {
          connectionInProgress.current = true;
          hasConnected.current = true;
          setConnectionStatus("connecting");
          
          console.log("Initiating WebSocket connection for user:", user.id);
          computerSocketManager.connect(user.id)
            .then(() => {
              console.log("WebSocket connected successfully");
              setConnectionStatus("connected");
              connectionInProgress.current = false;
            })
            .catch((error) => {
              console.error("Connection failed:", error);
              setConnectionStatus("error");
              hasConnected.current = false;
              connectionInProgress.current = false;
            });
        }
      }, 100); // 100ms delay to avoid cleanup race condition

      return () => clearTimeout(connectionTimer);
    }
  }, [user?.id, connectionStatus, setConnectionStatus]);

  // Cleanup WebSocket when actually leaving the page
  useEffect(() => {
    return () => {
      console.log("ComputerChessPage unmounting - disconnecting WebSocket");
      computerSocketManager.disconnect();
      hasConnected.current = false;
    };
  }, []);

  const handleStartGame = (difficulty: "EASY" | "MEDIUM" | "HARD", playerColor: "w" | "b") => {
    computerSocketManager.startNewGame(difficulty, playerColor);
  };

  const handleQuitClick = () => {
    setShowQuitDialog(true);
  };

  const handleQuitConfirm = () => {
    if (gameData) {
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    setShowQuitDialog(false);
  };

  const handleBackClick = () => {
    if (gameData && gameStatus === "active") {
      setShowBackDialog(true);
    } else {
      navigate("/home");
    }
  };

  const handleBackConfirm = () => {
    if (gameData) {
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    setShowBackDialog(false);
    navigate("/home");
  };

  // Function ready for when chess board component is added
  // const handleMove = (from: string, to: string, promotion?: string) => {
  //   if (!gameData || gameStatus !== "active") return false;
  //   const move = { from, to, promotion };
  //   computerSocketManager.makeMove(gameData.computerGameId, move);
  //   return true;
  // };

  // Show setup screen if no active game
  if (!gameData || gameStatus === "idle")
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <ComputerGameNotifications />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Chess vs Computer
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Challenge our AI powered by Stockfish engine
          </p>
        </div>
        
        <ComputerGameSetup
          onStartGame={handleStartGame}
          isConnected={connectionStatus === "connected"}
        />
      </div>
    </div>
  );

  // Create chess instance for current game
  const chess = new Chess(gameData.fen);
  const isPlayerTurn = chess.turn() === gameData.playerColor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <ComputerGameNotifications />
      
      <div className="container mx-auto px-4 py-8">
        {/* Game Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            You vs Computer ({gameData.difficulty})
          </h1>
          {isThinking ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
              <p className="text-lg text-orange-600 font-medium">
                Computer is thinking...
              </p>
            </div>
          ) : (
            <p className={`text-lg ${
              isPlayerTurn ? "text-green-600" : "text-orange-600"
            }`}>
              {isPlayerTurn ? "Your turn" : "Computer's turn"}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Panel - Game Controls & Info */}
          <div className="lg:col-span-3 order-2 lg:order-1 space-y-4">
            {/* Game Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Game Controls
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={handleBackClick}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Back to Home
                </button>
                <button 
                  onClick={handleQuitClick}
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Quit Game
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                >
                  New Game
                </button>
              </div>
            </div>

            {/* Captured Pieces */}
            <ComputerCapturedPieces />

            {/* Game Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-3">
                Game Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Difficulty:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {gameData.difficulty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Your Color:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {gameData.playerColor === "w" ? "White" : "Black"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Chess Board */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center items-start">
            <div className="w-full">
              <ComputerChessBoard />
            </div>
          </div>

          {/* Right Panel - Move History */}
          <div className="lg:col-span-3 order-3 lg:order-3">
            <ComputerMoveHistory />
          </div>
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showQuitDialog}
        onClose={() => setShowQuitDialog(false)}
        onConfirm={handleQuitConfirm}
        title="Quit Game"
        message="Are you sure you want to quit this game? This will count as a loss."
        confirmText="Quit Game"
        cancelText="Continue Playing"
      />

      <ConfirmDialog
        isOpen={showBackDialog}
        onClose={() => setShowBackDialog(false)}
        onConfirm={handleBackConfirm}
        title="Leave Game"
        message="You have an active game. Leaving will quit the game and count as a loss. Do you want to continue?"
        confirmText="Leave & Quit"
        cancelText="Stay"
      />
    </div>
  );
};