// import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Game, Landing, Room } from './Pages'
import { useUserStore } from './stores/useUserStore';
import { useEffect } from 'react';
function App() {
  // const [messages,setMessages]=useState<string[]>([])
  // const roomRef=useRef<HTMLInputElement>("") 
  
  // const messageRef=useRef<HTMLInputElement>("")
  // const socketRef=useRef<WebSocket>()

  // function sendMessage(){
  //   if(!socketRef.current || !messageRef.current) return;
  //   const msgObj={
  //     type:"chat",payload:{
  //       message:messageRef.current.value
  //     }
  //   }
  //   alert("Room: "+roomRef.current.value)
  //   socketRef.current.send(JSON.stringify(msgObj))
  //   messageRef.current.value=""
  // }

  // function joinRoom(){
  //   if(!socketRef.current || !roomRef.current.value) return

  //   const obj={
  //     type:"join",
  //     payload:{
  //       roomId:roomRef.current.value
  //     }
  //   }
  //   socketRef.current.send(JSON.stringify(obj))
  // }

  // // useEffect(() => {
  // //   const ws=new WebSocket("ws://localhost:8008")
  // //   socketRef.current=ws
  // //   socketRef.current.onmessage=(ev)=>setMessages(prev=>[...prev,ev.data])

  // //   return()=>{
  // //     socketRef.current.close()
  // //   }
  // // }, []);


   const { user, setGuest } = useUserStore();

  useEffect(() => {
    // Only fetch guest ID if it's not already set
    if (!user?.id) {
      setGuest(); // fetches from cookie and stores in Zustand
    }
  }, []);
  return (
    <> 
    <BrowserRouter>
    <Routes>

      <Route path='/' element={<Landing/>}/>
      <Route path='/room' element={<Room/>}/>
      <Route path='/game' element={<Game/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

