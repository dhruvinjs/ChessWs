import express, { Request, Response } from 'express'

const gameRouter=express.Router()
gameRouter.post('/:userId/cookie', (req:Request, res:Response) => {
  res.cookie('guestId', req.params.userId, {
    httpOnly: true,
    secure:true,
    maxAge: 30 * 60 * 1000, // 3
    path: '/'
  });
  res.sendStatus(204);
});
export {gameRouter}