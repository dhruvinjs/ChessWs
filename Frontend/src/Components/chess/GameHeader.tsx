import { useState } from 'react';
import { ArrowLeft, Play, Handshake, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';
import { GameState } from '../../types/chess';
import { useSendSocket } from '../../hooks/useSendSocket';

interface GameHeaderProps {
  gameId:string | undefined
  gameState: GameState;
  playerColor?: 'w' | 'b' | null;
  whiteTimer?: number;
  blackTimer?: number;
  isWaitingForGame?: boolean;
}

export function GameHeader({ 
  gameId,
  gameState, 
  playerColor, 
  whiteTimer = 600, 
  blackTimer = 600,
  isWaitingForGame = false 
}: GameHeaderProps) {
  const navigate = useNavigate();
  const { initGame } = useSendSocket();

  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const handleGoHome = () => {
    if (gameState.moveHistory.length > 0) {
      setShowHomeConfirm(true);
    } else {
      navigate('/');
    }
  };

  const handleOfferDraw = () => {
    setShowDrawConfirm(true);
  };

  const handleResign = () => {
    setShowResignConfirm(true);
  };

  const confirmGoHome = () => {
    setShowHomeConfirm(false);
    navigate('/');
  };

  const confirmDraw = () => {
    setShowDrawConfirm(false);
    // TODO: Implement draw offer logic
  };

  const confirmResign = () => {
    setShowResignConfirm(false);
  };

  const handlePlayGame = () => {
    initGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const turnText = gameState.isGameOver
    ? 'Game Over'
    : `${gameState.turn === 'w' ? 'White' : 'Black'}'s Turn`;

  return (
    <>
      {/* Left Side Control Panel */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 mb-6">
        {/* Player Info */}
        {playerColor && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-700 dark:to-amber-900/20 rounded-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              You are playing as
            </h3>
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full ${
                  playerColor === 'w'
                    ? 'bg-white border-2 border-slate-400'
                    : 'bg-slate-800'
                }`}
              />
              <span className="font-semibold text-slate-900 dark:text-white">
                {playerColor === 'w' ? 'White' : 'Black'}
              </span>
            </div>
          </div>
        )}

        {/* Timer Display */}
          <div className="mb-6 space-y-3">
            {/* White Timer */}
            <div className="relative w-full p-3 bg-white dark:bg-slate-700 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-between">
                <div className="w-5 h-5 bg-white border-2 border-slate-400 rounded-full shadow-sm" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">White</span>
              </div>
              <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden mx-0 sm:mx-4">
                <div
                  className="h-4 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${(whiteTimer / 600) * 100}%`,
                  }}
                />
              </div>
              <span className="font-mono text-sm sm:text-lg font-bold text-slate-900 dark:text-white w-full sm:w-auto text-right sm:text-left">
                {formatTime(whiteTimer)}
              </span>
            </div>

            {/* Black Timer */}
            <div className="relative w-full p-3 bg-slate-100 dark:bg-slate-600 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-between">
                <div className="w-5 h-5 bg-slate-800 rounded-full shadow-sm" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Black</span>
              </div>
              <div className="flex-1 h-4 bg-slate-300 dark:bg-slate-500 rounded-full overflow-hidden mx-0 sm:mx-4">
                <div
                  className="h-4 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full transition-all duration-300"
                  style={{
                    width: `${(blackTimer / 600) * 100}%`,
                  }}
                />
              </div>
              <span className="font-mono text-sm sm:text-lg font-bold text-slate-900 dark:text-white w-full sm:w-auto text-right sm:text-left">
                {formatTime(blackTimer)}
              </span>
            </div>
          </div>


        {/* Game Status */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Game Controls
          </h2>
          <div className="flex items-center space-x-2 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${
                gameState.turn === 'w'
                  ? 'bg-white border-2 border-slate-400'
                  : 'bg-slate-800'
              }`}
            />
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              {turnText}
            </p>
          </div>
          {isWaitingForGame && (
            <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm animate-pulse">
              Searching for opponent...
            </p>
          )}
          {gameState.isCheck && !gameState.isGameOver && (
            <p className="text-red-600 dark:text-red-400 font-semibold text-sm">
              Check!
            </p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="space-y-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleGoHome}
            text="Back to Home"
            icon={<ArrowLeft className="w-4 h-4" />}
            className="w-full"
          />

          <Button
            variant="primary"
            size="md"
            onClick={handlePlayGame}
            text={isWaitingForGame ? 'Searching...' : 'Play Game'}
            icon={<Play className="w-4 h-4" />}
            className="w-full"
            loading={isWaitingForGame}
          />

          <Button
            variant="outline"
            size="md"
            onClick={handleOfferDraw}
            text="Offer Draw"
            icon={<Handshake className="w-4 h-4" />}
            className="w-full"
          />

          <Button
            variant="secondary"
            size="md"
            onClick={handleResign}
            text="Resign"
            icon={<Flag className="w-4 h-4" />}
            className="w-full"
          />
        </div>
      </div>

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
        isOpen={showDrawConfirm}
        onClose={() => setShowDrawConfirm(false)}
        onConfirm={confirmDraw}
        title="Offer Draw?"
        message="Are you sure you want to offer a draw to your opponent?"
        confirmText="Yes, Offer Draw"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={showResignConfirm}
        onClose={() => setShowResignConfirm(false)}
        onConfirm={confirmResign}
        title="Resign Game?"
        message="Are you sure you want to resign? Your opponent will be declared the winner."
        confirmText="Yes, Resign"
        cancelText="Cancel"
      />
    </>
  );
}
