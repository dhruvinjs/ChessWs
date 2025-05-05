// import React from 'react'
import { Button } from '../Components'

// interface RoomProps {}

function Room() {
    // const {} = props

    return (
        <>
        <div className="h-screen bg-gray-900 flex justify-center items-center">
            <div className="flex flex-col gap-2 ">
                <input type="text" name="" 
                className='p-3 bg-white'
                placeholder='Enter room' id="" />
                <Button
                variant='primary'
                size='md'
                text='Join'
                onClick={()=>{}}
                />
                </div>
        </div>
        
        </>
    )
}

export default Room
