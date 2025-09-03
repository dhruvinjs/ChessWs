// import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {  Landing, Auth, Room, About } from './Pages'
import { ChessGame } from './Pages'
function App() {



      // const { user, setGuest } = useUserStore();

      // useEffect(() => {
      //   // Only fetch guest ID if it's not already set
      //   if (!user?.id) {
      //     setGuest(); // fetches from cookie and stores in Zustand
      //   }
      // }, []);
  return (
    <> 
    <BrowserRouter>
    <Routes>

      <Route path='/' element={<Landing/>}/>
      <Route path='/room' element={<Room/>}/>

      <Route path='/game' element={
        <div className='dark'>
          <ChessGame/>
        </div>
        
        }/>
      {/* <Route path='/game' element={<Game/>}/> */}
      <Route path='/login' element={<Auth/>}/>
      <Route path='/about' element={<About/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

