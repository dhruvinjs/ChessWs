import express, { Request, Response } from 'express'
// import {v4 as uuidv4} from "uuid"
import { getGamesCount } from '../Services/GameServices'
const gameRouter=express.Router()

gameRouter.get('/guest-games/total',async(req:Request,res:Response)=>{
    try {
        const count=await getGamesCount()
        console.log(count);
        if(count===null || count === undefined){
            res.status(400).json({
                message:"count is null or undefined",
                success:false
            })
            return
        }
        res.status(200).json({success:true,count})
    } catch (error) {
        res.status(500).json({message:"Internal Server error"})
    }
})


export {gameRouter}