import { WebSocket } from "ws";
import { Games } from "./Games"
import { GAME_NOT_FOUND, INIT_GAME, MOVE, RECONNECT } from "../messages";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "redis";
import { redis } from "../redisClient";
export class GameManager{
    //Will bind the uuid with the socket 
    private socketMap:Map<string,WebSocket>=new Map()
    private guestKey="guest_queue"
    private activeGames:Map<string,Games>=new Map()
    
    addUser(socket:WebSocket){
    const newUUid=uuidv4()

    this.socketMap.set(newUUid,socket)
    // console.log(socket)
    // console.log(this.socketMap)
    redis.setEx(`temp:${newUUid}`,1800,"waiting")

    this.addHandler(socket,newUUid)

    socket.send(JSON.stringify({
        type:"ASSIGN_ID",
        id:newUUid
    }))

    redis.lPush(this.guestKey,newUUid)

   }
    
   
   addHandler(socket:WebSocket,tempId:string){
          socket.on('message',async (message) => {
          const jsonMessage=JSON.parse(message.toString())

          const {type}=jsonMessage

            if(type===INIT_GAME){
                
                const waitingUsers = await redis.lRange(this.guestKey, 0, -1);
                console.log("Current Redis Queue:", waitingUsers);
                const user1Id=waitingUsers.find(id=>id!==tempId)
                if (!user1Id) {
                        console.log("No valid opponent found");
                        socket.send(JSON.stringify({
                        type: "MATCH_NOT_FOUND",
                        message: "No opponent available right now"
                        }));
                        return;
                    }

            console.log(`Matched ${tempId} with ${user1Id}`);
            await redis.lRem(this.guestKey, 1, user1Id);

              const user1socket = this.socketMap.get(user1Id);
                if (!user1socket) {
                    console.log(`Socket not found for ${user1Id}`);
                    socket.send(JSON.stringify({
                    type: "OPPONENT_LEFT",
                    message: "Opponent disconnected"
                    }));
                    return;
                }


          const newGameId=uuidv4()
                    const game=new Games(user1socket,socket,newGameId,user1Id,tempId)
                    await redis.multi().hSet(`game:${newGameId}`, {
                        user1: user1Id,
                        user2: tempId,
                        moves: JSON.stringify([])
                    }).expire(`game:${newGameId}`,1800)
                    .setEx(`user:${user1Id}:game`,1800,newGameId)
                    .setEx(`user:${tempId}:game`,1800,newGameId)
                    .exec()
                    this.activeGames.set(newGameId,game)                            
                }


               if(type===RECONNECT){
                const {id}=jsonMessage
                const gameId=await redis.get(`user:${id}:game`)
                if(!gameId){
                    socket.send(JSON.stringify({
                        type:GAME_NOT_FOUND
                    }))
                    return
                }
                const game=this.activeGames.get(gameId)
                if(game){
                game.reconnectPlayer(id,socket,gameId)
               }
            }
                
                if(type===MOVE){
                    console.log("Inside move")
                    const id=jsonMessage.payload

                    const gameId = await redis.get(`user:${tempId}:game`);
                    console.log(jsonMessage.payload)
                    if(!gameId) return

                    const game=this.activeGames.get(gameId)

                    if(game){
                        game.makeMove(socket,jsonMessage.payload)
                    }
                }

        })

}}