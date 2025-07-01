import {v4 as uuidv4} from "uuid"
import { redis } from "../redisClient"
import { WebSocket } from "ws"
import { ASSIGN_ID, DISCONNECTED, GAME_NOT_FOUND, GAME_OVER, GAME_STARTED, INIT_GAME, MATCH_NOT_FOUND, MOVE, PLAYER_NOT_FOUND, RECONNECT } from "../messages"
import { getGameState, makeMove, reconnectPlayer } from "../Services/GameServices"
import { insertPlayerInQueue, matchingPlayer } from "../Services/MatchMaking"

export class GameManager{
    private socketMap:Map<string,WebSocket>=new Map()

     async addUser(socket: WebSocket, guestId: string) {
     this.socketMap.set(guestId, socket);
     this.addHandler(socket, guestId);

    const existingGameId = await redis.get(`user:${guestId}:game`);
    if (existingGameId) {
        console.log(existingGameId)
      // update socketMap for reconnection
      await reconnectPlayer(guestId, existingGameId, socket,this.socketMap);
      
      return;
    }

    // No previous game, so assign ID and queue for matchmaking
    await redis.setEx(`temp:${guestId}`, 1800, "waiting");
   
    socket.send(JSON.stringify({
      type: ASSIGN_ID,
      id: guestId
    }));

  }

    private addHandler(socket:WebSocket,guestId:string){
       
       socket.on("message",async(message:string)=>{

           const jsonMessage=JSON.parse(message)
            const {type}=jsonMessage
            
            //New Game Block
            if(type===INIT_GAME){
                await insertPlayerInQueue(guestId)
                const match = await matchingPlayer(guestId)

                if(!match){   
                    socket.send(JSON.stringify({
                        type:MATCH_NOT_FOUND,
                        message:"No opponent available right now"
                    }))
                    return
                }
                const user1Id=match.waitingPlayerId
                const user1socket=this.socketMap.get(user1Id)
                if(!user1socket){
                    socket.send(JSON.stringify({
                        type:PLAYER_NOT_FOUND,
                        message:"Player not found"
                    }))
                    return
                }
               
                const newGameId=uuidv4()
                await redis.multi().hSet(`game:${newGameId}`,{
                    user1:user1Id,
                    user2:guestId,
                    moves:JSON.stringify([]),
                    status:GAME_STARTED
                }).setEx(`user:${user1Id}:game`,1800,newGameId)
                  .setEx(`user:${guestId}:game`,1800,newGameId)
                  .exec();
                
                console.log("New game started:",newGameId)
                    user1socket.send(JSON.stringify({
                        type:INIT_GAME,
                        color:"w"
                    }))
                  const user2socket=this.socketMap.get(guestId)
                    user2socket?.send(JSON.stringify({
                        type:INIT_GAME,
                        color:"b"
                    }))
                //   const 
                await redis.incr("guest:games:total")
            }

            if(type===MOVE){
                const {payload}=jsonMessage//from and to moves
                console.log(guestId)
                const gameId=await redis.get(`user:${guestId}:game`)
                console.log("GameID: ",gameId)
                if(!gameId) return;
                makeMove(socket,payload,gameId,guestId,this.socketMap)

            }



            if(type===RECONNECT){
                const {id}=jsonMessage
                const gameId=await redis.get(`user:${id}:game`)
                if(!gameId){
                    socket.send(JSON.stringify({
                        type:GAME_NOT_FOUND,
                        message:"Game Not found"
                    }))
                    return
                }
                if (gameId) {
                    await reconnectPlayer(guestId, gameId, socket,this.socketMap);
                    return;
                }

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
            message:"Opponent Left due to bad connectivty"
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
            const newStatus={
            status:DISCONNECTED,
            winner:winner
        }
            
            await redis.hSet(`game:${gameId}`,newStatus)
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