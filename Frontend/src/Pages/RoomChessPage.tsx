import { ChatInterface } from "../Components/room/ChatInterface";
import { RoomHeader, ChessBoard, MoveHistory } from "../Components";
import { ConfirmDialog } from "../Components/ConfirmDialog";
import { GameMessages } from "../types/chess";
import { useGameStore } from "../stores/useGameStore";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, memo, useCallback, useState, useRef } from "react";
import { SocketManager } from "../lib/socketManager";
import { useUserQuery } from "../hooks/useUserQuery";

// Memoized Game Controls Component
const GameControls = memo(
  ({
    isGameActive,
    drawOfferSent,
    onResign,
    onOfferDraw,
  }: {
    isGameActive: boolean;
    drawOfferSent: boolean;
    onResign: () => void;
    onOfferDraw: () => void;
  }) => (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl w-full">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onResign}
          disabled={!isGameActive}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm">Resign</span>
        </button>
        <button
          onClick={onOfferDraw}
          disabled={!isGameActive || drawOfferSent}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm">
            {drawOfferSent ? "Draw Offer Sent" : "Offer Draw"}
          </span>
        </button>
      </div>
    </div>
  )
);
GameControls.displayName = "GameControls";

// Memoized Board Header Component
const BoardHeader = memo(() => (
  <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl w-full">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
        <span className="inline-block w-1.5 h-5 bg-indigo-500 rounded"></span>
        Game Board
      </h2>
      <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-sm font-medium">
        Your Turn
      </div>
    </div>
  </div>
));
BoardHeader.displayName = "BoardHeader";

function RoomChessPageComponent() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const socketInitialized = useRef(false);

  // State for resign confirmation dialog
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  // ✅ Optimized: Use selective subscriptions to prevent unnecessary re-renders
  const roomCode = useGameStore((state) => state.roomId);
  const roomStatus = useGameStore((state) => state.roomStatus);
  const isRoomCreator = useGameStore((state) => state.isRoomCreator);
  const opponentId = useGameStore((state) => state.opponentId);
  const opponentName = useGameStore((state) => state.opponentName);
  const whiteTimer = useGameStore((state) => state.whiteTimer);
  const blackTimer = useGameStore((state) => state.blackTimer);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const drawOfferSent = useGameStore((state) => state.drawOfferSent);

  // ✅ Memoize computed values
  const playerCount = useMemo(() => (opponentId ? 2 : 1), [opponentId]);
  const isGameActive = useMemo(
    () => gameStatus === GameMessages.GAME_ACTIVE,
    [gameStatus]
  );

  // ✅ Memoize callback functions to prevent re-creation
  const handleStartGame = useCallback(() => {
    const { startRoomGame } = useGameStore.getState();
    startRoomGame();
  }, []);

  const handleResign = useCallback(() => {
    if (!isGameActive) return;
    setShowResignConfirm(true);
  }, [isGameActive]);

  const confirmResign = useCallback(() => {
    setShowResignConfirm(false);
    const { resignRoomGame } = useGameStore.getState();
    resignRoomGame();
  }, []);

  const handleOfferDraw = useCallback(() => {
    const { offerDraw } = useGameStore.getState();
    offerDraw();
  }, []);

  const handleLeaveRoom = useCallback(async () => {
    const {
      leaveRoom,
      exitRoom,
      resignRoomGame,
      roomGameId,
      winner,
      gameStatus,
    } = useGameStore.getState();

    // Check if game is over (winner exists or gameStatus is GAME_OVER)
    const isGameOver = winner !== null || gameStatus === "GAME_OVER";

    if (isGameOver) {
      // Game is over - just exit without calling cancel API
      exitRoom();
    } else if (roomGameId) {
      // Game is active - resign from the game
      resignRoomGame();
      // After resigning, also exit the room
      setTimeout(() => {
        exitRoom();
      }, 1000);
    } else {
      // No game started - cancel the room via API
      await leaveRoom();
    }

    navigate("/room");
  }, [navigate]);

  // Validate room ID and sync with store
  useEffect(() => {
    if (!roomId) {
      navigate("/room");
      return;
    }

    // ✅ Sync room ID from URL if store doesn't have it or it's different
    if (!roomCode || roomCode !== roomId) {
      const { syncRoomId } = useGameStore.getState();
      syncRoomId(roomId);
    }

    // ✅ Initialize room WebSocket for authenticated users only
    if (user?.id && typeof user.id === "number" && !socketInitialized.current) {
      const socketManager = SocketManager.getInstance();
      socketManager.init("room", user.id);
      socketInitialized.current = true;
    }

    // Cleanup on unmount
    return () => {
      socketInitialized.current = false;
    };
  }, [roomId, roomCode, navigate, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 p-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-4">
        {/* Room Header */}
        <RoomHeader
          roomCode={roomCode || roomId || ""}
          playerCount={playerCount}
          maxPlayers={2}
          status={roomStatus || "WAITING"}
          opponentName={opponentName}
          isCreator={isRoomCreator}
          gameActive={isGameActive}
          whiteTimer={whiteTimer}
          blackTimer={blackTimer}
          onLeave={handleLeaveRoom}
          onStartGame={handleStartGame}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 w-full">
          {/* Chat Interface - Left side */}
          <div className="lg:col-span-2 order-3 lg:order-1">
            <ChatInterface />
          </div>

          {/* Game Board Section - Center */}
          <div className="lg:col-span-3 order-1 lg:order-2 flex flex-col items-center gap-4">
            {/* Game Board Header */}
            <BoardHeader />

            {/* Chessboard */}
            <div className="w-full aspect-square max-w-full">
              {gameStatus === GameMessages.SEARCHING ? (
                <div className="flex items-center justify-center h-full text-center text-xl font-semibold text-slate-600 dark:text-slate-400 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl">
                  <p>Waiting for game to start...</p>
                </div>
              ) : (
                <ChessBoard />
              )}
            </div>

            {/* Game Controls - Bottom */}
            <GameControls
              isGameActive={isGameActive}
              drawOfferSent={drawOfferSent}
              onResign={handleResign}
              onOfferDraw={handleOfferDraw}
            />
          </div>

          {/* Right Panel - Move History */}
          <div className="lg:col-span-2 order-2 lg:order-3">
            <MoveHistory />
          </div>
        </div>
      </div>

      {/* Draw Offer Dialog */}
      {/* Resign Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResignConfirm}
        onClose={() => setShowResignConfirm(false)}
        onConfirm={confirmResign}
        title="Resign Game"
        message="Are you sure you want to resign? This will end the game and you will lose."
        confirmText="Resign"
        cancelText="Cancel"
      />
    </div>
  );
}

export { RoomChessPageComponent as RoomChessPage };
