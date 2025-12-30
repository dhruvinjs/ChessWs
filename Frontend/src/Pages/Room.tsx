import { useState } from 'react';
import { Button } from '../Components';
import { motion } from 'framer-motion';
import { FloatingPieces } from '../Components/FloatingPieces';
import { roomApis } from '../api/api';
import axios from 'axios';
import { showMessage } from '../Components/ToastMessages';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/useGameStore';
import { SocketManager } from '../lib/socketManager';
import { useUserQuery } from '../hooks/useUserQuery';
import { ConfirmDialog } from '../Components/ConfirmDialog';

export function Room() {
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'join' | 'host'>('join');
  const [isLoading, setIsLoading] = useState(false);
  const [showExistingRoomDialog, setShowExistingRoomDialog] = useState(false);
  const [existingRoomId, setExistingRoomId] = useState<string | null>(null);
  const [showCancelRoomDialog, setShowCancelRoomDialog] = useState(false);

  const navigate = useNavigate();
  const setRoomInfo = useGameStore((state) => state.setRoomInfo);
  const { data: user } = useUserQuery();

  const handleJoinRoom = async () => {
    const trimmedRoomCode = roomCode.trim();
    if (!trimmedRoomCode) {
      showMessage('Validation Error', 'Please enter a room code', {
        type: 'error',
      });
      return;
    }
    if (trimmedRoomCode.length !== 8) {
      showMessage(
        'Validation Error',
        'Room code must be exactly 8 characters',
        { type: 'error' }
      );
      return;
    }
    setIsLoading(true);
    try {
      const response = await roomApis.joinRoom(trimmedRoomCode);
      if (response.success) {
        const roomInfo = response.room;
        setRoomInfo(roomInfo);
        if (user?.id) {
          const socketManager = SocketManager.getInstance();
          socketManager.init('room', user.id);
        }
        showMessage('Room Joined!', response.message, { type: 'success' });
        setRoomCode('');
        setTimeout(() => navigate(`/room/${trimmedRoomCode}`), 1000);
      } else {
        showMessage('Join Failed', response.message, { type: 'error' });
      }
    } catch (error: unknown) {
      let errorMessage = 'Failed to join room';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
        if (error.response?.status === 404) errorMessage = 'Room not found.';
        if (error.response?.status === 400)
          errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      showMessage('Error', errorMessage, { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHostRoom = async () => {
    setIsLoading(true);
    try {
      const response = await roomApis.createRoom();
      if (response.success) {
        const createdRoomId = response.roomId;
        const roomInfo = response.room;
        setRoomCode(createdRoomId);
        setRoomInfo(roomInfo);
        if (user?.id) {
          const socketManager = SocketManager.getInstance();
          socketManager.init('room', user.id);
        }
        showMessage(
          'Room Created!',
          `Room ${createdRoomId} created successfully!`,
          { type: 'success' }
        );
        setTimeout(() => navigate(`/room/${createdRoomId}`), 1500);
      } else {
        showMessage(
          'Creation Failed',
          response.message ?? 'Something went wrong',
          { type: 'error' }
        );
      }
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 400 &&
        error.response.data?.roomId
      ) {
        setExistingRoomId(error.response.data.roomId);
        setShowExistingRoomDialog(true);
      } else {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to create room'
          : 'Failed to create room';
        showMessage('Error', errorMessage, { type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejoinExistingRoom = () => {
    if (existingRoomId) {
      showMessage('Rejoining Room', `Redirecting to ${existingRoomId}`, {
        type: 'info',
      });
      setShowExistingRoomDialog(false);
      navigate(`/room/${existingRoomId}`);
    }
  };

  const handleCancelExistingRoom = async () => {
    if (!existingRoomId) return;
    setIsLoading(true);
    try {
      const response = await roomApis.cancelRoom(existingRoomId);
      if (response.success) {
        showMessage(
          'Room Cancelled',
          `Room ${existingRoomId} has been cancelled.`,
          { type: 'success' }
        );

        useGameStore.setState({
          roomId: '',
          isRoomCreator: false,
          opponentId: null,
          opponentName: null,
          roomGameId: null,
          roomStatus: null,
        });

        setShowExistingRoomDialog(false);
        setExistingRoomId(null);
        showMessage('Ready', 'You can now create a new room.', {
          type: 'info',
        });
      } else {
        showMessage('Error', response.message, { type: 'error' });
      }
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to cancel room'
        : 'Failed to cancel room';
      showMessage('Error', errorMessage, { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-black dark:via-gray-900 dark:to-amber-950 flex justify-center items-start pt-32 px-4 relative overflow-hidden">
      <FloatingPieces />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-amber-200/50 dark:border-amber-800/50 p-10 space-y-6">
          <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Chess Room
          </h1>

          <p className="text-center text-slate-700 dark:text-slate-300">
            Join an existing room or host a new game
          </p>

          <div className="flex gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Button
              size="sm"
              variant={mode === 'join' ? 'outline' : 'secondary'}
              text="Join Room"
              className="flex-1"
              onClick={() => setMode('join')}
            />
            <Button
              size="sm"
              variant={mode === 'host' ? 'outline' : 'secondary'}
              text="Host Room"
              className="flex-1"
              onClick={() => setMode('host')}
            />
          </div>

          <div className="space-y-5">
            {mode === 'join' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) =>
                      setRoomCode(
                        e.target.value
                          .replace(/[^a-zA-Z0-9_-]/g, '')
                          .slice(0, 8)
                      )
                    }
                    className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-center text-lg font-mono tracking-wider"
                    placeholder="Enter 8-character room code"
                  />
                </div>
                <Button
                  size="lg"
                  variant="primary"
                  text={isLoading ? 'Joining...' : 'Join Room'}
                  className="w-full"
                  onClick={handleJoinRoom}
                  disabled={isLoading}
                />

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm mb-3 text-slate-600 dark:text-slate-400">
                    Don't have a room code?
                  </p>
                  <Button
                    size="md"
                    variant="outline"
                    text="Create Your Own Room"
                    className="w-full"
                    onClick={() => setMode('host')}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Room Code
                  </label>
                  <div className="w-full p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl text-center text-lg font-mono tracking-wider text-amber-800 dark:text-amber-200">
                    {roomCode || 'Click to generate'}
                  </div>
                </div>

                <Button
                  size="lg"
                  variant="primary"
                  text={
                    isLoading
                      ? 'Loading...'
                      : roomCode
                      ? 'Join Your Room'
                      : 'Host New Room'
                  }
                  className="w-full"
                  onClick={
                    roomCode
                      ? () => navigate(`/room/${roomCode}`)
                      : handleHostRoom
                  }
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
                          showMessage('Copied', 'Room code copied!', {
                            type: 'success',
                          });
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
                      Share this code with your opponent.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* REJOIN EXISTING ROOM DIALOG */}
      <ConfirmDialog
        isOpen={showExistingRoomDialog}
        onClose={() => {
          setShowExistingRoomDialog(false);
          setShowCancelRoomDialog(true);
        }}
        onConfirm={handleRejoinExistingRoom}
        title="Active Room Found"
        message={`You already have an active room: ${existingRoomId}. Would you like to rejoin it or cancel it?`}
        confirmText="Rejoin Room"
        cancelText="Cancel Room"
      />

      <ConfirmDialog
        isOpen={showCancelRoomDialog}
        onClose={() => {
          setShowCancelRoomDialog(false);
          setExistingRoomId(null);
        }}
        onConfirm={() => {
          setShowCancelRoomDialog(false);
          handleCancelExistingRoom();
        }}
        title="Cancel Room?"
        message={`Do you really want to cancel room ${existingRoomId}? This action cannot be undone.`}
        confirmText="Yes, Cancel"
        cancelText="No, Go Back"
      />
    </div>
  );
}
