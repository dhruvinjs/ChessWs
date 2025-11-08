import { memo, useState } from "react";
import { Copy, Users, Check } from "lucide-react";
import { Button } from "../Button";
import { ConfirmDialog } from "../ConfirmDialog";

interface RoomHeaderProps {
  roomCode: string;
  playerCount: number;
  maxPlayers: number;
  status: string;
  opponentName?: string | null;
  isCreator: boolean;
  gameActive?: boolean;
  onLeave: () => void;
  onOfferDraw?: () => void;
  onResign?: () => void;
}

const RoomHeaderComponent = ({
  roomCode,
  playerCount,
  maxPlayers,
  status,
  opponentName,
  isCreator,
  gameActive = false,
  onLeave,
  onOfferDraw,
  onResign,
}: RoomHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDrawDialog, setShowDrawDialog] = useState(false);
  const [showResignDialog, setShowResignDialog] = useState(false);

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy room code:", err);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "WAITING":
        return { text: "Waiting for opponent...", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-900/20" };
      case "FULL":
        return { text: "Room Full - Ready to start!", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-900/20" };
      case "ACTIVE":
        return { text: "Game in progress", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/20" };
      case "FINISHED":
        return { text: "Game finished", color: "text-gray-600 dark:text-gray-400", bgColor: "bg-gray-50 dark:bg-gray-900/20" };
      default:
        return { text: status, color: "text-slate-600 dark:text-slate-400", bgColor: "bg-slate-50 dark:bg-slate-900/20" };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 md:p-5 rounded-2xl shadow-xl flex items-center justify-between w-full">
      {/* Left Section - Title and Room Code */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="inline-block w-1.5 h-6 bg-indigo-500 rounded"></span>
            Chess Room
          </h1>
          <div className="flex flex-col gap-2 mt-1">
            {/* Room Code */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Room Code:
              </span>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
                <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wider">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyRoomCode}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors duration-150"
                  title="Copy room code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Status and Opponent Info */}
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-lg ${statusInfo.bgColor}`}>
                <span className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
              {opponentName && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 dark:text-white">vs</span>
                  <span className="text-md font-bold text-slate-700 dark:text-white">
                    {opponentName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Player Count and Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Player Count */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
          <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {playerCount}/{maxPlayers} Players
          </span>
        </div>

        {/* Game Action Buttons - only show during active game */}
        {gameActive && (
          <div className="flex items-center gap-2">
            {onOfferDraw && (
              <Button
                size="sm"
                variant="secondary"
                text="Offer Draw"
                onClick={() => setShowDrawDialog(true)}
                className="text-xs"
              />
            )}
            {onResign && (
              <Button
                size="sm"
                variant="outline"
                text="Resign"
                onClick={() => setShowResignDialog(true)}
                className="text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              />
            )}
          </div>
        )}

        {/* Leave Button */}
        <Button
          size="sm"
          variant="outline"
          text="Leave"
          onClick={() => setShowLeaveDialog(true)}
          className="text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        />
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        onConfirm={() => {
          setShowLeaveDialog(false);
          onLeave();
        }}
        title="Leave Room"
        message="Are you sure you want to leave this room? If a game is in progress, you will forfeit the match."
        confirmText="Leave Room"
        cancelText="Stay"
      />

      <ConfirmDialog
        isOpen={showDrawDialog}
        onClose={() => setShowDrawDialog(false)}
        onConfirm={() => {
          setShowDrawDialog(false);
          onOfferDraw?.();
        }}
        title="Offer Draw"
        message="Do you want to offer a draw to your opponent?"
        confirmText="Offer Draw"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={showResignDialog}
        onClose={() => setShowResignDialog(false)}
        onConfirm={() => {
          setShowResignDialog(false);
          onResign?.();
        }}
        title="Resign Game"
        message="Are you sure you want to resign? This will end the game and your opponent will win."
        confirmText="Resign"
        cancelText="Continue Playing"
      />
    </div>
  );
};

export const RoomHeader = memo(RoomHeaderComponent);
RoomHeader.displayName = "RoomHeader";