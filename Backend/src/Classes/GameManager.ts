import { WebSocket } from "ws";
import { Games } from "./Games"
import { INIT_GAME, MOVE } from "../messages";
export class GameManager{
    private games:Games[];
    public users:WebSocket[]=[];
    public pendingUser:WebSocket | null=null;

    constructor(){
        this.games=[]
    }
    addUser(socket:WebSocket){
        this.users.push(socket)
        this.addHandler(socket)
    }
    
    removeUser(socket:WebSocket){
        this.users=this.users.filter(user=>user!==socket)
    }

    

    addHandler(socket:WebSocket){
        socket.on("message",(message)=>{
            const jsonMessage=JSON.parse(message.toString())

                if (jsonMessage.type === INIT_GAME) {
                    console.log("Init Game message")
                    if (this.pendingUser) {
                        // ✅ Case 1: A user is already waiting
                        const newGame = new Games(this.pendingUser, socket); // Start a game between pending user and new socket
                        this.games.push(newGame); // Store the game
                        this.pendingUser = null; // Clear the pending slot
                    } else {
                        // ✅ Case 2: No one is waiting
                        this.pendingUser = socket; // Save this user to wait for the next one
                    }
                }
                
                if(jsonMessage.type===MOVE){
                    console.log("INside move")

                    const game=this.games.find(game=> socket === game.user1 || game.user2)
                    console.log(jsonMessage.payload)
                    if(game){
                        game.makeMove(socket,jsonMessage.payload)
                    }
                }

        })
    }


}