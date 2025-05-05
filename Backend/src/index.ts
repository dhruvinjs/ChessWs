import { WebSocketServer,WebSocket } from "ws";   
import { GameManager } from "./Classes/GameManager";

const server=new WebSocketServer({port:8008})
interface User{
   socket:WebSocket,
   roomId:string
}
const gameManager=new GameManager()
let allSockets:User[]=[]
server.on('connection',(socket)=>{
   socket.send("Helo connection")
   gameManager.addUser(socket)
   
   server.on('disconnect',(socket)=>gameManager.removeUser(socket))


})