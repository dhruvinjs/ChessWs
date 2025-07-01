import { WebSocket } from 'ws';
import {redis} from '../redisClient'
import { Chess } from 'chess.js';

export async function insertPlayerInQueue(playerId:string){
    const queue=await redis.lRange(process.env.MATCHMAKING_KEY as string,0,-1);
    if (!queue.includes(playerId)){
        await redis.lPush(process.env.MATCHMAKING_KEY as string,playerId)
    }
}

export async function matchingPlayer(currentPlayerId:string){
    const queue=await redis.lRange(process.env.MATCHMAKING_KEY as string,0,-1);
    const waitingPlayerId=queue.find(id=>id!=currentPlayerId)
    if(!waitingPlayerId) return null;
    await redis.lRem(process.env.MATCHMAKING_KEY as string,1,waitingPlayerId)
    await redis.lRem(process.env.MATCHMAKING_KEY as string,1,currentPlayerId)

     return { waitingPlayerId };

}
export async function removePlayerFromQueue(playerId:string) {
        await redis.lRem(process.env.MATCHMAKING_KEY as string,0,playerId)
}