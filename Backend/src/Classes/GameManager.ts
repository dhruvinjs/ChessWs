import {v4 as uuidv4} from "uuid"
import { redis } from "../redisClient"
import { WebSocket } from "ws"
import { ASSIGN_ID, DISCONNECTED, GAME_ACTIVE,  GAME_NOT_FOUND, GAME_OVER,  INIT_GAME, LEAVE_GAME, MATCH_NOT_FOUND, MOVE, NO_ACTIVE_GAMES, PLAYER_UNAVAILABLE, RECONNECT, REQUEST_VALID_MOVES, SERVER_ERROR, TIME_EXCEEDED, TIMER_UPDATE } from "../messages"
import { getGameState, makeMove, playerLeft, provideValidMoves, reconnectPlayer } from "../Services/GameServices"
import { insertPlayerInQueue, matchingPlayer } from "../Services/MatchMaking"
import { Chess } from "chess.js"
export class GameManager{
    private socketMap:Map<string,WebSocket>=new Map()
    private globalSetInterval:NodeJS.Timeout | null = null

    

     async addUser(socket: WebSocket, guestId: string) {
     this.socketMap.set(guestId, socket);
     this.addHandler(socket, guestId);

    const existingGameId = await redis.get(`user:${guestId}:game`);
    if (existingGameId) {
      
      // update socketMap for reconnection
      await reconnectPlayer(guestId, existingGameId, socket,this.socketMap);
      
      return;
    }

    // No previous game, so assign ID and queue for matchmaking
    
    socket.send(JSON.stringify({
      type: ASSIGN_ID,
      payload:{id: guestId}
    }));

  }

   async startTimer(){
    // if globalSetInterval is not null means it is already running 
    //if its running then return so that only one globalSetInterval is 
    //running all the time
    console.log("before return in globalSetInterval")
    if(this.globalSetInterval) return

    this.globalSetInterval=setInterval(async()=>{
        const activeGames=await redis.sMembers("active-games") 
        if(!activeGames || activeGames.length === 0){
            if(this.globalSetInterval){
                clearInterval(this.globalSetInterval)
                this.globalSetInterval=null
            }
            console.log("Timer not started becuase of no active-games")
            return
        }

        for(const gameId of activeGames ){
           const  game=await redis.hGetAll(`game:${gameId}`) as Record<string,string> 
            if(!game){
                await redis.sRem(`active-games`,gameId)
                continue
            }
            //removing all the completed games
            if (game.status === GAME_OVER || game.status === DISCONNECTED) {
                // only clear explicitly ended games
                await redis.sRem("active-games", gameId);
                continue
                }
        let blackTimer = Number(game.blackTimer)
        let whiteTimer = Number(game.whiteTimer)
        const fen=game.fen
        const turn = fen.split(" ")[1] 
        console.log(turn);

        if(turn === "w"){
          const newWhiteTimer= await redis.hIncrBy(`game:${gameId}`,"whiteTimer",-1)
            whiteTimer=Math.max(0,Number(newWhiteTimer))
        }else{
           const newBlackTimer= await redis.hIncrBy(`game:${gameId}`,"blackTimer",-1)
            blackTimer=Math.max(0, Number(newBlackTimer))
        }

        const user1Socket = this.socketMap.get(game.user1);
        const user2Socket = this.socketMap.get(game.user2);
        console.log(whiteTimer,blackTimer)

        const timerMessage={
            type:TIMER_UPDATE,
            payload:{
                whiteTimer:whiteTimer,
                blackTimer:blackTimer
            }
        }
        user1Socket?.send(JSON.stringify(timerMessage))
        user2Socket?.send(JSON.stringify(timerMessage))



            if (whiteTimer <= 0 || blackTimer <= 0) {
                const winner = whiteTimer <= 0 ? game.user2 : game.user1;
                await redis.hSet(`game:${gameId}`, { status: GAME_OVER, winner });
                await redis.sRem("active-games", gameId);

                const message = JSON.stringify({
                type: GAME_OVER,
                payload: { reason: TIME_EXCEEDED, winner }
                });

                user1Socket?.send(message);
                user2Socket?.send(message);
        }
      }
    },1000)//every 1 second 



  }



