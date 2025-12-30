import React, { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { useComputerGameStore } from '../stores/useComputerGameStore';
import { computerSocketManager } from '../lib/ComputerSocketManager';
import { ComputerCapturedPieces } from '../Components/computerGame/ComputerCapturedPieces';
import { ComputerMoveHistory } from '../Components/computerGame/ComputerMoveHistory';
import { useUserQuery } from '../hooks/useUserQuery';
import { ConfirmDialog } from '../Components/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { ComputerChessBoard } from '../Components/computerGame/ComputerChessBoard';
import { LoadingScreen } from '../Components/LoadingScreen'; // 🎯 NEW: Import LoadingScreen
import toast from 'react-hot-toast';

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

  const { data: user } = useUserQuery();
  const navigate = useNavigate();

  const hasConnected = useRef(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false); // 🎯 NEW: Dialog for New Game button
  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const loadingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user?.id || connectionStatus !== 'disconnected') {
      return;
    }

    if (hasConnected.current) {
      console.log('Connection attempt already initiated, skipping re-trigger.');
      return;
    }

    hasConnected.current = true;
    setConnectionStatus('connecting');

    console.log('Initiating WebSocket connection');
    computerSocketManager
      .connect()
      .then(() => {
        console.log('WebSocket connected successfully');
        setConnectionStatus('connected');

        loadingTimeoutRef.current = setTimeout(() => {
          console.log('No game data received after 5s, showing setup screen');
          setIsLoadingGame(false);
        }, 5000);
      })
      .catch((error) => {
        console.error('Connection failed:', error);
        setConnectionStatus('error');
        hasConnected.current = false;
        setIsLoadingGame(false);
      });
  }, [user?.id, connectionStatus, setConnectionStatus]);

  useEffect(() => {
    if (gameData && gameStatus === 'active') {
      console.log('✅ Game data received, stopping loading');
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setIsLoadingGame(false);
    }
  }, [gameData, gameStatus]);

  useEffect(() => {
    return () => {
      console.log('ComputerChessPage unmounting - disconnecting WebSocket');
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      computerSocketManager.disconnect();
      hasConnected.current = false;
      resetGame();
    };
  }, [resetGame]);

  // Event handlers
  const handleQuitClick = () => {
    setShowQuitDialog(true);
  };

  const handleQuitConfirm = () => {
    if (gameData) {
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    resetGame();
    setShowQuitDialog(false);
    toast.success('Game quit successfully');
    navigate('/computer');
  };

  const handleBackClick = () => {
    if (gameData && gameStatus === 'active') {
      setShowBackDialog(true);
    } else {
      resetGame();
      navigate('/home');
    }
  };

  const handleBackConfirm = () => {
    if (gameData) {
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    resetGame();
    setShowBackDialog(false);
    navigate('/home');
  };

  // 🎯 NEW: New Game button handlers
  const handleNewGameClick = () => {
    if (gameStatus === 'active') {
      // Show confirmation dialog if game is active
      setShowNewGameDialog(true);
    } else {
      // If game is finished, just reset and go to setup
      resetGame();
      navigate('/computer');
    }
  };

  const handleNewGameConfirm = () => {
    if (gameData) {
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    resetGame();
    setShowNewGameDialog(false);
    toast.success('Starting new game setup');
    navigate('/computer');
  };

  // Show loading spinner
  if (
    isLoadingGame &&
    connectionStatus !== 'error' &&
    connectionStatus !== 'disconnected'
  ) {
    return <LoadingScreen />; // 🎯 Use LoadingScreen component
  }

  // Show error state
  if (connectionStatus === 'error') {
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
            onClick={() => navigate('/computer')}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show setup if no game
  if (!gameData || gameStatus === 'idle') {
    navigate('/computer');
    return null;
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
                isPlayerTurn ? 'text-green-600' : 'text-orange-600'
              }`}
            >
              {isPlayerTurn ? 'Your turn' : "Computer's turn"}
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
                  {gameStatus === 'active' ? 'New Game' : 'Play Again'}
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
                    {gameData.playerColor === 'w' ? 'White' : 'Black'}
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
