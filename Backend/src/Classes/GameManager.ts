import {v4 as uuidv4} from "uuid"
import { redis } from "../redisClient"
import { WebSocket } from "ws"
import { ACCEPT_DRAW, ASSIGN_ID, DISCONNECTED, GAME_ACTIVE,  GAME_NOT_FOUND, GAME_OVER,  INIT_GAME, LEAVE_GAME, MATCH_NOT_FOUND, MOVE, NO_ACTIVE_GAMES, OFFER_DRAW, PLAYER_UNAVAILABLE, RECONNECT, REJECT_DRAW, REQUEST_VALID_MOVES, SERVER_ERROR, TIME_EXCEEDED, TIMER_UPDATE } from "../messages"
import { acceptDraw,  getGameState, makeMove, offerDraw, playerLeft, provideValidMoves, reconnectPlayer, rejectDraw } from "../Services/GameServices"
import { insertPlayerInQueue, matchingPlayer } from "../Services/MatchMaking"
import { Chess } from "chess.js"
export class GameManager{
    private socketMap:Map<string,WebSocket>=new Map()
    private globalSetInterval:NodeJS.Timeout | null = null

    

     async addUser(socket: WebSocket, id: string) {
     this.socketMap.set(id, socket);
     this.addHandler(socket, id);

    const existingGameId = await redis.get(`user:${id}:game`);
    if (existingGameId) {
      
      // update socketMap for reconnection
      await reconnectPlayer(id, existingGameId, socket,this.socketMap);
      
      return;
    }

    // No previous game, so assign ID and queue for matchmaking
    
    socket.send(JSON.stringify({
      type: ASSIGN_ID,
      payload:{id: id}
    }));

  }

   async startTimer(){
    // if globalSetInterval is not null means it is already running 
    //if its running then return so that only one globalSetInterval is 
     if (this.globalSetInterval) {
    console.log("Timer already running");
    return;
  }

  console.log("⏰ Starting global timer");

    
    //running all the time
    this.globalSetInterval = setInterval(async () => {
    try {
      // Get all active games
      const activeGames = await redis.sMembers("active-games");

      // If no games, stop the timer
      if (!activeGames || activeGames.length === 0) {
        console.log("No active games, stopping timer");
        if (this.globalSetInterval) {
          clearInterval(this.globalSetInterval);
          this.globalSetInterval = null;
        }
        return;
      }

      // Process each game
      for (const gameId of activeGames) {
        const game = await redis.hGetAll(`game:${gameId}`) as Record<string,string>;

        // Skip if game not found
        if (!game || Object.keys(game).length === 0) {
          await redis.sRem("active-games", gameId);
          continue;
        }

        // Skip if game already over
        if (game.status === GAME_OVER || game.status === DISCONNECTED) {
          await redis.sRem("active-games", gameId);
          continue;
        }

        // Get current timers and turn
        let blackTimer = Number(game.blackTimer);
        let whiteTimer = Number(game.whiteTimer);
        const fen = game.fen;
        const turn = fen.split(" ")[1]; // 'w' or 'b'

        // Decrement the timer for current player
        if (turn === "w") {
          const newWhiteTimer = await redis.hIncrBy(`game:${gameId}`, "whiteTimer", -1);
          whiteTimer = Math.max(0, Number(newWhiteTimer));
        } else {
          const newBlackTimer = await redis.hIncrBy(`game:${gameId}`, "blackTimer", -1);
          blackTimer = Math.max(0, Number(newBlackTimer));
        }

        // Get sockets
        const user1Socket = this.socketMap.get(game.user1);
        const user2Socket = this.socketMap.get(game.user2);

        // Send timer update to both players
        if (user1Socket && user2Socket) {
          const timerMessage = {
            type: TIMER_UPDATE,
            payload: {
              whiteTimer: whiteTimer,
              blackTimer: blackTimer,
            },
          };

          user1Socket.send(JSON.stringify(timerMessage));
          user2Socket.send(JSON.stringify(timerMessage));
        }

        // Check if time ran out
        if (whiteTimer <= 0 || blackTimer <= 0) {
          await this.handleTimeExpired(game, gameId, whiteTimer, blackTimer);
        }
      }
    } catch (error) {
      console.error("Error in timer:", error);
    }
  }, 1000); // Run every 1 second



  }