    private addHandler(socket:WebSocket,guestId:string){
       
       socket.on("message",async(message:string)=>{

           const jsonMessage=JSON.parse(message)
            const {type}=jsonMessage
            
            //New Game Block
            if (type === INIT_GAME) {
            await insertPlayerInQueue(guestId);
            const match = await matchingPlayer(guestId);

            if (!match) {
                socket.send(
                JSON.stringify({
                    type: MATCH_NOT_FOUND,
                    payload: {
                    message: "No opponent available right now",
                    },
                })
                );
                return;
            }

            const user1Id = match.waitingPlayerId;
            const user1socket = this.socketMap.get(user1Id);

            if (!user1socket) {
                socket.send(
                JSON.stringify({
                    type: PLAYER_UNAVAILABLE,
                    payload: {
                    message: "Player not found",
                    },
                })
                );
                return;
            }

            const newGameId = uuidv4();
            const chess = new Chess();

            // Save game state in Redis
            await redis
                .multi()
                .hSet(`game:${newGameId}`, {
                user1: user1Id,
                user2: guestId,
                status: GAME_ACTIVE,
                fen: chess.fen(),
                whiteTimer: 600,
                blackTimer: 600,
                })
                .setEx(`user:${user1Id}:game`, 1800, newGameId)
                .setEx(`user:${guestId}:game`, 1800, newGameId)
                .exec();

            // Precompute valid moves
            const moves = await provideValidMoves(newGameId);

            console.log("New game started:", newGameId);

            // Notify user1 (white)
            user1socket.send(
                JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "w",
                    gameId: newGameId,
                    fen: chess.fen(),
                    opponentId: guestId,
                    turn: chess.turn(),
                    whiteTimer: 600,
                    blackTimer: 600,
                    moves, // include valid moves if you want
                },
                })
            );

            // Notify user2 (black)
            const user2socket = this.socketMap.get(guestId);
            user2socket?.send(
                JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "b",
                    gameId: newGameId,
                    fen: chess.fen(),
                    opponentId: user1Id,
                    turn: chess.turn(),
                    whiteTimer: 600,
                    blackTimer: 600,
                    moves,
                },
                })
            );

            // Add to active games for global timer handling
            await redis.sAdd("active-games", newGameId);
            await redis.incr("guest:games:total");
            }


        



            if(type===MOVE){
                const {payload}=jsonMessage//from and to moves
                console.log("IN make move testing")
                console.log(guestId);
                const gameId=await redis.get(`user:${guestId}:game`)
                if(!gameId){

                    const message={
                        type:SERVER_ERROR,
                        payload:{
                            message:"internal server error cannot find game and cannot make move"
                        }
                    }
                    socket.send(JSON.stringify(message))
                    return
                }
                makeMove(socket,payload,gameId,guestId,this.socketMap)
                // provideValidMoves(gameId,socket)
               
            }

            if(type===LEAVE_GAME){
                const gameId=await redis.get(`user:${guestId}:game`)
                if(!gameId){
                    const message={
                        type:SERVER_ERROR,
                        payload:{
                            message:"internal server error cannot find game and cannot make move"
                        }
                    }
                    socket.send(JSON.stringify(message))
                    return
                }
                console.log("Player Left Block")
                playerLeft(guestId,gameId,socket,this.socketMap)

            }




            if(type===RECONNECT){
                const {id}=jsonMessage
                const gameId=await redis.get(`user:${id}:game`)
                if(!gameId){
                    socket.send(JSON.stringify({
                        type:GAME_NOT_FOUND,
                        payload:{
                            message:"Game Not found"
                        }
                    }))
                    return
                }
                    await reconnectPlayer(guestId, gameId, socket,this.socketMap);
                    return;

            }

            if(type===REQUEST_VALID_MOVES){
                const gameId=await redis.get(`user:${guestId}:game`)
                if(!gameId){
                    socket.send(JSON.stringify({
                        type:GAME_NOT_FOUND,
                        payload:{
                            message:"Game Not found"
                        }
                    }))
                    return
                }
                // provideValidMoves(gameId,socket)
                return
            }



       })   




    }






    async handleDisconnection(playerId:string){
        //this is the gameId:string which can be retrieved using the playerId 
        const gameId=await redis.get(`user:${playerId}:game`)
        if(!gameId){
            return GAME_NOT_FOUND
        }
        const existingGame=await getGameState(gameId)
        if(!existingGame) return GAME_NOT_FOUND
      
        // if playerId is user1 then connected user is user2 and message
        // will be sent to that user
        const connected_user= existingGame.user1 === playerId ? existingGame.user2 : existingGame.user1
        const user_socket=this.socketMap.get(connected_user)
        const message=JSON.stringify({
            type:DISCONNECTED,
            payload:{
                message:"Opponent Left due to bad connectivty"
            }
        })
        user_socket?.send(message)

        await redis.hSet(`game:${gameId}`,{
            status:DISCONNECTED,
            disconnectedBy:playerId,
            timestamp:Date.now().toString()
        })
    
        setTimeout(async ()=>{
            const latestStatus=await redis.hGet(`game:${gameId}`,"status")
            if(latestStatus !== DISCONNECTED) return;

            const winner=connected_user
            
            await redis.hSet(`game:${gameId}`,{
                status:GAME_OVER,
                winner:winner
            })
            const message=JSON.stringify({
                type:GAME_OVER,
                payload:{
                    winner:winner,
                    reason:DISCONNECTED
                }
            })
            user_socket?.send(message)
        },60*1000)
    }   



}

export const gameManager=new GameManager()