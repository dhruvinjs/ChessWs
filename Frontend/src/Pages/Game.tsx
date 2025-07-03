  import { useState, useEffect, useRef } from 'react';
  import { Chessboard } from 'react-chessboard';
  import { Square, Chess } from 'chess.js';
  import { useSocket } from '../hooks/useSocket';
  import { Button, Navbar } from '../Components';
  import { Loader2, User } from 'lucide-react';

  enum GameMessages {
    INIT_GAME = "init_game",
    MOVE = "move",
    GAME_OVER = "game_over",
    GAME_STARTED = "game_started",
    GAME_ENDED = "game_ended",
    DISCONNECTED = "player_left",
    CHECK = "check_move",
    WRONG_PLAYER_MOVE = "wrong_player_move",
    STALEMATE = "game_drawn",
    OPP_RECONNECTED = "opp_reconnected",
    GAME_FOUND = "existing_game_found",
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
    const handleMove = (from: string, to: string) => {
      if (chessRef.current.turn() !== playerColor) {
        alert("Not your turn!");
        return false;
      }

      const move = chessRef.current.move({ from, to, promotion: 'q' });
      if (move) {
        setFen(chessRef.current.fen());
        setHistory(chessRef.current.history());
        socket?.send(JSON.stringify({
          type: GameMessages.MOVE,
          payload: { from: move.from, to: move.to }
        }));
        return true;
      }
      return false;
    };

    const handlePlay = () => {
      chessRef.current = new Chess();
      setFen(chessRef.current.fen());
      setHistory([]);
      setSelectedSquare(null);
      setValidMoves([]);
      socket?.send(JSON.stringify({ type: GameMessages.INIT_GAME }));
    };

    const onSquareClick = (square: string) => {
      const moves = chessRef.current.moves({ square: square as Square, verbose: true });
      if (selectedSquare && validMoves.includes(square)) {
        handleMove(selectedSquare, square);
        setSelectedSquare(null);
        setValidMoves([]);
      } else if (moves.length) {
        setSelectedSquare(square);
        setValidMoves(moves.map(m => m.to));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    };

    const customSquareStyles = validMoves.reduce((acc, sq) => {
      acc[sq] = { backgroundColor: 'rgba(255, 215, 0, 0.5)' };
      return acc;
    }, {} as Record<string, React.CSSProperties>);

    useEffect(() => {
      if (!socket) return;
       setLoading(false);
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log(msg.payload)
        if (msg.type === GameMessages.INIT_GAME) {
          const { playerId, oppId, color } = msg;
          setPlayerId(playerId);
          setOppId(oppId);
          setPlayerColor(color);
          alert("🎯 Your color is " + color.toUpperCase());

        } else if (msg.type === GameMessages.GAME_FOUND) {
          const { opponentId, color, fen, moves, turn } = msg.payload;
          console.log(msg.payload)
          console.log("Lawda pakad")
          setPlayerColor(color);
          setOppId(opponentId);
          console.log(fen,moves)
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

        } else if (msg.type === GameMessages.MOVE) {
          const { from, to } = msg.payload;
          chessRef.current.move({ from, to, promotion: 'q' });
          setFen(chessRef.current.fen());
          setHistory(chessRef.current.history());

        } else if (msg.type === GameMessages.GAME_OVER) {
          alert(`🏁 Game Over! Winner: ${msg.payload.winner}`);

        } else if (msg.type === GameMessages.STALEMATE) {
          alert(`🤝 Game Drawn!`);

        } else if (msg.type === GameMessages.WRONG_PLAYER_MOVE) {
          alert(`⛔ Not your move.`);

        } else if (msg.type === GameMessages.OPP_RECONNECTED) {
          alert(`🔁 ${msg.message}`);

        } else if (msg.type === GameMessages.CHECK) {
          alert(`🚨 You are in CHECK!`);

        } else if (msg.type === GameMessages.DISCONNECTED) {
          alert(`😓 Opponent left: ${msg.payload.message}`);

        } else {
          console.log("Unhandled message:", msg.message);
        }
      };

    return () => {
      socket.onmessage = null;
    };
      
    }, [socket]);

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
            <div className="mt-4 lg:mt-0 rounded-md p-4">
              <div className='mb-2 flex flex-row space-x-2'>
                <User className='size-5 md:size-8' />
                <span className='font-semibold text-sm md:text-base text-[#6D4C41]'>{oppId}</span>
              </div>
            {fen && 


              <Chessboard
                boardWidth={boardWidth}
                position={fen}
                key={fen}
                onPieceDrop={(source, target) => handleMove(source, target)}
                onSquareClick={onSquareClick}
                customSquareStyles={customSquareStyles}
                boardOrientation={playerColor === 'w' ? 'white' : 'black'}
              />
            }
              <div className='mt-3 flex flex-row space-x-2'>
                <User className='size-5 md:size-8' />
                <span className='font-semibold md:text-base text-sm text-[#6D4C41]'>{playerId}</span>
              </div>
            </div>
            <div className='mt-4'>
              <Button text='♘ Start Game' variant='primary' onClick={handlePlay} size='md' />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row border border-[#D7CCC8] lg:items-start items-center bg-[#F5F5F5] gap-4">
            <div className='w-full max-w-xs'>
              <div className="inline-table w-80 rounded-lg text-center">
                <h2 className="font-semibold">📜 Move History</h2>
                <div className="space-y-4">
                  {history.map((move, index) => (
                    <div key={index} className="text-start mt-3 pl-8 font-semibold text-[#6D4C41]">
                      <span>{index + 1}. {(index % 2 === 0 ? 'White' : 'Black')} {move}</span>
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
