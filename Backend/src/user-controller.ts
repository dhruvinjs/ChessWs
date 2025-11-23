import express, { Request, Response } from 'express'

import bcrypt from 'bcrypt'
import { z } from "zod";
import jwt from 'jsonwebtoken'
import {v4 as uuidv4} from "uuid"
import pc  from './prismaClient';
import { authMiddleware } from './middleware';
const router=express.Router()
import {nanoid } from 'nanoid';
import { redis } from './redisClient';
import { roomManager } from './Classes/RoomManager';
// import { verifyCookie } from './Services/GameServices';
export enum ChessLevel {
  BEGINNER,
  INTERMEDIATE,
  PRO
}
export enum RoomStatus {
    WAITING,
    ACTIVE,
    FINISHED
}

router.post('/register',async (req:Request,res:Response) => {
    try {
        const schema=z.object({
            name:z.string().min(3,'Minimum UserName should be 3 letter long')
            .max(20,"Max Length of Username is 20")
            .regex(/^[a-zA-Z0-9]+$/,'Name should only contain letters, numbers, and underscores'),
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
        const token=jwt.sign({id:newUser.id},process.env.SECRET_TOKEN as string,{expiresIn:"8h"})
        res.clearCookie('guestId')
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 6 * 60 * 60 * 1000 // 6 hours in ms
        });
        res.status(200).json({message:'User Created',success:true,
            id:newUser.id,
            username:newUser.name,
            email:newUser.email,
            chessLevel:chessLevel,
            isGuest:false
        })
    } catch (error) {
    if (error instanceof z.ZodError) {
      // ✅ Handle validation errors specifically
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
        success: false,
      });
    } else {
      console.error('Register error:', error);
      res.status(500).json({
        message: 'Internal server error',
        success: false,
      });
           }
    }
})
router.get("/getProfile",authMiddleware,async(req:Request,res:Response)=>{
    try {
        //@ts-ignore
        const id=req.userId

        const user=await pc.user.findUnique({
            where:{id:Number(id)},
            select:{
                id:true,
                name:true,
                email:true,
                chessLevel:true
            }
        })

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return
    }
    res.status(200).json({success:true,
        user:user,
        isGuest:false
    });
    } catch (error) {
          res.status(500).json({error:error})
        console.log(error)
    }
})


router.post('/login',async(req:Request,res:Response)=>{
    try {
        const schema=z.object({
            email:z.string().email("Invalid Email"),
            password:z.string().min(3,"Password is required")
        })
        const {email,password}=schema.parse(req.body)
        const user=await pc.user.findUnique({where:{email}})
        if(!user) {
            res.status(401).json({message:"User Does not exist",success:false})
            return
        }

        if(!user.password){
            res.status(400).json({
                message:"This account uses social login.  Please sign in with Google.",
                success:false
            })
            return
        }
        const checkedPass=await bcrypt.compare(password,user.password)

        if(!checkedPass){
            res.status(401).json({message: 'Invalid email or password', success:false})
            return
        }
        const token=jwt.sign({id:user.id},process.env.SECRET_TOKEN as string,{expiresIn:'8h'})
        res.clearCookie('id')
         res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 6 * 60 * 60 * 1000 // 6 hours in ms
        });
        res.status(200).json({success:true,
            message:"Login Successful",
            id:user.id,
            username:user.name,
            email:user.email,
            chessLevel:user.chessLevel,
            isGuest:false})
        return
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
        res.status(200).json({success:true,message:"Logout sucessfull"})

    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
})

//This api is used for guest cookie generation which can be used to restore games.
router.get('/cookie', async(req:Request, res:Response) => {
    try {
        const existingId = req.cookies.id;
        
        console.log(existingId)
      if (existingId) {
        const isValidId=await redis.exists(`guest:${existingId}`)
        if(isValidId){
            await redis.expire(`guest:${existingId}`,30 * 60)
            res.cookie('id', existingId, {
                httpOnly: true,
                secure:true,
                maxAge: 30 * 60 * 1000, // 30 min
                path: '/'
            });
            res.status(200).json({ id:existingId,success:true,isGuest:true, });
            return
        }
    }
    
      const guestCookie = uuidv4();

      await redis.set(`guest:${guestCookie}`,
        JSON.stringify({
            createdAt:Date.now(),
            ip:req.ip,
            requestFrom:req.headers["user-agent"] || "unknown",
        }),
        {EX:30*60} 
      )


      res.cookie('id', guestCookie, {
        httpOnly: true,
        secure:true,
        maxAge: 30 * 60 * 1000, 
        path: '/'
      });
      res.status(200).json({id:guestCookie,success:true,isGuest:true});
      return
    } catch (error) {
        res.status(500).json({error:error})
        console.log(error)
    }
});

