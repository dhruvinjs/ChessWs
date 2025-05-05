
import { Chessboard } from 'react-chessboard'
import { Button } from '../Components'
import { useSocket } from '../hooks/useSocket'
import { useState,useEffect } from 'react';
import { Chess } from 'chess.js';
interface GameProps {}

enum GameMessages{
    INIT_GAME = "init_game",
    MOVE = "move",
    GAME_OVER = "game_over"
}
  

export function Game(props: GameProps) {
  
    const socket=useSocket()
    const [playerColor,setPlayerColor]=useState<'w' | "b">('w')
    const [chess,setChess]=useState(new Chess())
    // const [board,setBoard]=useState(chess.fen())
    const [history,setHistory]=useState<string[]>([])



    function handlePlay(){
        const newChessGame=new Chess()
        setChess(newChessGame)
        // setBoard(newChessGame.fen())
        socket?.send(JSON.stringify({
            type:GameMessages.INIT_GAME
        }))
        console.log('new game initiated');
    }

    function handleMove(from:string,to:string){
        if(chess.turn()!==playerColor){
            console.log("Not your turn yet!");
            return;
        }
        const move=chess.move({
            from:from,
            to:to,
            promotion:'q'
        })
        if(move){
            setHistory(chess.history());
            socket?.send(JSON.stringify({
                type:GameMessages.MOVE,
                payload:{
                from:move.from,
                to:move.to
            }
            }))
        }
        else console.log("invalid move")
    }

    function onDrop(from:string,to:string){
        console.log(from,to)
        handleMove(from,to)
        return true
    }
    
    useEffect(() => {
        if(!socket) return 
        socket.onmessage=(event)=>{
            const jsonMessage=JSON.parse(event.data)
            
            if(jsonMessage.type===GameMessages.INIT_GAME){
                console.log(jsonMessage.color)
                setPlayerColor(jsonMessage.color)
                alert("Your Color is "+jsonMessage.color)
            }

            if(jsonMessage.type===GameMessages.MOVE){
                const {to,from}=jsonMessage.payload
                
                chess.move({from:from,to:to,promotion:'q'})
                setHistory(chess.history());
                // setBoard(chess.fen())
            }
            
            if (jsonMessage.type === GameMessages.GAME_OVER) {
                alert(`Game Over! Winner: ${jsonMessage.payload.winner}`);
            }
        }
    }, [socket,chess]);
    
    // Todo show history of moves
    // .history([ options ])
    if(!socket) return <div className='text-center text-amber-950 text-2xl'>Connecting...</div>
    return (
        <>
   <div className="text-2xl min-h-screen flex justify-center items-center bg-[#EFEBE9] text-[#5D4037] p-4">
    <div className="flex flex-col items-center justify-center">
        
      <div className=" rounded-md p-4">
        <Chessboard
         id="BasicBoard"
         boardWidth={600}
         position={chess.fen()} 
         onPieceDrop={(sourceSquare,targetSquare)=>onDrop(sourceSquare,targetSquare)}
          />
      </div>
        <div >
            <Button
            text='♘ Play'
            variant='primary'
            onClick={()=>handlePlay()}
            size='md'
            />
        </div>

    </div>
    <div className="flex flex-row">
        <div className="shadow-md rounded-lg p-4 m-4 w-60">
        <h2 className="text-lg font-semibold text-center mb-2 text-[#5D4037]">Move History</h2>
        <div className="space-y-2">
            {history.map((row,index)=>
                  <div key={index} className="flex space-x-2 text-xl font-semibold text-[#6D4C41]">
                  <span>#{index + 1}</span>
                  <span>{row}</span>
                </div>
            )}
        </div>
        </div>
    </div>
    </div>

       </> 

    )
}

