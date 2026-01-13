import { ChessBoard, MoveHistory } from "../Components";
import { PlayerInfo } from "../Components/chess";
import { ConfirmDialog } from "../Components/ConfirmDialog";
import { GameMessages } from "../types/chess";
import { useGameStore } from "../stores/useGameStore";
import { useEffect, useState } from "react";
import { useUserQuery } from "../hooks/useUserQuery";
import { Flag, Handshake, ArrowLeft } from "lucide-react";
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
    resign();
    setShowQuitDialog(false);
    navigate("/home");
  };

  const handleStartGame = () => {
    if (!user?.id) return;
    const guestId = String(user.id);
    initGuestConnection(guestId);
    setGameInitiated(true);
    setTimeout(() => {
      const { initGameRequest } = useGameStore.getState();
      initGameRequest();
    }, 100);
  };

  const handleCancelSearch = () => {
    cancelSearch();
    setGameInitiated(false);
  };

  useEffect(() => {
    if (!user?.id) return;
    const guestId = String(user.id);
    initGuestConnection(guestId);
    if (
      gameId ||
      gameStatus === GameMessages.SEARCHING ||
      gameStatus === GameMessages.GAME_ACTIVE ||
      (moves.length > 0 && gameStatus !== GameMessages.GAME_OVER)
    ) {
      setGameInitiated(true);
    }
  }, [user?.id, initGuestConnection, gameId, gameStatus, moves.length]);

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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Searching Overlay */}
      {gameStatus === GameMessages.SEARCHING && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl px-5 py-3.5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent"></div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Finding opponent...
            </p>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="h-full flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div
          className="w-full h-full max-h-[96vh] flex flex-col md:flex-row gap-5 md:gap-6 lg:gap-8"
          style={{ maxWidth: "1800px" }}
        >
          {/* LEFT SECTION - Board + Player Info */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-5 min-h-0 min-w-0">
            <div className="flex-shrink-0 w-full flex items-center justify-center">
              <div className="w-full max-w-[min(92vw,52vh)] md:max-w-[min(70vw,80vh)] lg:max-w-[min(60vw,85vh)] xl:max-w-[700px] 2xl:max-w-[750px] flex flex-col gap-0">
                {/* Back Button */}
                <div className="w-full mb-3 md:mb-4">
                  <button
                    onClick={handleQuitClick}
                    className="flex items-center gap-2 px-4 h-11 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/90 text-slate-700 dark:text-white backdrop-blur-md shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
                    style={{ minWidth: "44px", minHeight: "44px" }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Back</span>
                  </button>
                </div>

                {/* Opponent Info (Top) */}
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
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-[650px] lg:max-w-[700px] xl:max-w-[750px] aspect-square">
                    <ChessBoard />
                  </div>
                </div>

                {/* Current Player Info (Bottom) */}
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

            {/* Moves Section - Mobile Only */}
            <div className="w-full max-w-[92vw] md:hidden flex-shrink-0">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Move History
                  </h3>
                </div>

                {gameStatus === GameMessages.SEARCHING ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <span className="text-4xl mb-5">♟</span>
                    <button
                      onClick={handleCancelSearch}
                      className="px-6 h-11 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                      style={{ minWidth: "44px", minHeight: "44px" }}
                    >
                      Cancel Search
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                      Stop searching
                    </p>
                  </div>
                ) : !gameInitiated ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <span className="text-4xl mb-5">♟</span>
                    <button
                      onClick={handleStartGame}
                      disabled={isUserLoading}
                      className="px-6 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ minWidth: "44px", minHeight: "44px" }}
                    >
                      Start Game
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                      Find opponent
                    </p>
                  </div>
                ) : (
                  <div className="max-h-40 mb-4 overflow-y-auto">
                    <MoveHistory />
                  </div>
                )}

                {/* Action Buttons - Mobile */}
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowResignDialog(true)}
                    disabled={!isGameActive}
                    className="flex-1 flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 font-medium shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ minWidth: "44px", minHeight: "44px" }}
                  >
                    <Flag className="w-4 h-4" />
                    <span className="text-sm">Resign</span>
                  </button>
                  <button
                    onClick={() => offerDraw()}
                    disabled={!isGameActive || drawOfferSent}
                    className="flex-1 flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ minWidth: "44px", minHeight: "44px" }}
                  >
                    <Handshake className="w-4 h-4" />
                    <span className="text-sm">{drawOfferSent ? "Sent" : "Draw"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION - Desktop Moves Panel */}
          <div
            className="hidden md:flex w-80 lg:w-96 xl:w-[400px] flex-col min-h-0"
            style={{ maxHeight: "calc(100vh - 3rem)" }}
          >
            <div className="flex-1 flex flex-col min-h-0 relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              {/* Overlay for Start/Cancel */}
              {gameStatus === GameMessages.SEARCHING ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl z-20">
                  <div className="flex flex-col items-center text-center p-8">
                    <span className="text-5xl mb-6">♟</span>
                    <button
                      onClick={handleCancelSearch}
                      className="px-8 h-12 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                      style={{ minWidth: "44px", minHeight: "44px" }}
                    >
                      Cancel Search
                    </button>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                      Stop searching
                    </p>
                  </div>
                </div>
              ) : (
                !gameInitiated && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl z-20">
                    <div className="flex flex-col items-center text-center p-8">
                      <span className="text-5xl mb-6">♟</span>
                      <button
                        onClick={handleStartGame}
                        disabled={isUserLoading}
                        className="px-8 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ minWidth: "44px", minHeight: "44px" }}
                      >
                        Start Game
                      </button>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                        Find opponent
                      </p>
                    </div>
                  </div>
                )
              )}

              <MoveHistory />
            </div>

            {/* Action Buttons - Desktop */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowResignDialog(true)}
                disabled={!isGameActive}
                className="flex-1 flex items-center justify-center gap-2 px-4 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 font-medium shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ minWidth: "44px", minHeight: "44px" }}
              >
                <Flag className="w-4 h-4" />
                <span className="text-sm">Resign</span>
              </button>
              <button
                onClick={() => offerDraw()}
                disabled={!isGameActive || drawOfferSent}
                className="flex-1 flex items-center justify-center gap-2 px-4 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium shadow-sm active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ minWidth: "44px", minHeight: "44px" }}
              >
                <Handshake className="w-4 h-4" />
                <span className="text-sm">{drawOfferSent ? "Sent" : "Draw"}</span>
              </button>
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