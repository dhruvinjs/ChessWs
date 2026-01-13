import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useComputerGameStore } from "../stores/useComputerGameStore";
import { computerSocketManager } from "../lib/ComputerSocketManager";
import { ComputerCapturedPieces } from "../Components/computerGame/ComputerCapturedPieces";
import { ComputerMoveHistory } from "../Components/computerGame/ComputerMoveHistory";
import { useUserQuery } from "../hooks/useUserQuery";
import { ConfirmDialog } from "../Components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { ComputerChessBoard } from "../Components/computerGame/ComputerChessBoard";
import { LoadingScreen } from "../Components/LoadingScreen"; // 🎯 NEW: Import LoadingScreen
import toast from "react-hot-toast";

export const ComputerChessPage: React.FC = () => {
  const gameData = useComputerGameStore((state) => state.gameData);
  const gameStatus = useComputerGameStore((state) => state.gameStatus);
  const connectionStatus = useComputerGameStore(
    (state) => state.connectionStatus
  );
  const setConnectionStatus = useComputerGameStore(
    (state) => state.setConnectionStatus
  );
  const isThinking = useComputerGameStore((state) => state.isThinking);
  const resetGame = useComputerGameStore((state) => state.resetGame);

  const { data: user, isLoading: isUserLoading } = useUserQuery();
  const navigate = useNavigate();

  const socketInitialized = useRef(false);
  const hasRedirected = useRef(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false); // 🎯 NEW: Dialog for New Game button
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const loadingTimeoutRef = useRef<number | null>(null);

  // Initialize WebSocket connection (don't reset store on mount to preserve game data on reload)
  useEffect(() => {
    // Wait for user query to finish loading
    if (isUserLoading) {
      console.log("User query still loading...");
      return;
    }

    // Check if we have valid user data (user can be guest with id: 0)
    if (!user || user.id === undefined) {
      console.log("No user data available", { user, isUserLoading });
      return;
    }

    console.log("User data loaded:", {
      userId: user.id,
      isGuest: user.isGuest,
    });

    // ✅ Initialize WebSocket if not already connected
    if (!socketInitialized.current && !computerSocketManager.isConnected()) {
      console.log(
        "🔌 ComputerChessPage: Connecting WebSocket for user:",
        user.id
      );
      socketInitialized.current = true;
      setConnectionStatus("connecting");

      computerSocketManager
        .connect()
        .then(() => {
          console.log("✅ WebSocket connected successfully");
          setConnectionStatus("connected");

          // Wait 5 seconds for game data, then redirect to setup if no game
          loadingTimeoutRef.current = setTimeout(() => {
            console.log("No game data received after 5s, redirecting to setup");
            const currentGameData = useComputerGameStore.getState().gameData;
            if (!hasRedirected.current && !currentGameData) {
              hasRedirected.current = true;
              navigate("/computer", { replace: true });
            }
          }, 5000) as unknown as number;
        })
        .catch((error) => {
          console.error("Connection failed:", error);
          setConnectionStatus("error");
          socketInitialized.current = false;
          setIsLoadingGame(false);
        });
    } else if (computerSocketManager.isConnected()) {
      console.log("✅ WebSocket already connected, reusing connection");
      socketInitialized.current = true;
      setConnectionStatus("connected");
      // Check if we already have game data
      if (gameData && gameStatus === "active") {
        setIsLoadingGame(false);
      }
    }

    // NOTE: Don't disconnect on unmount - keep socket connected for reload scenarios
    return () => {
      console.log(
        "🧹 ComputerChessPage: Component unmounting (keeping socket connected)"
      );
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      socketInitialized.current = false;
    };
  }, [
    user,
    isUserLoading,
    setConnectionStatus,
    navigate,
    gameData,
    gameStatus,
  ]);

  useEffect(() => {
    if (gameData && gameStatus === "active") {
      console.log("✅ Game data received, stopping loading");
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setIsLoadingGame(false);
      hasRedirected.current = false; // Reset redirect flag when game is active
    }
  }, [gameData, gameStatus]);

  // Event handlers
  const handleQuitClick = () => {
    setShowQuitDialog(true);
  };

  const handleQuitConfirm = () => {
    if (gameData) {
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    computerSocketManager.disconnect(); // Disconnect when explicitly quitting
    setShowQuitDialog(false);
    toast.success("Game quit successfully");
    navigate("/computer");
  };

  const handleBackClick = () => {
    if (gameData && gameStatus === "active") {
      setShowBackDialog(true);
    } else {
      resetGame();
      computerSocketManager.disconnect(); // Disconnect when leaving
      navigate("/home");
    }
  };

  const handleBackConfirm = () => {
    if (gameData) {
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    resetGame();
    computerSocketManager.disconnect(); // Disconnect when leaving
    resetGame();
    setShowBackDialog(false);
    navigate("/home");
  };

  // 🎯 NEW: New Game button handlers
  const handleNewGameClick = () => {
    if (gameStatus === "active") {
      // Show confirmation dialog if game is active
      setShowNewGameDialog(true);
    } else {
      // If game is finished, just reset and go to setup
      resetGame();
      navigate("/computer");
    }
  };

  const handleNewGameConfirm = () => {
    if (gameData) {
      computerSocketManager.disconnect(); // Disconnect when starting new game
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    resetGame();
    setShowNewGameDialog(false);
    navigate("/computer");
  };

  // Show loading spinner
  if (isUserLoading) {
    return <LoadingScreen />;
  }

  if (
    isLoadingGame &&
    (connectionStatus === "connecting" || connectionStatus === "connected") &&
    !gameData
  ) {
    return <LoadingScreen />;
  }

  // Show error state
  if (connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Connection Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Unable to connect to game server
          </p>
          <button
            onClick={() => navigate("/computer")}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If no game data and not loading, show a message
  if (!gameData || gameStatus === "idle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading game...</p>
        </div>
      </div>
    );
  }

  // Main game UI
  const chess = new Chess(gameData.fen);
  const isPlayerTurn = chess.turn() === gameData.playerColor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
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
            <p
              className={`text-lg font-medium ${
                isPlayerTurn ? "text-green-600" : "text-orange-600"
              }`}
            >
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
                  onClick={handleNewGameClick}
                  className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                >
                  {gameStatus === "active" ? "New Game" : "Play Again"}
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
                  <span className="text-gray-600 dark:text-gray-300">
                    Difficulty:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {gameData.difficulty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Your Color:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {gameData.playerColor === "w" ? "White" : "Black"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Moves:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {gameData.moves.length}
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

      {/* 🎯 NEW: New Game Dialog */}
      <ConfirmDialog
        isOpen={showNewGameDialog}
        onClose={() => setShowNewGameDialog(false)}
        onConfirm={handleNewGameConfirm}
        title="Start New Game"
        message="You have an active game. Starting a new game will quit the current one and count as a loss. Are you sure?"
        confirmText="Quit & Start New"
        cancelText="Continue Playing"
      />
    </div>
  );
};