  async handleTimeExpired(game:Record<string,string>,gameId:string,whiteTimer:number,blackTimer:number) {
    try {
        const winnerId=whiteTimer <= 0 ? game.user2 :game.user1 
        const loserId=whiteTimer <= 0 ? game.user1 :game.user2 
        const winnerColor= winnerId === game.user1 ? "w" : "b"

        await redis.hSet(`game:${gameId}`,{
            status:GAME_OVER,
            winner:winnerId,
        })
        await redis.sRem('active-games',gameId)
        await redis.expire(`game:${gameId}`,600)
        
        const winnerSocket=this.socketMap.get(winnerId)
        const loserSocket=this.socketMap.get(loserId)
         const winnerMessage = JSON.stringify({
      type: GAME_OVER,
      payload: {
        result: "win",
        reason: TIME_EXCEEDED,
        winner: winnerColor,
        message: "🎉 You won! Your opponent ran out of time.",
      },
    });

    // Send loser message
    const loserMessage = JSON.stringify({
      type: GAME_OVER,
      payload: {
        result: "lose",
        reason: TIME_EXCEEDED,
        winner: winnerColor,
        message: "⏱️ Time's up! You lost on time.",
      },
    });

    winnerSocket?.send(winnerMessage);
    loserSocket?.send(loserMessage);


    } catch (error) {
        console.log("error in handleTimeExpired: ",error);
    }
  }

    private addHandler(socket:WebSocket,id:string){
       
       socket.on("message",async(message:string)=>{

           const jsonMessage=JSON.parse(message)
            const {type}=jsonMessage
            
            //New Game Block
            if (type === INIT_GAME) {
            await insertPlayerInQueue(id);
            const match = await matchingPlayer(id);

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
                user2: id,
                status: GAME_ACTIVE,
                fen: chess.fen(),
                whiteTimer: 30,
                blackTimer: 600,
                })
                .setEx(`user:${user1Id}:game`, 1800, newGameId)
                .setEx(`user:${id}:game`, 1800, newGameId)
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
                    opponentId: id,
                    turn: chess.turn(),
                    whiteTimer: 600,
                    blackTimer: 600,
                    validMoves:moves, // include valid moves if you want
                },
                })
            );

            // Notify user2 (black)
            const user2socket = this.socketMap.get(id);
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
                },
                })
            );

            // Add to active games for global timer handling
            await redis.sAdd("active-games", newGameId);
            await redis.incr("guest:games:total");
            await this.startTimer()

            }


        



            if(type===MOVE){
                const {payload}=jsonMessage//from and to moves
                console.log("IN make move testing")
                console.log(id);
                const gameId=await redis.get(`user:${id}:game`)
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
                makeMove(socket,payload,gameId,id,this.socketMap)
                // provideValidMoves(gameId,socket)
               
            }

            if(type===LEAVE_GAME){
                const gameId=await redis.get(`user:${id}:game`)
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
                playerLeft(id,gameId,socket,this.socketMap)

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
                    await reconnectPlayer(id, gameId, socket,this.socketMap);
                    return;

            }

            // if(type===REQUEST_VALID_MOVES){
            //     const gameId=await redis.get(`user:${id}:game`)
            //     if(!gameId){
            //         socket.send(JSON.stringify({
            //             type:GAME_NOT_FOUND,
            //             payload:{
            //                 message:"Game Not found"
            //             }
            //         }))
            //         return
            //     }
            //     // provideValidMoves(gameId,socket)
            //     return
            // }


            if(type===OFFER_DRAW){
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
                await offerDraw(id,gameId,socket,this.socketMap)
                return
            }
            if(type===ACCEPT_DRAW){
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
                await acceptDraw(id,gameId,socket,this.socketMap)
                return
            }
            
            if(type===REJECT_DRAW){
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
                await rejectDraw(id,gameId,socket,this.socketMap)
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
     
     
        if (existingGame.gameEnded) {
        console.log(`Game ${gameId} already over, ignoring disconnection`);
        // Clean up socket but don't change game state
        this.socketMap.delete(playerId);
        return;
    }
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
        
        await redis.hSet(`game:${gameId}`,{
          status:DISCONNECTED,
          disconnectedBy:playerId,
          timestamp:Date.now().toString()
        })
        user_socket?.send(message)
    
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