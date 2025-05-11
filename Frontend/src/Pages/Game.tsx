import { Chessboard } from 'react-chessboard';
import { Button, Navbar } from '../Components';
import { Square } from 'chess.js';
import { useSocket } from '../hooks/useSocket';
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { User } from 'lucide-react';

enum GameMessages {
  INIT_GAME = "init_game",
  MOVE = "move",
  GAME_OVER = "game_over"
}

export function Game() {
  const socket = useSocket();
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [chess, setChess] = useState(new Chess());
  const [boardWidth, setBoardWidth] = useState(600);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [oppId, setOppId] = useState<string | null>(null);

  const handleMove = (from: string, to: string) => {
    if (chess.turn() !== playerColor) {
      console.log("Not your turn yet!");
      return;
    }

    const move = chess.move({ from, to, promotion: 'q' });
    if (move) {
      setHistory(chess.history());
      socket?.send(JSON.stringify({
        type: GameMessages.MOVE,
        payload: { from: move.from, to: move.to }
      }));
    }
  };

  const handlePlay = () => {
    setChess(new Chess());
    socket?.send(JSON.stringify({ type: GameMessages.INIT_GAME }));
  };

  const onSquareClick = (square: string) => {
    if (selectedSquare && validMoves.includes(square)) {
      handleMove(selectedSquare, square);
      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      const moves = chess.moves({ square: square as Square, verbose: true });
      setSelectedSquare(moves.length ? square : null);
      setValidMoves(moves.map(m => m.to));
    }
  };

  const customSquareStyles = validMoves.reduce((acc, sq) => {
    acc[sq] = { backgroundColor: 'rgba(255, 215, 0, 0.5)' };
    return acc;
  }, {} as Record<string, React.CSSProperties>);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'ASSIGN_ID') {
        fetch(`http://localhost:3000/api/v1/game/${msg.id}/cookie`, {
          method: "POST",
          credentials: "include"
        });
      }

      if (msg.type === GameMessages.INIT_GAME) {
        const { playerId, oppId, color } = msg;
        setPlayerId(playerId);
        setOppId(oppId);
        setPlayerColor(color);
        alert("Your Color is " + color);
      }

      if (msg.type === GameMessages.MOVE) {
        const { from, to } = msg.payload;
        chess.move({ from, to, promotion: 'q' });
        setHistory(chess.history());
      }

      if (msg.type === GameMessages.GAME_OVER) {
        alert(`Game Over! Winner: ${msg.payload.winner}`);
      }
    };
  }, [socket, chess]);

    useEffect(() => {
    function updateWidth(){
        console.log('updateWidht')
        const currentWidth=window.innerWidth

        if(currentWidth < 640) setBoardWidth(currentWidth-60) //mobile
        else if(currentWidth > 1024) setBoardWidth(400) //laptop
        else setBoardWidth(600) //larger
    }

    updateWidth()
    window.addEventListener('resize',updateWidth)

    //Cleaning up of event
    return()=>window.removeEventListener('resize',updateWidth)
   }, []);

  if (!socket) return <div className='text-center text-amber-950 text-2xl'>Connecting...</div>;

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
            <Chessboard
              boardWidth={boardWidth}
              position={chess.fen()}
              onPieceDrop={(source, target) => {
                handleMove(source, target);
                return true;
              }}
              onSquareClick={onSquareClick}
              customSquareStyles={customSquareStyles}
              boardOrientation={playerColor === 'w' ? 'white' : 'black'}
            />
            <div className='mt-3 flex flex-row space-x-2'>
              <User className='size-5 md:size-8' />
              <span className='font-semibold md:text-base text-sm text-[#6D4C41]'>{playerId}</span>
            </div>
          </div>
          <div className='mt-4'>
            <Button text='♘ Play' variant='primary' onClick={handlePlay} size='md' />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row border border-[#D7CCC8] lg:items-start items-center bg-[#F5F5F5] gap-4">
          <div className='w-full max-w-xs'>
            <div className="inline-table w-80 rounded-lg text-center">
              <h2 className="font-semibold">Move History</h2>
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
