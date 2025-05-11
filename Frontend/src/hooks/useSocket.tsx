import { useState,useEffect } from "react";

export const useSocket=()=>{
    const [socket,setSocket]=useState<WebSocket|null>(null)
    const ws_url=import.meta.env.VITE_WS_URL

    function getCookie(name: string): string |  null {
	const nameLenPlus = (name.length + 1);
	return document.cookie
		.split(';')
		.map(c => c.trim())
		.filter(cookie => {
			return cookie.substring(0, nameLenPlus) === `${name}=`;
		})
		.map(cookie => {
			return decodeURIComponent(cookie.substring(nameLenPlus));
		})[0] || null;
}


    useEffect(() => {
        const wss=new WebSocket(ws_url)

        wss.onopen=(()=>{ 
            console.log("Socket Connected")   
            setSocket(wss)
        })
         wss.onmessage = (event) => {
             const jsonMessage=JSON.parse(event.data)
             console.log("Message received:", jsonMessage);
             
             const guestId =getCookie('guestId')
            console.log(guestId)
            if (guestId) {
                console.log("Cookie already exists:", guestId);
                return;
            }

             
         fetch(`http://localhost:3000/api/v1/game/${jsonMessage.id}/cookie`, {
                    method: "POST",
                    credentials: "include"
                });
    };
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