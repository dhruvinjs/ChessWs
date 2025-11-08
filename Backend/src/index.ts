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
import { INVALID_AUTH, NO_AUTH } from './messages';
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
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials:true
}));



const userRoutes=router
app.use('/api/v1/user',userRoutes)
app.use('/api/v1/game',gameRouter)



wss.on("connection",async(socket,req:Request)=>{

   const {pathname,query}=parse(req.url,true)


   const id = typeof query.id === "string" ? query.id : undefined
   const token=typeof query.token === "string" ? query.token : undefined
   try {
      if(pathname === "/room"){
         if(!token){
            socket.send(JSON.stringify({
               type : NO_AUTH,
               payload:{
                  message:"No Token Provided for the room!"
               }
            }))
            return
         }
   
         //@ts-ignore
         const verifiedToken=jwt.verify(token,process.env.SECRET_TOKEN)
         const userId=verifiedToken.id
         // console.log("Sucessfull connection of auth user: ",userId);
         roomManager.addRoomUser(userId,socket)

         socket.on("close", async () => {
        try {
          // room disconnection handling
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
               type:NO_AUTH,
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
               message:INVALID_AUTH,
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
         type:INVALID_AUTH,
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
