import { GameHeader, GameStatus, MoveHistory, ChessBoard } from '../Components';
import { DrawOfferDialog } from '../Components/chess';
import { GameMessages } from '../types/chess';
import { useGameStore } from '../stores/useGameStore';
import { useEffect } from 'react';
import { useUserQuery } from '../hooks/useUserQuery';

export function ChessGame() {
  const gameStatus = useGameStore((state) => state.gameStatus);
  const initGuestConnection = useGameStore(
    (state) => state.initGuestConnection
  );
  const { data: user, isLoading: isUserLoading } = useUserQuery();

  const isGameActive =
    gameStatus !== GameMessages.SEARCHING &&
    gameStatus !== GameMessages.GAME_OVER;

  // ✅ Simple: Just call Zustand action when user data is ready
  useEffect(() => {
    if (isUserLoading || !user?.id) {
      return;
    }

    // Zustand handles the deduplication and WebSocket initialization
    const guestId = String(user.id);
    initGuestConnection(guestId);
  }, [user?.id, isUserLoading, initGuestConnection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 p-2 sm:p-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-2 sm:gap-4">
        {/* Game Header */}
        <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl w-full">
          <GameHeader />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full min-h-[calc(100vh-8rem)]">
          {/* Left Panel - Game Status */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <GameStatus />
          </div>

          {/* Game Board Section - Center */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center gap-4 sm:gap-6">
            {/* Game Board Header */}
            <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl w-full">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="inline-block w-1 sm:w-1.5 h-4 sm:h-5 bg-indigo-500 rounded"></span>
                  Game Board
                </h2>
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                  {gameStatus === GameMessages.SEARCHING
                    ? 'Searching'
                    : 'Active'}
                </div>
              </div>
            </div>

            {/* Chessboard */}
            <div className="w-full aspect-square max-w-sm sm:max-w-md md:max-w-full">
              {gameStatus === GameMessages.SEARCHING ? (
                <div className="flex items-center justify-center h-full text-center text-lg sm:text-xl font-semibold text-slate-600 dark:text-slate-400 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl shadow-xl">
                  <p>Searching for an opponent...</p>
                </div>
              ) : (
                <ChessBoard />
              )}
            </div>
          </div>

          {/* Right Panel - Move History */}
          <div className="lg:col-span-3 order-3 lg:order-3">
            {isGameActive && <MoveHistory />}
          </div>
        </div>
      </div>

      {/* ✅ Draw Offer Dialog */}
      <DrawOfferDialog />
    </div>
  );
}
