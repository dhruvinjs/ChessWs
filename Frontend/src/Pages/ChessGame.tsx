import React, { useState,useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import { useMediaQuery } from 'react-responsive'
import { Button } from '../Components'

interface Props {}

export function ChessGame() {
    const [gameStarted,setGameStarted] = useState<boolean>(false) 
    const [boardWidth,setBoardWidth]=useState(800)
    const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
    const [history, setHistory] = useState<string[]>([]);
    const isSmallScreen=useMediaQuery({maxWidth:640})
    const isMobileScreen=useMediaQuery({maxWidth:320})
    const isTabletScreen=useMediaQuery({maxWidth:768})
    
   useEffect(() => {
     if (isMobileScreen) {
    setBoardWidth(300);   // very small phones
  } else if (isSmallScreen) {
    setBoardWidth(400);   // typical phones
  } else if (isTabletScreen) {
    setBoardWidth(456);   // tablets
  } else {
    setBoardWidth(700);   // desktops
  }
    
    // else setBoardWidth
   }, [isMobileScreen,isTabletScreen,isSmallScreen]);
    return (
        <>
    <div className="w-full min-h-screen bg-[#EFEBE9] text-[#5D4037] flex flex-col sm:flex-row md:space-x-12 items-center justify-center">
        <div className="flex justify-center">
            <Chessboard
            boardWidth={boardWidth}
            
      customDropSquareStyle={{ boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)' }}
            />
        </div>
            <div className="bg-[#A1887F] flex flex-col items-center justify-start p-8   w-[350px] h-[1000px] space-y-6 mt-10 rounded-xl ">
                    <h2 className="text-2xl font-semibold text-white">Controls</h2>
                {!gameStarted &&
                    <Button
                    onClick={() => console.log("played")}
                    size="md"
                    text="Play"
                    className="w-full"
                    variant="primary"
                    />
                }
            <div className="relative overflow-x-auto shadow-md sm:rounded-md">
            <table className="w-full text-sm text-center  text-white dark:text-gray-400 border">
                <thead className='border'>
                    <tr>
                    <th scope="col" className="px-6 py-3 rounded-md text-white bg-[#7a574a]">
                        Product name
                    </th>
                    <th scope="col" className="px-6 py-3 bg-white text-black">
                        Color
                    </th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((move,index)=>(
                        <tr key={index}>
                        <td className='px-4 py-4 text-white bg-[#7a574a] rounded-md'>
                            {move}
                        </td>
                        <td className='px-4 py-4 bg-white text-black font-semibold'>
                            {index % 2 === 0 ? "white" : "black"}
                        </td>
                        </tr>
                    ))}
                </tbody>
            </table>
                </div>
                    </div>

    </div>
        </>
    )
}


