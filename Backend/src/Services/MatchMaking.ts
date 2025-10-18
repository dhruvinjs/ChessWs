import { WebSocket } from 'ws';
import {redis} from '../redisClient'
import { Chess } from 'chess.js';

const MATCHMAKING_KEY = process.env.MATCHMAKING_KEY || 'matchmaking:queue';

export async function insertPlayerInQueue(playerId:string){
    try {
        const inserted=await redis.sAdd(MATCHMAKING_KEY,playerId)
        if(inserted){
            console.log(`added ${playerId} in queue`)
            return true
        }else{
            console.log(`insertion in queue operation failed:${playerId}`)
            return false
        }
    } catch (error) {
        console.error('Error inserting player in queue:', error);
        return false;
    }
}

export async function matchingPlayer(currentPlayerId:string){
     const queue=await redis.sMembers(MATCHMAKING_KEY);
    //Find basically returns the first id not matching to currentPlayerId
     const waitingPlayerId=queue.find(id=>id!=currentPlayerId)
        if (!waitingPlayerId) {
            console.log('No opponent found in queue');
            return null;
        }
    const transaction=redis.multi()
     transaction.sRem(MATCHMAKING_KEY,currentPlayerId)
     transaction.sRem(MATCHMAKING_KEY,waitingPlayerId)

     const results=await transaction.exec()
     if (results && results[0] && results[1]) {
            console.log(`Match found: ${currentPlayerId} vs ${waitingPlayerId}`);
            return { waitingPlayerId };
        } else {
            console.log('Failed to remove players from queue atomically');
            return null;
        }

}

export async function removePlayerFromQueue(playerId: string): Promise<boolean> {
    try {
        const removed = await redis.sRem(MATCHMAKING_KEY, playerId);
        
        if (removed) {
            console.log(`Player ${playerId} removed from matchmaking queue`);
            return true;
        } else {
            console.log(`Player ${playerId} was not in queue`);
            return false;
        }
    } catch (error) {
        console.error('Error removing player from queue:', error);
        return false;
    }
}
export async function clearQueue(){
    try {
        await redis.del(MATCHMAKING_KEY)
        return true
    } catch (error) {
          console.error('Error in removing queue:', error);
        return false;
    }
}

