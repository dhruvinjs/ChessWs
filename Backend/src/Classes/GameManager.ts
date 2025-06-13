import {v4 as uuidv4} from "uuid"
import { redis } from "../redisClient"
import { WebSocket } from "ws"
import { ASSIGN_ID, GAME_NOT_FOUND, INIT_GAME, MATCH_NOT_FOUND, MOVE, PLAYER_NOT_FOUND, RECONNECT } from "../messages"
import { Games } from "./Games"

export class GameManager{
    private activeGames:Map<string,Games>=new Map()
    private socketMap:Map<string,WebSocket>=new Map()
    addUser(socket:WebSocket,guestId:string){
        this.socketMap.set(guestId,socket)
        redis.get(`user:${guestId}:game`).then((existingGameId)=>{
           
           if(existingGameId){
            this.socketMap.get(guestId)
                 Games.reconnectPlayer(guestId,socket,existingGameId)
                
                 this.addHandler(socket,guestId)

            }
        })
        
        
        
        redis.setEx(`temp:${guestId}`,1800,"waiting")
        socket.send(JSON.stringify({
           type:ASSIGN_ID,
           id:guestId
       }))
       redis.lPush(process.env.GUEST_KEY as string,guestId)
        this.addHandler(socket,guestId)
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
                // const user2Socket=this.socketMap.get(guestId)
                const newGameId=uuidv4()
                const newGame=new Games(user1socket,socket,newGameId,user1Id,guestId)
                await redis.multi().hSet(`game:${newGameId}`,{
                    user1:user1Id,
                    user2:guestId,
                    moves:JSON.stringify([])
                }).setEx(`user:${user1Id}:game`,1800,newGameId)
                  .setEx(`user:${guestId}:game`,1800,newGameId)
                  .exec();
                  this.activeGames.set(newGameId,newGame)
                  console.log(`Set Redis game for ${user1Id} and ${guestId} → ${newGameId}`);
                // console.log(this.activeGames)
            }

            if(type===MOVE){
                const {payload}=jsonMessage//from and to moves
                console.log(guestId)
                const gameId=await redis.get(`user:${guestId}:game`)
                console.log(gameId)
                if(!gameId) return
                const game=this.activeGames.get(gameId)
                if(game){
                    game.makeMove(socket,payload)
                } 
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
                const game=await redis.hGet(`game:${gameId}`,gameId)
                console.log(game)
                // const gameIns=new Games(game)
                if(game){
                    Games.reconnectPlayer(id,socket,gameId)
                }else{
                   socket.send(JSON.stringify({
                        type:GAME_NOT_FOUND,
                        message:"Game Not found"
                    }))
                    return 
                }

            }


       })
    
    
    
    
    
    }
}