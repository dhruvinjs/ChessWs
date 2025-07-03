import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square, Chess } from 'chess.js';
import { useSocket } from '../hooks/useSocket';
import { Button, Navbar } from '../Components';
import { Loader2 } from 'lucide-react';
import { OpponentCard } from '../Components/OpponentComponent';
import { PlayerCard } from '../Components/PlayerCard';
import confetti from "canvas-confetti"

const triggerConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  });
};


const MemoizedChessboard = React.memo(Chessboard);

const StartButton = React.memo(({ onClick }: { onClick: () => void }) => (
  <div className="mt-4">
    <Button text="♘ Start Game" variant="primary" onClick={onClick} size="md" />
  </div>
));

enum GameMessages {
  INIT_GAME = 'init_game',
  MOVE = 'move',
  GAME_OVER = 'game_over',
  GAME_STARTED = 'game_started',
  GAME_ENDED = 'game_ended',
  DISCONNECTED = 'player_left',
  CHECK = 'check_move',
  WRONG_PLAYER_MOVE = 'wrong_player_move',
  STALEMATE = 'game_drawn',
  OPP_RECONNECTED = 'opp_reconnected',
  GAME_FOUND = 'existing_game_found',
}

export function Game() {
  const socket = useSocket();
  const chessRef = useRef(new Chess());

  const [fen, setFen] = useState(chessRef.current.fen());
  const [boardWidth, setBoardWidth] = useState(600);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [history, setHistory] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [oppId, setOppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const handleMove = useCallback(
    (from: string, to: string) => {
      if (chessRef.current.turn() !== playerColor) {
        alert('Not your turn!');
        return false;
      }

      const move = chessRef.current.move({ from, to, promotion: 'q' });
      if (move) {
        setFen(chessRef.current.fen());
        setHistory(chessRef.current.history());
        socket?.send(
          JSON.stringify({
            type: GameMessages.MOVE,
            payload: { from: move.from, to: move.to },
          })
        );
        return true;
      }
      return false;
    },
    [playerColor, socket]
  );

  const handlePlay = useCallback(() => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setHistory([]);
    setSelectedSquare(null);
    setValidMoves([]);
    socket?.send(JSON.stringify({ type: GameMessages.INIT_GAME }));
  }, [socket]);

  const onSquareClick = useCallback(
    (square: string) => {
      const moves = chessRef.current.moves({ square: square as Square, verbose: true });
      if (selectedSquare && validMoves.includes(square)) {
        handleMove(selectedSquare, square);
        setSelectedSquare(null);
        setValidMoves([]);
      } else if (moves.length) {
        setSelectedSquare(square);
        setValidMoves(moves.map((m) => m.to));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    },
    [selectedSquare, validMoves, handleMove]
  );

  const customSquareStyles = useMemo(() => {
    return validMoves.reduce((acc, sq) => {
      acc[sq] = { backgroundColor: 'rgba(255, 215, 0, 0.5)' };
      return acc;
    }, {} as Record<string, React.CSSProperties>);
  }, [validMoves]);

  useEffect(() => {
    if (!socket) return;
    setLoading(false);

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log(msg);

      if (msg.type === GameMessages.INIT_GAME) {
        const { playerId, oppId, color } = msg;
        setPlayerId(playerId);
        setOppId(oppId);
        setPlayerColor(color);
        alert('🎯 Your color is ' + color.toUpperCase());
      }

      else if (msg.type === GameMessages.GAME_FOUND) {
        const { opponentId, color, fen, moves, turn } = msg.payload;
        setPlayerColor(color);
        setOppId(opponentId);

        const existingChess = new Chess();
        existingChess.load(fen);
        chessRef.current = existingChess;
        setFen(fen);

        if (moves) {
          const formattedMoves = moves.map(
            (m: { from: string; to: string }) => `${m.from}-${m.to}`
          );
          setHistory(formattedMoves);
        }

        alert(`♻️ Reconnected!\nColor: ${color.toUpperCase()} | Turn: ${turn}`);
      }

      else if (msg.type === GameMessages.MOVE) {
        const { from, to } = msg.payload;
        chessRef.current.move({ from, to, promotion: 'q' });
        const newFen = chessRef.current.fen();
        if (fen !== newFen) setFen(newFen);
        setHistory(chessRef.current.history());
      }

      else if (msg.type === GameMessages.GAME_OVER) {
        setShowWinAnimation(true);
        setWinner(msg.payload.winner);
        alert(`🏁 Game Over! Winner: ${msg.payload.winner}`);
      }

      else if (msg.type === GameMessages.STALEMATE) {
        alert(`🤝 Game Drawn!`);
      }

      else if (msg.type === GameMessages.WRONG_PLAYER_MOVE) {
        alert(`⛔ Not your move.`);
      }

      else if (msg.type === GameMessages.OPP_RECONNECTED) {
        alert(`🔁 ${msg.message}`);
      }

      else if (msg.type === GameMessages.CHECK) {
        alert(`🚨 You are in CHECK!`);
      }

      else if (msg.type === GameMessages.DISCONNECTED) {
        alert(`😓 Opponent left: ${msg.payload.message}`);
      }

      else {
        console.log('Unhandled message:', msg.message);
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, [socket, fen]);

  useEffect(() => {
    const updateWidth = () => {
      const w = window.innerWidth;
      if (w < 640) setBoardWidth(w - 60);
      else if (w > 1024) setBoardWidth(400);
      else setBoardWidth(600);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
  if (showWinAnimation && winner) {
    triggerConfetti();
  }
}, [showWinAnimation, winner]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen flex-col text-amber-950 text-2xl">
        <Loader2 className="animate-spin mb-4 size-8" />
        Connecting to game server...
      </div>
    );
  }

  
  return (
    <div>
      <Navbar />
      <div className="text-2xl flex flex-col md:flex-row justify-center md:items-start min-h-screen bg-[#EFEBE9] text-[#5D4037] gap-12 px-6 py-8">
        <div className="flex flex-col items-center justify-center">
          <OpponentCard oppId={oppId} />

          <div className="mt-4 lg:mt-0 rounded-md p-4 bg-white shadow-md border border-[#D7CCC8]">
            {fen && (
              <MemoizedChessboard
                boardWidth={boardWidth}
                position={fen}
                onPieceDrop={handleMove}
                onSquareClick={onSquareClick}
                customSquareStyles={customSquareStyles}
                boardOrientation={playerColor === 'w' ? 'white' : 'black'}
              />
            )}
          </div>

          <PlayerCard playerId={playerId} />
          <StartButton onClick={handlePlay} />
        </div>

       

        <div className="flex flex-col lg:flex-row border border-[#D7CCC8] lg:items-start items-center bg-[#F5F5F5] gap-4">
          <div className="w-full max-w-xs">
            <div className="inline-table w-80 rounded-lg text-center">
              <h2 className="font-semibold">📜 Move History</h2>
              <div className="space-y-4">
                {history.map((move, index) => (
                  <div
                    key={index}
                    className="text-start mt-3 pl-8 font-semibold text-[#6D4C41]"
                  >
                    <span>
                      {index + 1}. {index % 2 === 0 ? 'White' : 'Black'} {move}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
