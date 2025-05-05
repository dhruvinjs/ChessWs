import { useState,useEffect } from "react";

export const useSocket=()=>{
    const [socket,setSocket]=useState<WebSocket|null>()
    const ws_url=import.meta.env.VITE_WS_URL

    useEffect(() => {
        const wss=new WebSocket(ws_url)

        wss.onopen=(()=>{ 
            console.log("Socket Connected")   
            setSocket(wss)
        })
        
        wss.onclose=(()=>{
            console.log("Socket Disconnected")
            setSocket(null)
        })

        return()=>{
            wss.close()
        }
    }, []);
    return socket
}