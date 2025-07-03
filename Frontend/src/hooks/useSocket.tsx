import { useState,useEffect } from "react";
import {useUserStore} from "../stores/useUserStore"
export const useSocket=()=>{
    const {user,setGuest} = useUserStore()
    const [socket,setSocket]=useState<WebSocket|null>(null)
    const ws_base_url=import.meta.env.VITE_WS_URL

    useEffect(() => {

          if(!user?.id){
            console.log("no guest id")
            return
          }
        
        const ws_url=`${ws_base_url}/ws?guestId=${user?.id}`

        const wss=new WebSocket(ws_url)

        wss.onopen=(()=>{ 
            console.log("Socket Connected")   
            setSocket(wss)
        })
         wss.onmessage = (event) => {
             const jsonMessage=JSON.parse(event.data)
             console.log("Message received:", jsonMessage);
    };


        wss.onclose=(()=>{
            console.log("Socket Disconnected")
            setSocket(null)
        })

        return()=>{
            wss.close()
        }
    }, [user?.id, ws_base_url, setGuest]);
    return socket
}