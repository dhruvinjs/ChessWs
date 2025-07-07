import express, { Request, Response } from 'express'
import {PrismaClient} from '@prisma/client'
import bcrypt from 'bcrypt'
import { z } from "zod";
import jwt from 'jsonwebtoken'
import {v4 as uuidv4} from "uuid"
import { pc } from '.';
import { authMiddleware } from './middleware';
const router=express.Router()
// const pc=new PrismaClient()

export enum ChessLevel {
  BEGINNER,
  INTERMEDIATE,
  PRO
}

router.post('/register',async (req:Request,res:Response) => {
    try {
        const schema=z.object({
            name:z.string().min(3,'Minimum UserName should be 3 letter long')
            .max(20,"Max Length of Username is 20")
            .regex(/^[a-zA-Z0-9_]+$/,'Name should only contain letters, numbers, and underscores'),
            email:z.string().email(),
            password:z.string().min(6,'Password Should be 6 char long')
            .max(100,'Password is too long '),
               chessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'PRO'])
        })

        const validateData=schema.parse(req.body)
        const {name,email,password,chessLevel}=validateData
        console.log(name,email,password,chessLevel);
        const existingUser=await pc.user.findUnique({where:{email:email}})
        if(existingUser){
            res.status(203).json({message:"User Already Exists",success:false})
            return;
        }
        const hashedPass=await bcrypt.hash(password,12)
        
        const newUser=await pc.user.create({
            data:{
                name:name,
                email:email,
                password:hashedPass,
                chessLevel:chessLevel
            }
        })
        res.status(200).json({message:'User Created',success:true})

    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})
router.get("/getProfile",authMiddleware,async(req:Request,res:Response)=>{
    try {
        //@ts-ignore
        const id=req.userId

        const user=await pc.user.findUnique({
            where:{id:Number(id)},
            select:{
                name:true,
                email:true,
                chessLevel:true
            }
        })

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return
    }
    res.status(200).json({success:true,user:user});
    } catch (error) {
          res.status(500).json({error:error})
        console.log(error)
    }
})


router.post('/login',async(req:Request,res:Response)=>{
    try {
        const {email,password}=req.body
        const user=await pc.user.findUnique({where:{email:email}})
        if(!user) {
            res.status(200).json({message:"User Does not exist"})
            return
        }

        const checkedPass=await bcrypt.compare(password,user.password)

        if(!checkedPass){
            res.status(400).json({message:"password is wrong"})
        }
        const token=jwt.sign({id:user.id},process.env.SECRET_TOKEN as string,{expiresIn:'6h'})

         res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 6 * 60 * 60 * 1000 // 6 hours in ms
        });
        res.status(200).json({message:"Login Successful"})
    } catch (error) {
         res.status(500).json({error:error})
        console.log(error)
    }
})

router.post('/edit',authMiddleware,async (req:Request,res:Response) => {
    try {
       
        const {email,password,chessLevel,name}=req.body

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (chessLevel) updateData.chessLevel = chessLevel;
        if (password) updateData.password = await bcrypt.hash(password, 12);
        //@ts-ignore
        const userId=req.userId
          const updatedUser = await pc.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                chessLevel: true
            }
        });

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
         res.status(500).json({error:error})
        console.log(error)
    }
})


router.post('/logout',authMiddleware,async(req:Request,res:Response)=>{
    try {
        res.clearCookie("token")
        res.status(200).json({message:"Logout sucessfull"})

    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})

//This api is used for guest cookie generation which can be used to restore games.
router.get('/cookie', (req:Request, res:Response) => {
    const existingId = req.cookies.guestId;
    
    console.log(existingId)
  if (existingId) {
    res.cookie('guestId', existingId, {
    httpOnly: true,
    secure:true,
    maxAge: 30 * 60 * 1000, // 3
    path: '/'
  });
     res.status(200).json({ guestId: existingId });
     return
  }

  const guestCookie = uuidv4();
  res.cookie('guestId', guestCookie, {
    httpOnly: true,
    secure:true,
    maxAge: 30 * 60 * 1000, 
    path: '/'
  });
  res.status(200).json({guestId:guestCookie});
});
export {router}