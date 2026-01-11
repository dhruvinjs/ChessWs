import { ChessBoard, MoveHistory } from "../Components";
import { PlayerInfo } from "../Components/chess";
import { ConfirmDialog } from "../Components/ConfirmDialog";
import { GameMessages } from "../types/chess";
import { useGameStore } from "../stores/useGameStore";
import { useEffect, useState } from "react";
import { useUserQuery } from "../hooks/useUserQuery";
import { Flag, Handshake, ArrowLeft } from "lucide-react";
import { Button } from "../Components/Button";
import { useNavigate } from "react-router-dom";

export function ChessGame() {
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [gameInitiated, setGameInitiated] = useState(false);
  const navigate = useNavigate();

  const gameStatus = useGameStore((state) => state.gameStatus);
  const gameId = useGameStore((state) => state.gameId);
  const initGuestConnection = useGameStore(
    (state) => state.initGuestConnection
  );
  const moves = useGameStore((state) => state.moves);
  const resign = useGameStore((state) => state.resign);
  const offerDraw = useGameStore((state) => state.offerDraw);
  const drawOfferSent = useGameStore((state) => state.drawOfferSent);
  const cancelSearch = useGameStore((state) => state.cancelSearch);
  const color = useGameStore((state) => state.color);
  const opponentName = useGameStore((state) => state.opponentName);
  const whiteTimer = useGameStore((state) => state.whiteTimer);
  const blackTimer = useGameStore((state) => state.blackTimer);

  const { data: user, isLoading: isUserLoading } = useUserQuery();

  const isGameActive =
    gameStatus !== GameMessages.SEARCHING &&
    gameStatus !== GameMessages.GAME_OVER;

  // Format timer for display (MM:SS)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleQuitClick = () => {
    if (isGameActive) {
      setShowQuitDialog(true);
    } else {
      navigate("/home");
    }
  };

  const handleQuitConfirm = () => {
    resign(); // Resign from the game
    setShowQuitDialog(false);
    navigate("/home");
  };

  // Handle game initialization when user clicks Start Game
  const handleStartGame = () => {
    if (!user?.id) return;
    const guestId = String(user.id);

    // Initialize WebSocket connection
    initGuestConnection(guestId);
    setGameInitiated(true);

    // Wait a brief moment for WebSocket to connect, then send INIT_GAME
    setTimeout(() => {
      const { initGameRequest } = useGameStore.getState();
      initGameRequest();
    }, 100);
  };

  // Handle cancel search
  const handleCancelSearch = () => {
    cancelSearch();
    setGameInitiated(false);
  };

  // Auto-reconnect WebSocket on mount (for page refresh/reconnection scenarios)
  useEffect(() => {
    if (!user?.id) return;

    const guestId = String(user.id);

    // Always initialize WebSocket connection on mount
    initGuestConnection(guestId);

    // If we have an existing game (gameId exists) or were searching, mark as initiated
    if (
      gameId ||
      gameStatus === GameMessages.SEARCHING ||
      gameStatus === GameMessages.GAME_ACTIVE ||
      (moves.length > 0 && gameStatus !== GameMessages.GAME_OVER)
    ) {
      setGameInitiated(true);
    }
  }, [user?.id, initGuestConnection, gameId, gameStatus, moves.length]);

  // Update gameInitiated when game becomes active (after reconnection)
  useEffect(() => {
    if (gameStatus === GameMessages.GAME_ACTIVE || gameId) {
      setGameInitiated(true);
    } else if (
      gameStatus === GameMessages.GAME_OVER ||
      gameStatus === undefined
    ) {
      setGameInitiated(false);
    }
  }, [gameStatus, gameId]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Searching Overlay - Soft, non-intrusive */}
      {gameStatus === GameMessages.SEARCHING && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl px-6 py-4 shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-500 border-t-transparent"></div>
            <p className="text-lg font-semibold text-emerald-400">
              Searching for an opponent...
            </p>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="h-full flex items-center justify-center p-2 md:p-4">
        <div
          className="w-full h-full max-h-[95vh] flex flex-col md:flex-row gap-3 md:gap-4"
          style={{ maxWidth: "1600px" }}
        >
          {/* LEFT SECTION - Board + Player Info */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 md:gap-4 min-h-0 min-w-0">
            {/* Board Container with Player Info */}
            <div className="flex-shrink-0 w-full flex items-center justify-center">
              <div className="w-full max-w-[min(85vw,80vh)] md:max-w-[min(85vw,85vh)] lg:max-w-[min(65vw,85vh)] xl:max-w-[850px] 2xl:max-w-[900px] flex flex-col gap-0">
                {/* Back Button - Above board */}
                <div className="w-full mb-2 md:mb-3">
                  <button
                    onClick={handleQuitClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 dark:bg-slate-700/90 dark:hover:bg-slate-600/90 text-white backdrop-blur-md border border-slate-600/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm font-semibold">Back</span>
                  </button>
                </div>

                {/* Opponent Info (Top) - Sticks to board */}
                <div className="w-full">
                  <PlayerInfo
                    playerName={
                      gameStatus === GameMessages.GAME_ACTIVE || gameId
                        ? opponentName || "Opponent"
                        : "Waiting..."
                    }
                    playerColor={color === "w" ? "black" : "white"}
                    timeLeft={
                      color === "w"
                        ? formatTimer(blackTimer)
                        : formatTimer(whiteTimer)
                    }
                    position="top"
                  />
                </div>

                {/* Chess Board */}
                <div className="w-full aspect-square -mt-[1px]">
                  <ChessBoard />
                </div>

                {/* Current Player Info (Bottom) - Sticks to board */}
                <div className="w-full -mt-[1px]">
                  <PlayerInfo
                    playerName={user?.name || "You"}
                    playerColor={color === "w" ? "white" : "black"}
                    timeLeft={
                      color === "w"
                        ? formatTimer(whiteTimer)
                        : formatTimer(blackTimer)
                    }
                    position="bottom"
                  />
                </div>
              </div>
            </div>

            {/* Moves Section - Below board on mobile only */}
            <div className="w-full max-w-[85vw] md:hidden flex-shrink-0">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-2.5 relative">
                <div className="flex items-center justify-center mb-2">
                  <h3 className="text-sm font-bold text-gray-300">Moves</h3>
                </div>

                {gameStatus === GameMessages.SEARCHING ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <span className="text-3xl mb-3">♟</span>
                    <button
                      onClick={handleCancelSearch}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm"
                    >
                      Cancel Search
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Stop searching</p>
                  </div>
                ) : !gameInitiated ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <span className="text-3xl mb-3">♟</span>
                    <button
                      onClick={handleStartGame}
                      disabled={isUserLoading}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Start Game
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Find opponent</p>
                  </div>
                ) : (
                  <div className="max-h-32 mb-2">
                    <MoveHistory />
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowResignDialog(true)}
                    disabled={!isGameActive}
                    text="Resign"
                    icon={<Flag className="w-4 h-4" />}
                    className="flex-1 !bg-red-600/20 hover:!bg-red-600/30 !text-red-400 !shadow-none"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => offerDraw()}
                    disabled={!isGameActive || drawOfferSent}
                    text={drawOfferSent ? "Sent" : "Draw"}
                    icon={<Handshake className="w-4 h-4" />}
                    className="flex-1 !bg-blue-600/20 hover:!bg-blue-600/30 !text-blue-400 !shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION - Full Moves Panel on Tablet and Desktop */}
          <div
            className="hidden md:flex w-64 lg:w-72 xl:w-80 flex-col min-h-0"
            style={{ maxHeight: "calc(100vh - 2rem)" }}
          >
            {/* Moves Panel */}
            <div className="flex-1 flex flex-col min-h-0 relative">
              {/* Start Game or Cancel Search Button Overlay */}
              {gameStatus === GameMessages.SEARCHING ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-2xl z-20">
                  <div className="flex flex-col items-center text-center p-8">
                    <span className="text-5xl mb-4">♟</span>
                    <button
                      onClick={handleCancelSearch}
                      className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-semibold rounded-xl shadow-2xl hover:shadow-red-500/50 transform hover:scale-105 transition-all"
                    >
                      Cancel Search
                    </button>
                    <p className="text-sm text-gray-400 mt-4">
                      Stop searching for opponent
                    </p>
                  </div>
                </div>
              ) : (
                !gameInitiated && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-2xl z-20">
                    <div className="flex flex-col items-center text-center p-8">
                      <span className="text-5xl mb-4">♟</span>
                      <button
                        onClick={handleStartGame}
                        disabled={isUserLoading}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-lg font-semibold rounded-xl shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Start Game
                      </button>
                      <p className="text-sm text-gray-400 mt-4">
                        Click to find an opponent
                      </p>
                    </div>
                  </div>
                )
              )}

              {/* MoveHistory Component */}
              <MoveHistory />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowResignDialog(true)}
                disabled={!isGameActive}
                text="Resign"
                icon={<Flag className="w-4 h-4" />}
                className="flex-1 !bg-red-600/20 hover:!bg-red-600/30 !text-red-400 !shadow-none"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => offerDraw()}
                disabled={!isGameActive || drawOfferSent}
                text={drawOfferSent ? "Sent" : "Draw"}
                icon={<Handshake className="w-4 h-4" />}
                className="flex-1 !bg-blue-600/20 hover:!bg-blue-600/30 !text-blue-400 !shadow-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resign Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResignDialog}
        onClose={() => setShowResignDialog(false)}
        onConfirm={() => {
          resign();
          setShowResignDialog(false);
        }}
        title="Resign Game?"
        message="Are you sure you want to resign? This will count as a loss and end the game immediately."
        confirmText="Resign"
        cancelText="Cancel"
      />

      {/* Quit Game Dialog */}
      <ConfirmDialog
        isOpen={showQuitDialog}
        onClose={() => setShowQuitDialog(false)}
        onConfirm={handleQuitConfirm}
        title="Quit Current Game?"
        message="You are in an active game. Leaving will resign the game and count as a loss. Do you want to quit?"
        confirmText="Quit Game"
        cancelText="Stay"
      />
    </div>
  );
}
