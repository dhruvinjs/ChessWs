
import { Chessboard } from 'react-chessboard'
import { Button, Navbar } from '../Components'
import { Square } from 'chess.js';
import { useSocket } from '../hooks/useSocket'
import { useState,useEffect } from 'react';
import { Chess } from 'chess.js';
import { User } from 'lucide-react';
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
    const [boardWidth,setBoardWidth]=useState(600)
    const [history,setHistory]=useState<string[]>([])
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [validMoves, setValidMoves] = useState<string[]>([]);
    const [playerId,setPlayerId]=useState<string | null>('playerId')
    const [oppId,setOppId]=useState<string | null>("opponentId")
    // const [players,setPlayers]=useState<Record <string, 'w' |'b'>>()
    function onSquareClick(square:string){
        if(selectedSquare && validMoves.includes(square)){
            handleMove(selectedSquare,square)
            setSelectedSquare(null)
            setValidMoves([])
        }
        else{
            const moves=chess.moves({square:square as Square,verbose:true})

            if(moves.length===0) {
                setValidMoves([])
                setSelectedSquare(null)
                return
            }
            setSelectedSquare(square)
            setValidMoves(moves.map(m=>m.to))
        }
    }


    const customSquareStyles = validMoves.reduce((acc, sq) => {
        acc[sq] = { backgroundColor: 'rgba(255, 215, 0, 0.5)' }; // gold highlight
        return acc;
      }, {} as Record<string, React.CSSProperties>);


    function handlePlay(){
        const newChessGame=new Chess()
        setChess(newChessGame)
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

    
    useEffect(() => {
        if(!socket) return 
        socket.onmessage=(event)=>{
            const jsonMessage=JSON.parse(event.data)
            
            if(jsonMessage.type===GameMessages.INIT_GAME){
                const {playerId,oppid,color}=jsonMessage
                console.log(jsonMessage.color)
                setPlayerColor(jsonMessage.color)    
                
                setPlayerId(playerId)
                setOppId(oppId)


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

    function onDrag(sourceSquare:string,targetSquare:string){
        handleMove(sourceSquare,targetSquare)
        return true
    }


   useEffect(() => {
    function updateWidth(){

        const currentWidth=window.innerWidth

        if(currentWidth < 640) setBoardWidth(currentWidth-60) //mobile
        else if(currentWidth < 1024) setBoardWidth(400) //laptop
        else setBoardWidth(600) //larger
    }

    updateWidth()
    window.addEventListener('resize',updateWidth)

    //Cleaning up of event
    return()=>window.removeEventListener('resize',updateWidth)
   }, []);


    if(!socket) return <div className='text-center text-amber-950 text-2xl'>Connecting...</div>
    return (
        <>
        <div>

    <Navbar/>
    <div className="text-2xl flex flex-col md:flex-row justify-center md:items-start  min-h-screen bg-[#EFEBE9] text-[#5D4037] gap-12 px-6 py-8">

    <div className="flex flex-col items-center justify-center">
       
    <div className="mt-4  lg:mt-0 rounded-md p-4">
        <div className='mb-2 flex flex-row space-x-2'>
        <User className='size-5 md:size-8'/><span className='font-semibold text-sm md:text-base md:text-center text-[#6D4C41]'>{oppId }</span>
        </div>
        <Chessboard
         boardWidth={boardWidth}
         position={chess.fen()} 
         onPieceDrop={(sourceSquare,targetSquare)=>onDrag(sourceSquare,targetSquare)}
         onSquareClick={onSquareClick}
         customSquareStyles={customSquareStyles}
         boardOrientation={playerColor==='w' ? 'white' :'black'}
          />
          <div className='mt-3 flex flex-row space-x-2'>
        <User className='size-5 md:size-8' /><span className='font-semibold md:text-base md:text-center text-sm text-[#6D4C41]'>{playerId }</span>
        </div>
        
      </div>
        <div className='mt-4'>
            <Button
            text='♘ Play'
            variant='primary'
            onClick={()=>handlePlay()}
            size='md'
            />
        </div>

    </div>

    <div className="flex flex-col lg:flex-row border border-[#D7CCC8] lg:items-start items-center bg-[#F5F5F5]  gap-4">
        <div className='w-full max-w-xs'>
            <div className="inline-table w-80 max-w-xs rounded-lg text-center">
            <h2 className="font-semibold">
                Move History
            </h2>
            <div className="space-y-4">
            {history.map((move,index)=>{
                const moveColor=index % 2===0 ? 'w' : 'b'
                return(
                <div key={index} className="text-start mt-3 pl-8 font-semibold text-[#6D4C41] gap-2">
           <span> {index + 1}. {moveColor==='w' ? 'white' :'black'} {move}</span>
                </div>
            )
        })}
            </div>
            </div>
            
         </div>
    </div>
  
    </div>

    </div>
       </> 

    )
}

