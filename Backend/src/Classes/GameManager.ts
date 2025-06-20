import {v4 as uuidv4} from "uuid"
import { redis } from "../redisClient"
import { WebSocket } from "ws"
import { ASSIGN_ID, GAME_NOT_FOUND, GAME_OVER, GAME_STARTED, INIT_GAME, MATCH_NOT_FOUND, MOVE, PLAYER_NOT_FOUND, RECONNECT } from "../messages"
import { getGameState, makeMove, reconnectPlayer } from "../Services/GameServices"

export class GameManager{
    private socketMap:Map<string,WebSocket>=new Map()

     async addUser(socket: WebSocket, guestId: string) {
     this.socketMap.set(guestId, socket);
     this.addHandler(socket, guestId);

    const existingGameId = await redis.get(`user:${guestId}:game`);
    if (existingGameId) {
      // update socketMap for reconnection
      await reconnectPlayer(guestId, existingGameId, socket);
      
      return;
    }

    // No previous game, so assign ID and queue for matchmaking
    await redis.setEx(`temp:${guestId}`, 1800, "waiting");
    await redis.lPush(process.env.GUEST_KEY as string, guestId);

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
                const waitingId=await redis.lRange(process.env.GUEST_KEY as string,1,-1)
                console.log(waitingId)
                const user1Id=waitingId.find(id => guestId!==id)
                if(!user1Id){
                    socket.send(JSON.stringify({
                        type:MATCH_NOT_FOUND,
                        message:"No opponent available right now"
                    }))
                    return
                }
                // this.socketMap.set()
                console.log(`Matched ${guestId} with ${user1Id}`);
                await redis.lRem(process.env.GUEST_KEY as string,1,user1Id)
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
                  console.log(`Set Redis game for ${user1Id} and ${guestId} → ${newGameId}`);
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
                    await reconnectPlayer(guestId, gameId, socket);
                    return;
                }

            }
       })   
    }

    
}