import { useState, useCallback } from 'react';
import { ArrowLeft, Play, Handshake, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';
import type { GameState } from '../../types/chess';
import { useSendSocket } from '../../hooks/useSendSocket';
import { Timer } from './Timer';

interface GameHeaderProps {
  gameId?: string;
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
  isWaitingForGame = false,
}: GameHeaderProps) {
  const navigate = useNavigate();
  const { initGame, resign } = useSendSocket();

  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const handleGoHome = () => {
    if (gameState.moveHistory.length > 0) setShowHomeConfirm(true);
    else navigate('/');
  };

  const confirmGoHome = () => {
    setShowHomeConfirm(false);
    navigate('/');
  };

  const handleOfferDraw = () => setShowDrawConfirm(true);
  const confirmDraw = () => setShowDrawConfirm(false); // TODO: emit draw offer via socket

  const handlePlayGame = useCallback(() => initGame(), [initGame]);

  const handleResign = () => setShowResignConfirm(true);
  const confirmResign = () => {
    setShowResignConfirm(false);
    resign(); // send resign to server if gameId exists
  };


  const turnText = gameState.isGameOver
    ? 'Game Over'
    : `${gameState.turn === 'w' ? 'White' : 'Black'}'s Turn`;

  return (
    <>
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 mb-6">
        {/* Player Info */}
        {playerColor && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 dark:from-slate-700 dark:via-slate-800 dark:to-amber-900/30 rounded-xl shadow-md p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ring-2 ${
                    playerColor === 'w' ? 'bg-white ring-slate-300' : 'bg-slate-800 ring-slate-600'
                  }`}
                >
                  <span className={`font-bold ${playerColor === 'w' ? 'text-slate-800' : 'text-white'}`}>
                    {playerColor === 'w' ? 'W' : 'B'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-white">
                    You are playing as
                  </h3>
                  <p className="text-lg font-extrabold text-amber-700 dark:text-amber-400">
                    {playerColor === 'w' ? 'White' : 'Black'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timers */}
        <div className="mb-6 space-y-3">
          <Timer
            time={whiteTimer}
            maxTime={600}
            label="White"
            colors={{ bg: "bg-white dark:bg-slate-700", fill: "bg-amber-500" }}
          />
          <Timer
            time={blackTimer}
            maxTime={600}
            label="Black"
            colors={{ bg: "bg-slate-100 dark:bg-slate-600", fill: "bg-slate-800" }}
          />
        </div>

        {/* Game Status */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Game Controls</h2>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${gameState.turn === 'w' ? 'bg-white border-2 border-slate-400' : 'bg-slate-800'}`} />
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{turnText}</p>
          </div>
          {isWaitingForGame && (
            <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm animate-pulse">
              Searching for opponent...
            </p>
          )}
          {gameState.isCheck && !gameState.isGameOver && (
            <p className="text-red-600 dark:text-red-400 font-semibold text-sm">Check!</p>
          )}
        </div>

        <div className="space-y-3">
          <Button variant="secondary" size="md" onClick={handleGoHome} text="Back to Home" icon={<ArrowLeft className="w-4 h-4" />} className="w-full" />
          <Button variant="primary" size="md" onClick={handlePlayGame} text={isWaitingForGame ? 'Searching...' : 'Play Game'} icon={<Play className="w-4 h-4" />} className="w-full" loading={isWaitingForGame} />
          <Button variant="outline" size="md" onClick={handleOfferDraw} text="Offer Draw" icon={<Handshake className="w-4 h-4" />} className="w-full" />
          <Button variant="secondary" size="md" onClick={handleResign} text="Resign" icon={<Flag className="w-4 h-4" />} className="w-full" />
        </div>
      </div>

      <ConfirmDialog isOpen={showHomeConfirm} onClose={() => setShowHomeConfirm(false)} onConfirm={confirmGoHome} title="Leave Game?" message="Are you sure you want to go back to home? Your current game progress will be lost." confirmText="Yes, Go Home" cancelText="Stay in Game" />
      <ConfirmDialog isOpen={showDrawConfirm} onClose={() => setShowDrawConfirm(false)} onConfirm={confirmDraw} title="Offer Draw?" message="Are you sure you want to offer a draw to your opponent?" confirmText="Yes, Offer Draw" cancelText="Cancel" />
      <ConfirmDialog isOpen={showResignConfirm} onClose={() => setShowResignConfirm(false)} onConfirm={confirmResign} title="Resign Game?" message="Are you sure you want to resign? Your opponent will be declared the winner." confirmText="Yes, Resign" cancelText="Cancel" />
    </>
  );
}
