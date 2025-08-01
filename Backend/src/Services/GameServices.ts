import { WebSocket } from 'ws';
import { CHECK, GAME_ACTIVE, GAME_FOUND, GAME_NOT_FOUND, GAME_OVER, GAME_STARTED, INIT_GAME, MOVE, OPP_RECONNECTED, STALEMATE, TIME_EXECEEDED, WRONG_PLAYER_MOVE } from '../messages';
import {redis} from '../redisClient'
import { Chess } from 'chess.js';

//This Method Will Help To return the gameState to reconnected player
export async function getGameState(gameId:string){
    
    const existingGame=await redis.hGetAll(`game:${gameId}`) as Record<string,string>
    if(Object.keys(existingGame).length === 0) return null;
    //fen basically bring the board to current state because fen returns
    // current state of board
    //
    const board=new Chess(existingGame.fen) 
    
     return {
    user1: existingGame.user1,
    user2: existingGame.user2,
    board,
    status:existingGame.status,
    fen:existingGame.fen,
    turn:board.turn()
  };
}

export async function makeMove(
    socket: WebSocket,
    move: { from: string; to: string; promotion?: string },
    gameId: string,
    playerId: string,
    socketMap:Map<string,WebSocket>,
    timeOfMove:number
){
        const gameState=await getGameState(gameId)

        if(!gameState){
            socket.send(JSON.stringify({
                type:GAME_NOT_FOUND,
                message:"Game Not Found"
            }))
            return;
        }

        const isWhiteTurn=gameState.turn === "w"
        if((isWhiteTurn && gameState.user1 !== playerId) || (!isWhiteTurn && gameState?.user2 !==playerId )){
            console.log("Wrong player move")
            const message=JSON.stringify({
                type:WRONG_PLAYER_MOVE,
                message:"Not your turn"
            })
            socket.send(message)
           
            return null
        }
        const lastMoveTime = await redis.hGet(`game:${gameId}:move-time`,"timeOfMove")
        //if its the first move then lastMoveTime should be 0
        
        const finalLastMovetime=Number(lastMoveTime) || 0
       
        const {exceeded , remainingTime} = calculateTime(Number(finalLastMovetime))
        console.log(`remaining time:${remainingTime}`)
       
        const  user1Socket = socketMap.get(gameState.user1)
        const user2Socket = socketMap.get(gameState.user2)
        if (!user1Socket || !user2Socket) {
            console.log("One or both players disconnected")
            return
        }
      
        if (finalLastMovetime !== 0 && exceeded){
            // socket.send(JSON.stringify(message))
            const turn=gameState.board.turn()
            const flippedFen = flipTurn(gameState.board.fen(),turn)
            
            await redis.hSet(`game:${gameId}`,{
                fen:flippedFen,
                status:"Active"
            })
            const timeoutMessage={
                type:TIME_EXECEEDED,
                payload:{
                    reason:"Player execeeded the time limit",
                    currentTurn:turn === "w" ? "b" : "w" 
                }
            }
            user1Socket.send(JSON.stringify(timeoutMessage))
            user2Socket.send(JSON.stringify(timeoutMessage))
            await redis.hSet(`game:${gameId}:move-time`,{
                timeOfMove:Date.now(),
                currentPlayerId:playerId
            })
             gameState.board.load(flippedFen)


            return
        }
    
        

        const board=gameState.board

        
        //Setting the moves in redis 
        try {
            board.move({
                    from:move.from,
                    to:move.to,
                    promotion:move.promotion || "q"
            })

            //0(1) for appending
            //0(n) for retreiving the moves if needed
            await redis.rPush(`game:${gameId}:moves`,JSON.stringify(move))
            // const movesArr=gameState.moves
            await redis.hSet(`game:${gameId}`,"fen",gameState.board.fen())
            await redis.hSet(`game:${gameId}:move-time`,{
                timeOfMove:timeOfMove,
                currentPlayerId:playerId
            })
            
        } catch (error) {
            console.log(error)
            return;
        }


      

        if(board.isCheck()){
            const message=JSON.stringify({
                type:CHECK,
                payload:move
            })
            user1Socket.send(message)
            user2Socket.send(message)
            return
        }

        if(board.isStalemate()){
            const message=JSON.stringify({
                type:STALEMATE,
                payload:{
                    reason:"Game over,its a draw"
                }
            })

            user1Socket.send(message)
            user2Socket.send(message)

            const status={
                status:"Completed",
                winner:"draw (stalemate)"
            }
            await redis.hSet(`game:${gameId}`,status)
            await redis.expire(`game:${gameId}`, 600);

            return;
        }

        //Game Over logic
        if(board.isGameOver()){
        //w:white b:black if next turn is white black was winner
        const winner=board.turn() ==="w" ?"black" :"white"
        //Send the message to both users that game is over
        const message = JSON.stringify({
        type: GAME_OVER,
        payload: {
        winner: winner
        }
        });
        const status={
            status:"Completed",
            winner:winner
        }
        await redis.hSet(`game:${gameId}`,status)
        await redis.expire(`game:${gameId}`, 600); // 10 minutes

        user1Socket.send(message)
        user2Socket.send(message)

          return
        }

           //socket which assigned to opp is current socket that sends message
         const opponent = playerId === gameState.user1 ? user2Socket : user1Socket
           opponent.send(JSON.stringify({
           type:"move",
           payload:move
           }))
}


export async function reconnectPlayer(playerId:string,gameId:string,socket:WebSocket,socketMap:Map<string,WebSocket>){
    
    const game=await getGameState(gameId)

    console.log("reconnection player")
    if (!game) {
        console.log("Game Not found")
        return
    }
    const color = playerId===game.user1 ? 'w' : 'b';
    const opponentId = playerId === game.user1 ? game.user2 : game.user1;

    console.log("sending the current moves to ",playerId)
    socket.send(JSON.stringify({
        type:GAME_FOUND,
        payload:{
            fen:game.board.fen(),
            color:color,
            turn:game.board.turn(),
            opponentId   
        }
    }))
    const status={
        status:GAME_ACTIVE,
    }
    await redis.hSet(`game:${gameId}`,status)
    const opponentSocket = socketMap.get(opponentId);
console.log("Sending reconnect notice to:", opponentId, socketMap.has(opponentId));

    opponentSocket?.send(JSON.stringify({
    type: OPP_RECONNECTED,
    message: "Opponent reconnected"
    }));

}

export async function getGamesCount(){
    const count=await redis.get("guest:games:total")
    console.log(count)
    return count ? parseInt(count) : 0
}

export async function playerLeft(){
}

export function calculateTime(lastMoveTime:number){
    const currentTime=Date.now()
    const elapsed = currentTime - lastMoveTime

    // const ten_min=10 * 60 *1000
    // 10 min , 60 sec , 1000 miliseconds
    const thirty_sec_check = 30 * 1000
    const remainingTime = Math.max(0,thirty_sec_check - elapsed)
    const exceeded = elapsed > thirty_sec_check

    return{
        exceeded,
        remainingTime
    }
}
export function flipTurn(fen:string,turn:string ){
    const oppTurn = turn === "w" ? 'b' : "w"
    const part=fen.split(" ")
    part[1]=turn === "w" ? "b" :"w"
    // const emptyMove={
    //     from : "",
    //     to:"",
    // }
    const newFen=part.join(" ")
    console.log(newFen)
    return newFen
}
