import dotenv from 'dotenv'
dotenv.config({
   path:'./env'
})
import cookieParser from "cookie-parser";


import { WebSocketServer,WebSocket } from "ws";   
import { GameManager } from "./Classes/GameManager";
import { router  } from "./user-controller";
// import {gameRouter} from './game-controllers'
import { Prisma, PrismaClient } from "@prisma/client";
import express from 'express'
import http from 'http'
import cors from 'cors'
import { parse } from "url";
import { gameRouter } from './game-controllers';


const port=process.env.PORT
const app=express()

app.use(cookieParser());
app.use(express.json()); 
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

export const pc=new PrismaClient()
app.use(cors({
   origin: 'http://localhost:5173', 
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials:true
}));


interface User{
   socket:WebSocket,
   roomId:string
}

const userRoutes=router
const gameManager=new GameManager()
app.use('/api/v1/user',userRoutes)
app.use('/api/v1/game',gameRouter)



wss.on("connection",async(socket,req)=>{
   const {query}=parse(req.url!,true)
   //This guestId is basically is the cookie which I am generating 
   //and will be used for reconvery mechanism
   const guestId=query.guestId as string;
   console.log(guestId,query)
   if(!guestId){
      //if cookie not provided the websocket connection will not start
      //cookie-mandatory
      socket.close()
      return;
   }
   gameManager.addUser(socket,guestId)
   socket.on("close",()=>
   gameManager.handleDisconnection(guestId)
   )
   

})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
