import dotenv from 'dotenv'
dotenv.config({
   path:'./env'
})
import cookieParser from "cookie-parser";
import { WebSocketServer,WebSocket } from "ws";   
import { gameManager, GameManager } from "./Classes/GameManager";
import { router  } from "./user-controller";
import express from 'express'
import http from 'http'
import cors from 'cors'
import { parse } from "url";
import { gameRouter } from './game-controllers';
import { verifyCookie } from './Services/GameServices';


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
     const {query}=parse(req.url,true)
   //This guestId is basically is the cookie which I am generating 
   //and will be used for reconvery mechanism
   const guestId=typeof query.guestId==="string" ? query.guestId :undefined  

   if(!guestId){
      //if cookie not provided the websocket connection will not start
      //cookie-mandatory
      socket.close()
      return;
   }
   const verifyRedis=await verifyCookie(guestId)
   if(!verifyRedis){
      socket.send(JSON.stringify({
         message:"unauthorized_uuid"
      }))
      socket.close()
      return
   }

   // console.log(`Guest verified: ${guestId}`);
   gameManager.addUser(socket,guestId)
   socket.on("close",()=>
   gameManager.handleDisconnection(guestId)
   )
   

})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