router.post('/checkAuth',authMiddleware,async (req:Request,res:Response) => {
    try {
         //@ts-ignore
        const id=req.userId

        const user=await pc.user.findUnique({where:{id:Number(id)}})

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return
    }
    res.status(200).json({success:true});
    } catch (error) {
          res.status(500).json({error:error})
        console.log(error)
    }
})
router.post("/room/create", authMiddleware, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;

    // Find active (WAITING/ACTIVE) room owned or joined by user
    const activeRoom = await pc.room.findFirst({
      where: {
        status: { in: ["WAITING", "ACTIVE","FULL"] },
        OR: [
          { createdById: userId },
          { joinedById: userId },
        ],
      },
    });

    if (activeRoom) {
       res.status(400).json({
        message: "You are already in an active room. Please finish or leave that match before creating a new one.",
        success: false,
        roomId: activeRoom.code,
      });
      return
    }

    // Try to reuse cancelled room (optional UX feature)
    const cancelledRoom = await pc.room.findFirst({
      where: {  status: "CANCELLED" },
    });

    let roomId: string;

    if (cancelledRoom) {
    await pc.room.update({
      where: { code: cancelledRoom.code },
      data: {
        status: "WAITING",
        createdById: userId,
        joinedById: null,
      }
    });
      roomId = cancelledRoom.code;
    } else {
      roomId = nanoid(8);
      await pc.room.create({
        data: {
          createdById: userId,
          code: roomId,
          status: "WAITING",
        },
      });
    }

    res.status(200).json({
      roomId,
      success: true,
      room: {
        code: roomId,
        status: "WAITING",
        playerCount: 1,
        isCreator: true,
        currentUserId: userId,
        opponentId: null,
        opponentName: null,
        gameId: null
      }
    });
    return
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});


router.post('/room/join',authMiddleware,async(req:Request,res:Response)=>{
    try {
        const {roomId}=req.body
        //@ts-ignore
        const userId=req.userId
        const room=await pc.room.findUnique({
            where:{code:roomId},include:{
                createdBy:true,
                game:true,
                joinedBy:true,
            
            }
        })

        if(!room){
            res.status(404).json({message: "Room does not exist or roomId is incorrect",success:false})
            return
        }
       
       if (room.createdById === Number(userId)) {
            res.status(200).json({ 
                success: true,
                message: "Welcome back to your room",
                room: {
                    code: room.code,
                    status: room.status,
                    playerCount: room.joinedById ? 2 : 1,
                    isCreator: true,  // ✅ Frontend knows they're the creator
                    currentUserId: userId,
                    opponentId: room.joinedById,
                    opponentName: room.joinedBy?.name || null,
                    createdBy: room.createdBy,
                    joinedBy: room.joinedBy
                }
            });
            return;
        }
        if(room.joinedById === Number(userId)){
        res.status(200).json({
            success:true,
            message:"You have already joined this room",
            room: {
              code:room.code,
              status: room.status,
              playerCount: 2,
              isCreator:false,
              opponentId:room.createdById,
              opponentName:room.createdBy.name,
              createdBy: room.createdBy,
              joinedBy: room.joinedBy
            }
        })
        return;
        }
        if(room.joinedBy){
            res.status(404).json({message: "Room is already full and match is started",success:false})
            return
            
        }
          
        const updatedRoom = await pc.room.update({
            where:{id:room.id},
            data:{
                joinedById:userId,status:"FULL"
            },
            include: {
                createdBy: {
                    select: { id: true, name: true }
                },
                joinedBy: {
                    select: { id: true, name: true }
                }
            }
        })
        
        // Notify room creator via WebSocket if they're connected
        // We do this in a try-catch to avoid blocking the response
        try {
            roomManager.roomJoined(room.createdById, userId)
        } catch (error) {
            console.error("Error notifying room creator:", error)
            // Don't block the response if WebSocket notification fails
        }
        
        res.status(200).json({
            success:true,
            message:"Room joined match can be started",
            room: {
                code: updatedRoom.code,
                status: "FULL",
                playerCount: 2,
                isCreator: false,
                currentUserId: userId,
                opponentId: updatedRoom.createdById,
                opponentName: updatedRoom.createdBy.name,
                createdBy: updatedRoom.createdBy,
                joinedBy: updatedRoom.joinedBy
            }
        })
        return
    } catch (error) {
        res.status(500).json({message:"Internal Server error"})
        console.log(error)
    }
})
// router.post("/room/leave", authMiddleware, async (req: Request, res: Response) => {
//   try {
//     // @ts-ignore
//     const userId = req.userId;
//     const { code } = req.body;

//     const room = await pc.room.findUnique({
//       where: { code },
//       include: { game: true },
//     });

//     if (!room) {
//       res.status(404).json({ message: "Room doesn't exist or code incorrect", success: false });
//         return
//     }

//     if (userId !== room.createdById && userId !== room.joinedById) {
//        res.status(403).json({ message: "You are not part of this room", success: false });
//        return
//     }

//     let updatedRoom;

//     if (room.status === "WAITING") {
//       updatedRoom = await pc.room.update({
//         where: { id: room.id },
//         data: { status: "CANCELLED" },
//       });

//        res.status(200).json({
//         message: "Room cancelled successfully.",
//         success: true,
//         room: updatedRoom,
//       });
//       return
//     }

  
//     // 3️⃣ Already finished — no changes
//      res.status(200).json({
//       message: "Room is already finished or cancelled.",
//       success: true,
//       room,
//     });
//     return
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       success: false,
//     });
//   }
// });

router.patch('/room/:roomId/status',async (req:Request,res:Response) => {
  try {
  const {roomId}=req.body
  const room=await pc.room.findFirst({where:{code:roomId}})
  if(!room){
    res.status(404).json({message:"Room Code Incorrect! Room Does Not Exist",success:false})
    return
  }
  await pc.room.update({where:{id:room.id},data:{
    status:"CANCELLED",
    joinedById:null
  }})
  res.status(200).json({success:true,message:"Room Is cancelled successfully"})
  return
  } catch (error) {
     console.error(error);
    res.status(500).json({
       message: "Internal Server Error",
       success: false,
     });
  }
})


export {router}