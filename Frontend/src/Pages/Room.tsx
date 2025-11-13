import { useState } from "react"
import { Button } from "../Components"
import { motion } from "framer-motion"
import { FloatingPieces } from "../Components/FloatingPieces"
import { roomApis } from "../api/api"
import { showMessage } from "../Components/ToastMessages"
import { useNavigate } from "react-router-dom"
import { useGameStore } from "../stores/useGameStore"
import { AlertTriangle, X } from "lucide-react"
import { SocketManager } from "../lib/socketManager"
import { useUserQuery } from "../hooks/useUserQuery"

export function Room() {
  const [roomCode, setRoomCode] = useState("")
  const [mode, setMode] = useState<"join" | "host">("join")
  const [isLoading, setIsLoading] = useState(false)
  const [showExistingRoomDialog, setShowExistingRoomDialog] = useState(false)
  const [existingRoomId, setExistingRoomId] = useState<string | null>(null)
  const navigate = useNavigate()
  const setRoomInfo = useGameStore((state) => state.setRoomInfo)
  const { data: user } = useUserQuery()

  const handleJoinRoom = async () => {
    const trimmedRoomCode = roomCode.trim();
    
    if (!trimmedRoomCode) {
      showMessage("Validation Error", "Please enter a room code", { type: "error" });
      return;
    }

    if (trimmedRoomCode.length !== 8) {
      showMessage("Validation Error", "Room code must be exactly 8 characters", { type: "error" });
      return;
    }

    console.log("Attempting to join room:", trimmedRoomCode); // Debug log
    
    setIsLoading(true);
    
    try {
      const response = await roomApis.joinRoom(trimmedRoomCode);
      console.log("Join room response:", response); // Debug log
      
      if (response.success) {
        const roomInfo = response.room;
        console.log("Room joined with status:", roomInfo); // Debug log
        
        // ✅ Store room info in Zustand
        setRoomInfo(roomInfo);
        
        // ✅ Immediately establish WebSocket connection if user is available
        if (user?.id) {
          const socketManager = SocketManager.getInstance();
          socketManager.init("room", user.id);
          console.log(`🔌 WebSocket connected early for joiner: ${user.id}`);
        }
        
        showMessage("Room Joined!", `${response.message}. Status: ${roomInfo.status} (${roomInfo.playerCount}/2 players). Redirecting...`, { type: "success" });
        
        // Clear the room code input after successful join
        setRoomCode("");
        
        // Navigate to the room chess page with a slight delay for better UX
        setTimeout(() => {
          navigate(`/room/${trimmedRoomCode}`);
        }, 1000);
      } else {
        showMessage("Join Failed", response.message || "Failed to join room", { type: "error" });
      }
    } catch (error: any) {
      console.error("Join room error:", error); // Debug log
      let errorMessage = "Failed to join room";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Add more specific error messages
      if (error.response?.status === 404) {
        errorMessage = "Room not found. Please check the room code and try again.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "Invalid room code or room is full.";
      }
      
      showMessage("Error", errorMessage, { type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleHostRoom = async () => {
    setIsLoading(true);
    try {
      const response = await roomApis.createRoom();
      if (response.success) {
        const createdRoomId = response.roomId;
        const roomInfo = response.room;
        setRoomCode(createdRoomId);
        
        console.log("Room created with status:", roomInfo); // Debug log
        
        // ✅ Store room info in Zustand
        setRoomInfo(roomInfo);
        
        // ✅ Immediately establish WebSocket connection if user is available  
        if (user?.id) {
          const socketManager = SocketManager.getInstance();
          socketManager.init("room", user.id);
          console.log(`🔌 WebSocket connected early for creator: ${user.id}`);
        }
        
        showMessage("Room Created!", `Room ${createdRoomId} created successfully! Status: ${roomInfo.status} (${roomInfo.playerCount}/2 players). Redirecting...`, { type: "success" });
        
        // Navigate to the created room after a short delay
        setTimeout(() => {
          navigate(`/room/${createdRoomId}`);
        }, 1500);
      } else {
        const errorMessage = response.message || "Failed to create room";
        showMessage("Creation Failed", errorMessage, { type: "error" });
      }
    } catch (error: any) {
      console.error("Create room error:", error); // Debug log
      
      // Check if user already has an active room
      if (error.response?.status === 400 && error.response?.data?.roomId) {
        const existingRoomCode = error.response.data.roomId;
        console.log("User already has active room:", existingRoomCode); // Debug log
        
        // Show dialog asking user if they want to rejoin
        setExistingRoomId(existingRoomCode);
        setShowExistingRoomDialog(true);
      } else {
        // Handle other types of errors
        const errorMessage = error.response?.data?.message || "Failed to create room";
        showMessage("Error", errorMessage, { type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleRejoinExistingRoom = () => {
    if (existingRoomId) {
      showMessage(
        "Rejoining Room", 
        `Redirecting to your active room (${existingRoomId})...`, 
        { type: "info" }
      );
      
      setShowExistingRoomDialog(false);
      navigate(`/room/${existingRoomId}`);
    }
  }

  const handleCancelRejoin = () => {
    setShowExistingRoomDialog(false);
    setExistingRoomId(null);
    showMessage(
      "Cancelled", 
      "Please finish or leave your existing room before creating a new one.", 
      { type: "info" }
    );
  }

  const handleCancelExistingRoom = async () => {
    if (!existingRoomId) return;
    
    setIsLoading(true);
    try {
      console.log(`🔴 Attempting to cancel room: ${existingRoomId}`);
      const response = await roomApis.cancelRoom(existingRoomId);
      console.log("📡 Cancel room API response:", response);
      
      if (response.success) {
        showMessage(
          "Room Cancelled", 
          `Room ${existingRoomId} has been cancelled successfully.`, 
          { type: "success" }
        );
        
        // Close dialog and clear stored room info
        setShowExistingRoomDialog(false);
        setExistingRoomId(null);
        
        // Clear persisted room data from Zustand by resetting to empty state
        useGameStore.setState({
          roomId: "",
          isRoomCreator: false,
          opponentId: null,
          opponentName: null,
          roomGameId: null,
          roomStatus: null,
        });
        
        console.log("✅ Room state cleared from store");
        
        // Now allow user to create a new room
        showMessage(
          "Ready", 
          "You can now create a new room.", 
          { type: "info" }
        );
      } else {
        console.error("❌ Cancel room failed:", response.message);
        showMessage("Error", response.message || "Failed to cancel room", { type: "error" });
      }
    } catch (error: any) {
      console.error("❌ Cancel room error:", error);
      const errorMessage = error.response?.data?.message || "Failed to cancel room";
      showMessage("Error", errorMessage, { type: "error" });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 flex justify-center items-start pt-32 px-4 transition-colors duration-300 relative overflow-hidden">
      {/* Floating Pieces */}
        <FloatingPieces  />


      {/* Room Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-amber-200/50 dark:border-amber-800/50 p-10 space-y-6">
          {/* Header */}
          <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Chess Room
          </h1>

          <p className="text-center text-slate-700 dark:text-slate-300">
            Join an existing room or host a new game
          </p>

          {/* Join/Host Toggle */}
          <div className="flex gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Button
              size="sm"
              variant={mode === "join" ? "outline" : "secondary"}
              text="Join Room"
              className="flex-1"
              onClick={() => setMode("join")}
            />
            <Button
              size="sm"
              variant={mode === "host" ? "outline" : "secondary"}
              text="Host Room"
              className="flex-1"
              onClick={() => setMode("host")}
            />
          </div>

          {/* Join / Host Form */}
          <div className="space-y-5">
            {mode === "join" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 8))}
                    className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-center text-lg font-mono tracking-wider text-slate-900 dark:text-white transition-all focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    placeholder="Enter 8-character room code"
                    maxLength={8}
                    autoComplete="off"
                  />
                </div>
                <Button 
                  size="lg" 
                  variant="primary" 
                  text={isLoading ? "Joining..." : "Join Room"} 
                  className="w-full" 
                  onClick={handleJoinRoom}
                  disabled={isLoading}
                />
                
                {/* Host Room Option */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-3">
                    Don't have a room code?
                  </p>
                  <Button 
                    size="md" 
                    variant="outline" 
                    text="Create Your Own Room" 
                    className="w-full" 
                    onClick={() => setMode("host")}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Room Code
                  </label>
                  <div className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-300 dark:border-amber-700 rounded-xl text-center text-lg font-mono tracking-wider text-amber-800 dark:text-amber-200">
                    {roomCode || "Click to generate"}
                  </div>
                </div>
                <Button 
                  size="lg" 
                  variant="primary" 
                  text={isLoading ? "Loading..." : (roomCode ? "Join Your Room" : "Host New Room")} 
                  className="w-full" 
                  onClick={roomCode ? () => navigate(`/room/${roomCode}`) : handleHostRoom}
                  disabled={isLoading}
                />
                {roomCode && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        text="Copy Code" 
                        className="flex-1"
                        onClick={() => {
                          navigator.clipboard.writeText(roomCode);
                          showMessage("Copied", "Room code copied to clipboard!", { type: "success" });
                        }}
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        text="Enter Room" 
                        className="flex-1"
                        onClick={() => navigate(`/room/${roomCode}`)}
                      />
                    </div>
                    <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                      Share this code with your opponent, then enter the room to start playing!
                    </p>
                  </div>
                )}
                
                {/* Join Another Room Option */}
                {!roomCode && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-3">
                      Or join an existing room instead
                    </p>
                    <Button 
                      size="md" 
                      variant="outline" 
                      text="Switch to Join Room" 
                      className="w-full" 
                      onClick={() => setMode("join")}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Existing Room Dialog with 3 options */}
      {showExistingRoomDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancelRejoin}
          />
          
          {/* Dialog */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Active Room Found
                </h3>
              </div>
              <button
                onClick={handleCancelRejoin}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                You already have an active room: <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{existingRoomId}</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose an option below:
              </p>
            </div>

            {/* Actions - 3 buttons */}
            <div className="flex flex-col gap-3 p-6 pt-0">
              <Button
                variant="primary"
                size="md"
                onClick={handleRejoinExistingRoom}
                text="Rejoin Existing Room"
                disabled={isLoading}
              />
              <button
                onClick={handleCancelExistingRoom}
                disabled={isLoading}
                className="px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Cancelling..." : "Cancel Existing Room"}
              </button>
              <Button
                variant="outline"
                size="md"
                onClick={handleCancelRejoin}
                text="Go Back"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
