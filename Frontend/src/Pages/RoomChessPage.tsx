import { ChatInterface } from "../Components/room/ChatInterface";
import { RoomHeader, ChessBoard, MoveHistory } from "../Components";
import { PlayerInfo } from "../Components/chess";
import { ConfirmDialog } from "../Components/ConfirmDialog";
import { GameMessages } from "../types/chess";
import { useGameStore } from "../stores/useGameStore";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, memo, useCallback, useState, useRef } from "react";
import { roomSocketManager } from "../lib/RoomSocketManager";
import { useUserQuery } from "../hooks/useUserQuery";
import { ArrowLeft } from "lucide-react";

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
  const color = useGameStore((state) => state.color);

  // ✅ Memoize computed values
  const playerCount = useMemo(() => (opponentId ? 2 : 1), [opponentId]);
  const isGameActive = useMemo(
    () => gameStatus === GameMessages.GAME_ACTIVE,
    [gameStatus]
  );

  // Format timer for display (MM:SS)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

    // ✅ Initialize room WebSocket (authenticated via JWT cookie)
    if (!socketInitialized.current && !roomSocketManager.isConnected()) {
      console.log(
        `🔌 RoomChessPage: Connecting RoomSocketManager for room ${roomId}`
      );
      roomSocketManager
        .connect()
        .then(() => {
          console.log(
            `✅ RoomChessPage: RoomSocketManager connected successfully`
          );
          socketInitialized.current = true;
        })
        .catch((err) => {
          console.error(
            `❌ RoomChessPage: Failed to connect RoomSocketManager:`,
            err
          );
        });
    } else if (roomSocketManager.isConnected()) {
      console.log(
        `✅ RoomChessPage: WebSocket already connected, reusing connection`
      );
      socketInitialized.current = true;
    }

    // NOTE: Don't disconnect on unmount - only disconnect when explicitly leaving
    // The socket needs to stay connected for reconnection scenarios
    return () => {
      console.log(
        `🧹 RoomChessPage: Component unmounting (but keeping socket connected)`
      );
      socketInitialized.current = false;
    };
  }, [roomId, roomCode, navigate, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 p-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg transition-colors duration-150 font-medium w-fit"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Home</span>
        </button>

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
            {/* Chessboard with Player Info */}
            <div className="w-full max-w-full">
              {gameStatus === GameMessages.SEARCHING ? (
                <div className="flex items-center justify-center h-full aspect-square text-center text-xl font-semibold text-slate-600 dark:text-slate-400 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl">
                  <p>Waiting for game to start...</p>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-0">
                  {/* Opponent Info (Top) */}
                  <div className="w-full">
                    <PlayerInfo
                      playerName={opponentName || "Opponent"}
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
