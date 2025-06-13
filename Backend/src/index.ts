import dotenv from 'dotenv'
dotenv.config({
   path:'./env'
})
import { WebSocketServer,WebSocket } from "ws";   
import { GameManager } from "./Classes/GameManager";
import { router  } from "./user-controller";
import {gameRouter} from './game-controllers'
import { Prisma, PrismaClient } from "@prisma/client";
import express from 'express'
import http from 'http'
import cors from 'cors'
import { parse } from "url";


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

wss.on("connection",async(socket,req)=>{
   const {query}=parse(req.url!,true)
   //This guestId is basically is the cookie which I am generating 
   //and will be used for reconvery mechanism
   const guestId=query.guestId as string;
   
   if(!guestId){
      //if cookie not provided the websocket connection will not start
      //cookie-mandatory
      socket.close()
      return;
   }
   gameManager.addUser(socket,guestId)
   socket.on("close",()=>console.log("Disconnected player"))
   

})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
