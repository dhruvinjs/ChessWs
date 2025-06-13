import express, { Request, Response } from 'express'
import {v4 as uuidv4} from "uuid"
const gameRouter=express.Router()
gameRouter.get('/cookie', (req:Request, res:Response) => {
    const existingId = req.cookies?.guestId;
  if (existingId) {
     res.status(200).json({ guestId: existingId });
     return
  }

  const guestId = uuidv4();

  res.cookie('guestId', guestId, {
    httpOnly: true,
    secure:true,
    maxAge: 30 * 60 * 1000, // 3
    path: '/'
  });
  res.sendStatus(204);
});
export {gameRouter}