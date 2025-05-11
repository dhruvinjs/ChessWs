import { WebSocketServer,WebSocket } from "ws";   
import { GameManager } from "./Classes/GameManager";
import { router  } from "./user-controller";
import {gameRouter} from './game-controllers'
import dotenv from 'dotenv'
import { Prisma, PrismaClient } from "@prisma/client";
dotenv.config({
   path:'./env'
})
import express from 'express'
import http from 'http'
import cors from 'cors'
const port=process.env.PORT
const app=express()

app.use(express.json()); 
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

export const pc=new PrismaClient()
interface User{
   socket:WebSocket,
   roomId:string
}

const userRoutes=router
const gameManager=new GameManager()
app.use('/api/v1/user',userRoutes)
app.use('/api/v1/game',gameRouter)

app.use(cors({
   origin: 'http://localhost:5173', // Replace '*' with specific origin(s) in production
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   allowedHeaders: ['Content-Type', 'Authorization']
}));

let allSockets:User[]=[]   
wss.on('connection',(socket)=>{
   // socket.send("Helo connection")
   gameManager.addUser(socket)
   
   socket.on('close',()=>(console.log('A player disconnected')))

})




server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
