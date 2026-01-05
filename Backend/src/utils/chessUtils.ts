//this file will contain the helper function for chess games

import { Chess } from 'chess.js';
import pc from '../clients/prismaClient';
import { redis } from '../clients/redisClient';
export const MOVE_BEFORE_SAFE = 5;
export const GUEST_MATCHMAKING_KEY =
  process.env.GUEST_MATCHING_KEY || 'guest:game:queue';
export default function provideValidMoves(fen: string) {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  const validMoves = moves.map((m) => ({
    from: m.from,
    to: m.to,
    promotion: m.promotion ?? null,
  }));

  return validMoves;
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function sendMessage(socket: WebSocket, message: JSON) {
  socket.send(JSON.stringify(message));
}
export async function addGuestGamesToUserProfile(
  guestId: string,
  userId: number
) {
  try {
    // Update all games where this guest was player1
    const player1Updates = await pc.guestGames.updateMany({
      where: { player1GuestId: guestId },
      data: { player1UserId: userId },
    });

    // Update all games where this guest was player2
    const player2Updates = await pc.guestGames.updateMany({
      where: { player2GuestId: guestId },
      data: { player2UserId: userId },
    });

    console.log(
      `✅ Linked ${player1Updates.count + player2Updates.count} guest games to user ${userId}`
    );

    return player1Updates.count + player2Updates.count;
  } catch (error) {
    console.error('Error linking guest games to user:', error);
  }
}

// export async function checkQueueForExisingPlayer(playerId:string) {
//   try {

//       //zscore actually checks the exact playerId in priority queue which is implemented using the sorted sets
//       const is_player_in_queue = await redis.zScore(GUEST_MATCHMAKING_KEY,playerId)
//       if(!is_player_in_queue){
//         console.log("Player not in queue")
//         return true;
//       }

//     } catch (error) {
//     console.log("Error IN Check Queue For Existing Player: ".error);
//     return null
//   }
// }
