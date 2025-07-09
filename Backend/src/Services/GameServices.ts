import { WebSocket } from 'ws';
import { CHECK, GAME_ACTIVE, GAME_FOUND, GAME_NOT_FOUND, GAME_OVER, GAME_STARTED, INIT_GAME, MOVE, OPP_RECONNECTED, STALEMATE, WRONG_PLAYER_MOVE } from '../messages';
import {redis} from '../redisClient'
import { Chess } from 'chess.js';

//This Method Will Help To return the gameState to reconnected player
export async function getGameState(gameId:string){
    const existingGame=await redis.hGetAll(`game:${gameId}`)
    console.log(gameId);
    if(!existingGame) return null;
    // if (existingGame.status !==GAME_STARTED) return null
console.log("Game status is:", existingGame.status)

    const rawMoves=await redis.hGet(`game:${gameId}`,"moves")
    const moves=rawMoves ? JSON.parse(rawMoves) : []
    const board=new Chess()
     moves.forEach((m:any)=>board.move(m))
    const user1=String(existingGame.user1)
    const user2=String (existingGame.user2)
    const status=existingGame.status
     return {
    user1: user1,
    user2: user2,
    board,
    moves,
    status
  };
}

export async function makeMove(
    socket: WebSocket,
    move: { from: string; to: string; promotion?: string },
    gameId: string,
    playerId: string,
    socketMap:Map<string,WebSocket>
){
        const gameState=await getGameState(gameId)
        if(!gameState){
            socket.send(JSON.stringify({
                type:GAME_NOT_FOUND,
                message:"Game Not Found"
            }))
            return;
        }

        const isWhiteTurn=gameState?.board.turn() === "w"
        if((isWhiteTurn && gameState.user1 !== playerId) || (!isWhiteTurn && gameState?.user2 !==playerId )){
            console.log("Wrong player move")
            const message=JSON.stringify({
                type:WRONG_PLAYER_MOVE,
                message:"Not your turn"
            })
            socket.send(message)
           
            return null
        }
        const board=gameState.board
        //Setting the moves in redis 
        try {
            board.move({
                    from:move.from,
                    to:move.to,
                    promotion:move.promotion || "q"
            })
            const movesArr=gameState.moves
            movesArr.push(move)
            await redis.hSet(`game:${gameId}`,'moves',JSON.stringify(movesArr))
            
        } catch (error) {
            console.log(error)
            return;
        }

        const user1Socket = socketMap.get(gameState.user1)
        const user2Socket = socketMap.get(gameState.user2)




        if (!user1Socket || !user2Socket) {
            console.log("One or both players disconnected")
            return
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
            moves:game.moves,
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