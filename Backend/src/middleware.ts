import jwt from 'jsonwebtoken'

import { NextFunction, Response,Request } from 'express'
export function authMiddleware(req:Request,res:Response,next:NextFunction){
    try {
        const token=req.headers.cookie
        if(!token){
            res.status(400).json({message:"Token Not found"})
            return
        }
        //@ts-ignore
        const decodedToken=jwt.verify(token,process.env.SECRET_TOKEN)
        if(!decodedToken){
             res.status(400).json({message:"Token is invalid"})
            return
            }
            //@ts-ignore
        req.userId=decodedToken.id
            next()

    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
}