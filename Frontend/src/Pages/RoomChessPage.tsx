import { ChatInterface } from "../Components/room/ChatInterface";
import { RoomHeader, ChessBoard, MoveHistory } from "../Components";
import { DrawOfferDialog } from "../Components/chess";
import { GameMessages } from "../types/chess";
import { useGameStore } from "../stores/useGameStore";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function RoomChessPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const gameStatus = useGameStore((state) => state.gameStatus);
  
  // ✅ Get room state from Zustand store
  const roomCode = useGameStore((state) => state.roomId);
  const roomStatus = useGameStore((state) => state.roomStatus);
  const isRoomCreator = useGameStore((state) => state.isRoomCreator);
  const opponentId = useGameStore((state) => state.opponentId);
  const opponentName = useGameStore((state) => state.opponentName);
  const setRoomInfo = useGameStore((state) => state.setRoomInfo);
  
  // Calculate player count based on whether there's an opponent
  const playerCount = opponentId ? 2 : 1;
  
  const isGameActive =
    gameStatus !== GameMessages.SEARCHING && gameStatus !== GameMessages.GAME_OVER;

  // Validate room ID and sync with store
  useEffect(() => {
    if (!roomId) {
      console.error("No room ID provided");
      navigate("/room");
      return;
    }

    // If stored roomCode doesn't match URL, clear the stored data
    if (roomCode && roomCode !== roomId) {
      console.log("Room mismatch - clearing stored room data");
      setRoomInfo({
        code: roomId,
        status: "WAITING",
        playerCount: 1,
        isCreator: false,
        opponentId: null,
        opponentName: null,
        gameId: null,
      });
    }

    console.log(`Joining room: ${roomId}`);
  }, [roomId, navigate, roomCode, setRoomInfo]);

  const handleLeaveRoom = () => {
    // Handle leave room logic here
    console.log("Leaving room...");
    navigate("/room");
  };

  const handleOfferDraw = () => {
    console.log("Offering draw...");
    // Add draw offer logic here
  };

  const handleResign = () => {
    console.log("Resigning...");
    // Add resign logic here
  };

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
          onLeave={handleLeaveRoom}
          onOfferDraw={handleOfferDraw}
          onResign={handleResign}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
          
          {/* Chat Interface - Left side */}
          <div className="lg:col-span-1 order-3 lg:order-1">
            <ChatInterface />
          </div>

          {/* Game Board Section - Center */}
          <div className="lg:col-span-1 order-1 lg:order-2 flex flex-col items-center gap-4">
            {/* Game Board Header */}
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
            <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl w-full">
              <div className="flex items-center justify-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg transition-colors duration-150 font-medium">
                  <span className="text-sm">Resign</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-150 font-medium">
                  <span className="text-sm">Offer Draw (0/3)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Move History */}
          <div className="lg:col-span-1 order-2 lg:order-3">
            {isGameActive && <MoveHistory />}
          </div>

        </div>
      </div>

      {/* Draw Offer Dialog */}
      <DrawOfferDialog />
    </div>
  );
}