import { memo, useState, useCallback, useMemo } from "react";
import { Copy, Users, Check, Crown, UserCircle } from "lucide-react";
import { Button } from "../Button";
import { ConfirmDialog } from "../ConfirmDialog";
// import { Timer } from "../chess/Timer";

interface RoomHeaderProps {
  roomCode: string;
  playerCount: number;
  maxPlayers: number;
  status: string;
  opponentName?: string | null;
  isCreator: boolean;
  gameActive?: boolean;
  whiteTimer?: number;
  blackTimer?: number;
  onLeave: () => void;
  onStartGame?: () => void;
}

// Memoized Copy Button Component
const CopyButton = memo(
  ({
    roomCode,
    copied,
    onCopy,
  }: {
    roomCode: string;
    copied: boolean;
    onCopy: () => void;
  }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
        Room Code:
      </span>
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
        <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wider">
          {roomCode}
        </span>
        <button
          onClick={onCopy}
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
  )
);
CopyButton.displayName = "CopyButton";

// Memoized Host Badge Component
const RoleBadge = memo(({ isCreator }: { isCreator: boolean }) => (
  <div
    className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
      isCreator
        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md"
        : "bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md"
    }`}
  >
    {isCreator ? (
      <>
        <Crown className="w-3.5 h-3.5" />
        <span className="text-xs font-bold tracking-wide">HOST</span>
      </>
    ) : (
      <>
        <UserCircle className="w-3.5 h-3.5" />
        <span className="text-xs font-bold tracking-wide">Participant</span>
      </>
    )}
  </div>
));
RoleBadge.displayName = "RoleBadge";

// Memoized Status Badge Component
const StatusBadge = memo(
  ({ status }: { status: string; opponentName?: string | null }) => {
    const statusInfo = useMemo(() => {
      switch (status) {
        case "WAITING":
          return {
            text: "Waiting for opponent...",
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-900/20",
          };
        case "FULL":
          return {
            text: "Room Full - Ready to start!",
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/20",
          };
        case "ACTIVE":
          return {
            text: "Game in progress",
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
          };
        case "FINISHED":
          return {
            text: "Game finished",
            color: "text-gray-600 dark:text-gray-400",
            bgColor: "bg-gray-50 dark:bg-gray-900/20",
          };
        default:
          return {
            text: status,
            color: "text-slate-600 dark:text-slate-400",
            bgColor: "bg-slate-50 dark:bg-slate-900/20",
          };
      }
    }, [status]);

    return (
      <div className="flex items-center gap-3">
        <div className={`px-3 py-1 rounded-lg ${statusInfo.bgColor}`}>
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
      </div>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

// Memoized Player Count Component
const PlayerCount = memo(
  ({
    playerCount,
    maxPlayers,
  }: {
    playerCount: number;
    maxPlayers: number;
  }) => (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
      <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {playerCount}/{maxPlayers}
      </span>
    </div>
  )
);
PlayerCount.displayName = "PlayerCount";

const RoomHeaderComponent = ({
  roomCode,
  playerCount,
  maxPlayers,
  status,
  opponentName,
  isCreator,
  gameActive = false,
  onLeave,
  onStartGame,
}: RoomHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const handleCopyRoomCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy room code:", err);
    }
  }, [roomCode]);

  const handleLeaveConfirm = useCallback(() => {
    setShowLeaveDialog(false);
    onLeave();
  }, [onLeave]);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 md:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4 md:gap-0">
      
      {/* Left Section - Title and Room Details */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
        <div>
          <div className="flex items-center gap-3 mb-2 md:mb-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="inline-block w-1.5 h-6 bg-indigo-500 rounded"></span>
              Chess Room
            </h1>
            <RoleBadge isCreator={isCreator} />
          </div>
          
          {/* Room Code & Status - Stacked on small, horizontal on medium */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-2 mt-1">
            <CopyButton
              roomCode={roomCode}
              copied={copied}
              onCopy={handleCopyRoomCode}
            />
            <StatusBadge status={status} opponentName={opponentName} />
          </div>
        </div>
      </div>

      {/* Right Section - Action Area */}
      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-700">
        
        {/* Statistics & Actions group */}
        <div className="flex items-center gap-3">
          <PlayerCount playerCount={playerCount} maxPlayers={maxPlayers} />

          {/* Start Game Button */}
          {isCreator && status === "FULL" && !gameActive && onStartGame && (
            <Button
              size="sm"
              variant="primary"
              text="🎮 Start" // Shortened text for mobile
              onClick={onStartGame}
              className="text-xs md:text-sm px-4 md:px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg animate-pulse whitespace-nowrap"
            />
          )}
        </div>

        {/* Leave Button */}
        {status !== "FINISHED" && (
          <Button
            size="md"
            variant="outline"
            text={gameActive ? (window.innerWidth < 768 ? "Resign" : "Resign & Leave") : "Leave"}
            onClick={() => setShowLeaveDialog(true)}
            className="text-[10px] md:text-xs border-red-200 text-red-600 dark:border-red-700 dark:text-red-400 whitespace-nowrap"
          />
        )}

        {/* Game Over Message */}
        {status === "FINISHED" && (
          <div className="text-[10px] md:text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 md:px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-700">
            Finished
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        onConfirm={handleLeaveConfirm}
        title="Leave Room"
        message="Are you sure you want to leave this room? If a game is in progress, you will forfeit the match."
        confirmText="Leave Room"
        cancelText="Stay"
      />
    </div>
  );
};

export const RoomHeader = memo(RoomHeaderComponent);
RoomHeader.displayName = "RoomHeader";
