// Components/chess/GameControls.tsx
// Updated version with proper draw functionality

import { useState, useCallback, memo } from 'react';
import { ArrowLeft, Play, Handshake, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';
import { useGameStore } from '../../stores/useGameStore';
import { GameMessages } from '../../types/chess';

const GameControlsComponent = () => {
  const navigate = useNavigate();
  
  // Subscribe to necessary state
  const initGameRequest = useGameStore((state) => state.initGameRequest);
  const resign = useGameStore((state) => state.resign);
  const offerDraw = useGameStore((state) => state.offerDraw);
  // const moves = useGameStore((state) => state.moves);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const drawOfferSent = useGameStore((state) => state.drawOfferSent);

  const isWaitingForGame = gameStatus === GameMessages.SEARCHING;
  const isGameActive = gameStatus === GameMessages.GAME_ACTIVE && gameStarted;
  const isGameOver = gameStatus === GameMessages.GAME_OVER;

  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const handleGoHome = useCallback(() => {
    if (isGameActive) {
      setShowHomeConfirm(true);
    } else {
      navigate('/');
    }
  }, [ isGameActive, navigate]);

  const confirmGoHome = useCallback(() => {
    setShowHomeConfirm(false);
    if (isGameActive) {
      resign();
    }
    setTimeout(() => navigate('/'), 300);
  }, [navigate, resign, isGameActive]);

  const handleOfferDraw = useCallback(() => {
    if (!isGameActive) return;
    setShowDrawConfirm(true);
  }, [isGameActive]);

  const confirmDraw = useCallback(() => {
    setShowDrawConfirm(false);
    offerDraw();
  }, [offerDraw]);

  const handlePlayGame = useCallback(() => {
    initGameRequest();
  }, [initGameRequest]);

  const handleResign = useCallback(() => {
    if (!isGameActive) return;
    setShowResignConfirm(true);
  }, [isGameActive]);

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
          disabled={isGameActive || isWaitingForGame}
        />
        <Button
          variant="outline"
          size="md"
          onClick={handleOfferDraw}
          text={drawOfferSent ? "Offer Sent" : "Draw"}
          icon={<Handshake className="w-4 h-4" />}
          disabled={!isGameActive || drawOfferSent || isGameOver}
        />
        <Button
          variant="secondary"
          size="md"
          onClick={handleResign}
          text="Resign"
          icon={<Flag className="w-4 h-4" />}
          disabled={!isGameActive || isGameOver}
        />
      </div>

      {/* Confirm Home Dialog */}
      <ConfirmDialog
        isOpen={showHomeConfirm}
        onClose={() => setShowHomeConfirm(false)}
        onConfirm={confirmGoHome}
        title="Leave Game?"
        message="Are you sure you want to go back to home? Your current game progress will be lost and you will forfeit the match."
        confirmText="Yes, Go Home"
        cancelText="Stay in Game"
      />

      {/* Confirm Draw Dialog */}
      <ConfirmDialog
        isOpen={showDrawConfirm}
        onClose={() => setShowDrawConfirm(false)}
        onConfirm={confirmDraw}
        title="Offer Draw?"
        message="Are you sure you want to offer a draw to your opponent? They can accept or reject this offer."
        confirmText="Yes, Offer Draw"
        cancelText="Cancel"
      />

      {/* Confirm Resign Dialog */}
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

export const GameControls = memo(GameControlsComponent);