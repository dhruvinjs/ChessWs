// import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {  Landing, Auth, Room, About } from './Pages'
import { useUserStore } from './stores/useUserStore';
import { useEffect } from 'react';
import { ChessGame } from './Pages/ChessGame';
function App() {



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
      <Route path='/game' element={<ChessGame/>}/>
      {/* <Route path='/game' element={<Game/>}/> */}
      <Route path='/login' element={<Auth/>}/>
      <Route path='/about' element={<About/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

