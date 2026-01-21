import { ChessBoard, MoveHistory, DrawOfferDialog } from "../Components";
import { PlayerInfo } from "../Components/chess";
import { ConfirmDialog } from "../Components/ConfirmDialog";
import { GameMessages } from "../types/chess";
import { useGameStore } from "../stores/useGameStore";
import { useEffect, useState } from "react";
import { useUserQuery } from "../hooks/useUserQuery";
import {  ArrowLeft } from "lucide-react";
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
    console.log(user)
    if (user?.id === null || user?.id === undefined) {
    console.error("No User ID found");
    return;
  }
    const guestId = String(user.id);
    console.log("Past return block")
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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden flex flex-col">
      {/* UNIFIED HEADER - Fixes Back Button and Search Status */}
      <div className="w-full flex items-center justify-between px-4 h-14 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-[60] flex-shrink-0">
        <button
          onClick={handleQuitClick}
          className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md active:scale-95 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-bold uppercase">Back</span>
        </button>

        {gameStatus === GameMessages.SEARCHING && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-500 border-t-transparent" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Finding Opponent</span>
          </div>
        )}
      </div>

      {/* MAIN GAME AREA */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-2 md:p-8 overflow-hidden">
        <div className="w-full h-full flex flex-col md:flex-row gap-4 items-center justify-center max-w-[1800px]">
          
          {/* BOARD & TIMERS SECTION */}
          <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
            <div className="w-full flex flex-col items-center gap-1">
              {/* Opponent Info (Top Timer) */}
              <div className="w-full max-w-[min(90vw,42vh)] md:max-w-[700px]">
                <PlayerInfo
                  playerName={gameId || gameStatus === GameMessages.GAME_ACTIVE ? opponentName || "Opponent" : "Waiting..."}
                  playerColor={color === "w" ? "black" : "white"}
                  timeLeft={color === "w" ? formatTimer(blackTimer) : formatTimer(whiteTimer)}
                  position="top"
                />
              </div>

              {/* Scaled Chess Board */}
              <div className="w-full max-w-[min(90vw,42vh)] md:max-w-[min(70vw,75vh)] aspect-square shadow-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-200">
                <ChessBoard />
              </div>

              {/* Current Player Info (Bottom Timer) */}
              <div className="w-full max-w-[min(90vw,42vh)] md:max-w-[700px]">
                <PlayerInfo
                  playerName={user?.name || "You"}
                  playerColor={color === "w" ? "white" : "black"}
                  timeLeft={color === "w" ? formatTimer(whiteTimer) : formatTimer(blackTimer)}
                  position="bottom"
                />
              </div>
            </div>
          </div>

          {/* SIDEBAR: MOVES & ACTIONS */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col gap-3 flex-shrink-0 max-h-[35vh] md:max-h-full">
            {/* Move History - Hidden on small mobile to save space, visible on tablet/desktop */}
            <div className="hidden md:flex flex-1 overflow-hidden bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 shadow-lg">
              <MoveHistory />
            </div>

            {/* Game Initiation / Search Controls */}
            {!gameInitiated || gameStatus === GameMessages.SEARCHING ? (
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col items-center gap-3">
                {gameStatus === GameMessages.SEARCHING ? (
                  <button onClick={handleCancelSearch} className="w-full h-11 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl">Cancel Search</button>
                ) : (
                  <button onClick={handleStartGame} disabled={isUserLoading} className="w-full h-11 bg-emerald-500 text-white font-bold rounded-xl">Start Game</button>
                )}
              </div>
            ) : (
              /* Active Game Actions */
              <div className="flex gap-2 w-full max-w-[min(90vw,42vh)] mx-auto md:max-w-none">
                <button onClick={() => setShowResignDialog(true)} disabled={!isGameActive} className="flex-1 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 font-bold text-xs uppercase border border-red-200 dark:border-red-900/50">Resign</button>
                <button onClick={() => offerDraw()} disabled={!isGameActive || drawOfferSent} className="flex-1 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold text-xs uppercase border border-blue-200 dark:border-blue-900/50">{drawOfferSent ? "Sent" : "Draw"}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIALOGS */}
      <ConfirmDialog isOpen={showResignDialog} onClose={() => setShowResignDialog(false)} onConfirm={() => { resign(); setShowResignDialog(false); }} title="Resign Game?" message="Are you sure you want to resign?" confirmText="Resign" cancelText="Cancel" />
      <ConfirmDialog isOpen={showQuitDialog} onClose={() => setShowQuitDialog(false)} onConfirm={handleQuitConfirm} title="Quit Game?" message="Leaving will count as a loss." confirmText="Quit" cancelText="Stay" />
      <DrawOfferDialog />
    </div>
  );
}