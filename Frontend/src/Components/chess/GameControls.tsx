import { useState, useCallback, memo } from 'react';
import { ArrowLeft, Play, Handshake, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';
import { useGameStore } from '../../stores/useGameStore';
import { GameMessages } from '../../constants';

// ✅ Memoized component - only re-renders when its props/subscriptions change
const GameControlsComponent = () => {
  const navigate = useNavigate();
  
  // ✅ Only subscribe to what we need - NOT timers!
  const initGameRequest = useGameStore((state) => state.initGameRequest);
  const resign = useGameStore((state) => state.resign);
  const moves = useGameStore((state) => state.moves);
  const gameStatus = useGameStore((state) => state.gameStatus);

  const isWaitingForGame = gameStatus === GameMessages.SEARCHING;

  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const handleGoHome = useCallback(() => {
    if (moves.length > 0) setShowHomeConfirm(true);
    else navigate('/');
  }, [moves.length, navigate]);

  const confirmGoHome = useCallback(() => {
    setShowHomeConfirm(false);
    navigate('/');
  }, [navigate]);

  const handleOfferDraw = useCallback(() => setShowDrawConfirm(true), []);
  const confirmDraw = useCallback(() => setShowDrawConfirm(false), []);

  const handlePlayGame = useCallback(() => initGameRequest(), [initGameRequest]);

  const handleResign = useCallback(() => setShowResignConfirm(true), []);
  const confirmResign = useCallback(() => {
    setShowResignConfirm(false);
    resign();
  }, [resign]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={handleGoHome}
          text="Home"
          icon={<ArrowLeft className="w-4 h-4" />}
        />
        <Button
          variant="primary"
          size="md"
          onClick={handlePlayGame}
          text={isWaitingForGame ? 'Searching...' : 'Play'}
          icon={<Play className="w-4 h-4" />}
          loading={isWaitingForGame}
        />
        <Button
          variant="outline"
          size="md"
          onClick={handleOfferDraw}
          text="Draw"
          icon={<Handshake className="w-4 h-4" />}
        />
        <Button
          variant="secondary"
          size="md"
          onClick={handleResign}
          text="Resign"
          icon={<Flag className="w-4 h-4" />}
        />
      </div>

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
};

// ✅ Export memoized version - won't re-render on timer updates
export const GameControls = memo(GameControlsComponent);