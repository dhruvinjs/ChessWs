import { useState, useCallback, memo } from "react";
import { ArrowLeft, Play, Handshake, Flag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Button";
import { ConfirmDialog } from "../ConfirmDialog";
import { useGameStore } from "../../stores/useGameStore";
import { GameMessages } from "../../types/chess";

const GameControlsComponent = () => {
  const navigate = useNavigate();

  // Subscribe to necessary state
  const initGameRequest = useGameStore((state) => state.initGameRequest);
  const resign = useGameStore((state) => state.resign);
  const offerDraw = useGameStore((state) => state.offerDraw);
  const cancelSearch = useGameStore((state) => state.cancelSearch);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const gameStarted = useGameStore((state) => state.gameStarted);
  const drawOfferSent = useGameStore((state) => state.drawOfferSent);
  const drawOfferCount = useGameStore((state) => state.drawOfferCount);

  const isWaitingForGame = gameStatus === GameMessages.SEARCHING;
  const isGameActive = gameStatus === GameMessages.GAME_ACTIVE && gameStarted;
  const isGameOver = gameStatus === GameMessages.GAME_OVER;

  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showDrawConfirm, setShowDrawConfirm] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const handleGoHome = useCallback(() => {
    if (isGameActive) {
      setShowHomeConfirm(true);
    } else if (isWaitingForGame) {
      // Cancel search before going home
      cancelSearch();
      navigate("/");
    } else {
      navigate("/");
    }
  }, [isGameActive, isWaitingForGame, cancelSearch, navigate]);

  const confirmGoHome = useCallback(() => {
    setShowHomeConfirm(false);
    if (isGameActive) {
      resign();
    }
    setTimeout(() => navigate("/"), 300);
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

  const handleCancelSearch = useCallback(() => {
    cancelSearch();
  }, [cancelSearch]);

  const handleResign = useCallback(() => {
    if (!isGameActive) return;
    setShowResignConfirm(true);
  }, [isGameActive]);

  const confirmResign = useCallback(() => {
    setShowResignConfirm(false);
    resign();
  }, [resign]);

  const getDrawButtonText = () => {
    if (drawOfferSent) {
      return "Offer Sent";
    }
    if (isGameActive) {
      return `Draw (${drawOfferCount} left)`;
    }
    return "Draw";
  };

  const isDrawDisabled =
    !isGameActive || drawOfferSent || isGameOver || drawOfferCount <= 0;

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <Button
          variant="secondary"
          size="md"
          onClick={handleGoHome}
          text="Home"
          icon={<ArrowLeft className="w-4 h-4" />}
        />

        {/* Play/Cancel button - centered CTA */}
        {isWaitingForGame ? (
          <Button
            variant="secondary"
            size="md"
            onClick={handleCancelSearch}
            text="Cancel Search"
            icon={<X className="w-4 h-4" />}
          />
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handlePlayGame}
            text="Play Game"
            icon={<Play className="w-6 h-4" />}
            disabled={isGameActive}
          />
        )}

        {/* Secondary game actions - positioned on right */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="md"
            onClick={handleOfferDraw}
            text={getDrawButtonText()}
            icon={<Handshake className="w-4 h-4" />}
            disabled={isDrawDisabled}
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
        message={`Are you sure you want to offer a draw? You have ${
          3 - drawOfferCount
        } offers remaining.`}
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
