import { useState } from 'react';
import { ArrowLeft, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';
import { GameState } from '../../types/chess';

interface GameHeaderProps {
  gameState: GameState;
  onResetGame: () => void;
}

export function GameHeader({ gameState, onResetGame }: GameHeaderProps) {
  const navigate = useNavigate();
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleGoHome = () => {
    if (gameState.moveHistory.length > 0) {
      setShowHomeConfirm(true);
    } else {
      navigate('/');
    }
  };

  const handleResetGame = () => {
    if (gameState.moveHistory.length > 0) {
      setShowResetConfirm(true);
    } else {
      onResetGame();
    }
  };

  const confirmGoHome = () => {
    setShowHomeConfirm(false);
    navigate('/');
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    onResetGame();
  };

  const turnText = gameState.isGameOver
    ? 'Game Over'
    : `${gameState.turn === 'w' ? 'White' : 'Black'}'s Turn`;

  return (
    <>
      <header className="w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl mb-6 sm:mb-8 overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Layout */}
          <div className="flex flex-col space-y-4 sm:hidden">
            {/* Title and Status */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                Chess Game
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${gameState.turn === 'w' ? 'bg-white border-2 border-slate-400' : 'bg-slate-800'}`} />
                <p className="text-base text-slate-600 dark:text-slate-300 font-medium">
                  {turnText}
                </p>
              </div>
              {gameState.isCheck && !gameState.isGameOver && (
                <p className="text-red-600 dark:text-red-400 font-semibold mt-1 text-sm">
                  Check!
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoHome}
                text="Home"
                icon={<Home className="w-4 h-4" />}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetGame}
                text="Reset"
                icon={<RotateCcw className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            {/* Left: Home Button */}
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={handleGoHome}
                text="Back to Home"
                icon={<ArrowLeft className="w-4 h-4" />}
              />
            </div>

            {/* Center: Title and Status */}
            <div className="flex-1 text-center mx-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Chess Game
              </h1>
              <div className="flex items-center justify-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${gameState.turn === 'w' ? 'bg-white border-2 border-slate-400' : 'bg-slate-800'}`} />
                <p className="text-lg text-slate-600 dark:text-slate-300 font-semibold">
                  {turnText}
                </p>
              </div>
              {gameState.isCheck && !gameState.isGameOver && (
                <p className="text-red-600 dark:text-red-400 font-bold mt-2 text-lg">
                  Check!
                </p>
              )}
            </div>

            {/* Right: Reset Button */}
            <div className="flex-shrink-0">
              <Button
                variant="secondary"
                size="md"
                onClick={handleResetGame}
                text="Reset Game"
                icon={<RotateCcw className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Game Progress Bar */}
        <div className="h-1 bg-slate-200 dark:bg-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${Math.min((gameState.moveHistory.length / 50) * 100, 100)}%` }}
          />
        </div>
      </header>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showHomeConfirm}
        onClose={() => setShowHomeConfirm(false)}
        onConfirm={confirmGoHome}
        title="Leave Game?"
        message="Are you sure you want to go back to home? Your current game progress will be lost."
        confirmText="Yes, Go Home"
        cancelText="Stay in Game"
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
        title="Reset Game?"
        message="Are you sure you want to reset the game? All progress will be lost and you'll start a new game."
        confirmText="Yes, Reset"
        cancelText="Cancel"
      />
    </>
  );
}