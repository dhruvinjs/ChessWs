import dotenv from 'dotenv'
dotenv.config({
   path:'./env'
})
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import { WebSocketServer,WebSocket } from "ws";   
import { gameManager, GameManager } from "./Classes/GameManager";
import { router  } from "./user-controller";
import express from 'express'
import http from 'http'
import cors from 'cors'
import { parse } from "url";
import { gameRouter } from './game-controllers';
import { ErrorMessages } from './messages';
import { redis } from './redisClient';
import { roomManager } from './Classes/RoomManager';


const port=process.env.PORT
const app=express()

app.use(cookieParser());
app.use(express.json()); 
const server = http.createServer(app);

const wss = new WebSocketServer({ server });


app.use(cors({
   origin: ['http://localhost:5173'], 
   methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials:true
}));



const userRoutes=router
app.use('/api/v1/user',userRoutes)
app.use('/api/v1/game',gameRouter)



wss.on("connection",async(socket,req:Request)=>{

   const {pathname,query}=parse(req.url,true)


   const id = typeof query.id === "string" ? query.id : undefined
   const userId = query.userId ? parseInt(query.userId as string) : undefined
   try {
      if(pathname === "/room"){
         if(!userId || isNaN(userId)){
            socket.send(JSON.stringify({
               type : ErrorMessages.NO_AUTH,
               payload:{
                  message:"No Valid User ID Provided for the room!"
               }
            }))
            return
         }
   
         console.log("Successful connection of auth user: ",userId);
         roomManager.addRoomUser(userId,socket)

         socket.on("close", async () => {
        try {
          await roomManager.handleDisconnection(userId, socket);
          console.log(`Room player ${userId} disconnected`);
        } catch (err) {
          console.error("Error handling room disconnect:", err);
        }
      });
      }
      else if(pathname === "/guest" ){
         if(!id){
            socket.send(JSON.stringify({
               type:ErrorMessages.NO_AUTH,
               payload:{
                  message:"No Id Provided for the guest!"
               }
            }))
            return
         }


         const verifiedId=await redis.exists(`guest:${id}`)
         if(verifiedId){
            gameManager.addUser(socket,id)
            socket.on("close",()=>gameManager.handleDisconnection(id || "unknown"))
            return
         }
         else{
            socket.send(JSON.stringify({
               message:ErrorMessages.INVALID_AUTH,
               payload:{
                  message:"Invalid Guest Id"
               }
            }))
           socket.close()
           return
         }
      }
         
         
         

   } catch (error) {
      console.log("Invalid Auth Error: ",error)
      socket.send(JSON.stringify({
         type:ErrorMessages.INVALID_AUTH,
         payload:{
            message:"Invalid Auth Provided"
         }
      }))
      
      socket.close()
   }





})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
