import { Chess } from "chess.js";
import { CHECK, ILLEGAL_ROOM_MOVE, INIT_GAME, LEAVE_ROOM, OPP_ROOM_RECONNECTED, ROOM_CHAT, ROOM_DRAW, ROOM_GAME_ACTIVE, ROOM_GAME_NOT_FOUND, ROOM_GAME_OVER, ROOM_LEAVE_GAME, ROOM_LEFT, ROOM_MOVE, ROOM_NOT_FOUND, ROOM_OPPONENT_LEFT, ROOM_RECONNECT, SERVER_ERROR, WRONG_PLAYER_MOVE } from "../messages";
import pc from "../prismaClient";
import { redis } from "../redisClient";
import { Move } from "./GameServices";
import { roomManager } from "../Classes/RoomManager";
import { WebSocket } from "ws";


export async function getRoomGameState(gameId: number) {
  const gameExists = await redis.hGetAll(`room-game:${gameId}`) as Record<string, string>;
  
  const movesRaw = await redis.lRange(`room-game:${gameId}:moves`, 0, -1);
  const moves = movesRaw.map(m => JSON.parse(m));
  
  const chatRaw = await redis.lRange(`room-game:${gameId}:chat`, 0, -1);
  const chat = chatRaw.map(c => JSON.parse(c));

  if (!gameExists || Object.keys(gameExists).length === 0) {
    const restoredGame = await roomManager.restoreGameFromDB(gameId);
    if (!restoredGame) {
      return null;
    }
    return restoredGame;
  }

  return {
    user1: Number(gameExists.user1),
    user2: Number(gameExists.user2),
    fen: gameExists.fen,
    whiteTimer: Number(gameExists.whiteTimer),
    blackTimer: Number(gameExists.blackTimer),
    moves: moves,
    moveCount: Number(gameExists.moveCount),
    status: gameExists.status,
    chat: chat  // FIX: Return actual chat array
  };
}

export async function handleRoomMove(userId:Number,userSocket:WebSocket,move:Move,gameId:number,socketManager:Map<number,WebSocket>) {
    const existingGame=await getRoomGameState(gameId)
    if(!existingGame){
        userSocket.send(JSON.stringify({
            type:ROOM_GAME_NOT_FOUND,
            payload:{message:"Game Message Not Found"}
        }))
        return
    }
    const chess=new Chess(existingGame.fen)
    const turn=existingGame.fen.split(" ")[1]
    const movingPlayerColor = turn === "w" ? "w" : "b";
    const opponentId=userId === existingGame.user1 ? existingGame.user2 :existingGame.user1
            if(!opponentId){
            console.log("Opponent Id Error")
            return null
        }

    if ((turn === "w" && existingGame.user1 !== userId) || 
    (turn ==="b" && existingGame.user2 !== userId)){
        const message = JSON.stringify({
                    type: WRONG_PLAYER_MOVE,
                    payload: {
                        message: "Not your turn"
                    }
                });
        userSocket.send(message);
        return null;
    }

    try {
        chess.move({
            to:move.to,
            from:move.from,
        })
            await redis.rPush(`room-game:${gameId}:moves`, JSON.stringify(move));
            await redis.hSet(`room-game:${gameId}`, "fen", chess.fen());
            const updatedMoveCnt=await redis.hIncrBy(`room-game:${gameId}`,"moveCount",1)
            if(updatedMoveCnt % roomManager.MOVES_BEFORE_SAVE === 0){
               const updatedGameData = await redis.hGetAll(`room-game:${gameId}`) as Record<string, string>;
                
                await saveGameProgress(gameId,updatedGameData,updatedGameData.currentFen,movingPlayerColor)
            }

        } catch (error) {
         console.error("Error processing Room-move:", error);
            userSocket.send(JSON.stringify({
                type: ILLEGAL_ROOM_MOVE,
                payload: { message: "Server error while processing move or illegal move attempted" }
            }));
            return;
    }
           const opponentSocket=socketManager.get(opponentId)
 
        if (chess.isStalemate()) {
           await handleRoomDraw(userSocket, opponentSocket, gameId, "Draw by stalemate");
           return;
        }
        else if(chess.isInsufficientMaterial()){
        await handleRoomDraw(userSocket, opponentSocket, gameId, "Draw due to insufficient material");
        return;
        }
        else if(chess.isThreefoldRepetition()){
        await handleRoomDraw(userSocket, opponentSocket, gameId, "Draw by threefold repetition");
          return;    
        }
        else if(chess.isDraw()){
       await handleRoomDraw(userSocket, opponentSocket, gameId, "Draw by 50-move rule");
       return;    
        }
        // Game Over logic
        if (chess.isGameOver()) {
        const winnerColor = chess.turn() === "w" ? "b" : "w";
        const loserColor=winnerColor === "b" ? "w" : "b" 
        const winnerId = winnerColor === "w" ? existingGame.user1 : existingGame.user2;
        const loserId = winnerColor === "b" ? existingGame.user2 : existingGame.user1;
        
    const finalGameData = await redis.hGetAll(`room-game:${gameId}`) as Record<string, string>;
    await saveGameProgress(gameId, finalGameData, chess.fen(), movingPlayerColor);
    

      
        const winnerSocket = socketManager.get(winnerId);
        const loserSocket = socketManager.get(loserId);
        await redis.hSet(`room-game:${gameId}`, {
            status: ROOM_GAME_OVER,
            winner: winnerColor
        });
        await redis.expire(`room-game:${gameId}`, 86400);

          await pc.$transaction([
      pc.game.update({
        where: { id: gameId },
        data: {
          winnerId,
          loserId,
          draw: false,
            endedAt:new Date(Date.now())
        },
      }),
      pc.room.update({
        where: { gameId },
        data: {
          status: "FINISHED",

        },
      }),
    ]);
        // --- Construct clear payloads ---
        const winnerMessage = JSON.stringify({
            type: ROOM_GAME_OVER,
            payload: {
                result: "win",
                message: "🏆 Congratulations! You’ve won the game.",
                winner: winnerColor,
                loser:loserColor
            },
        });
    
        const loserMessage = JSON.stringify({
            type: ROOM_GAME_OVER,
            payload: {
                result: "lose",
                message: "💔 Game over. You’ve been checkmated.",
                winner: winnerColor,
                loser:loserColor
            },
        });
    
        winnerSocket?.send(winnerMessage);
        loserSocket?.send(loserMessage);
    
        return;
    }
    
    const validMoves= await provideRoomValidMove(chess.fen())
    
        const oppPayload={
                    type: ROOM_MOVE,
                    payload: {
                    move,
                    turn: chess.turn(),
                    fen: chess.fen(),
                    validMoves
                    }
                }
                const currentPlayerPayload={
                    type:ROOM_MOVE,
                    payload:{
                    move,
                    turn: chess.turn(),
                    fen: chess.fen(),
                    validMoves:[]
                    }
                }

                        
        userSocket.send(JSON.stringify(currentPlayerPayload));
        opponentSocket?.send(JSON.stringify(oppPayload));
    
          
                
        if (chess.isCheck()) {
            const attackerCheckMessage = {
                type: CHECK,
                payload: {
                message: "Check! You\'ve put the opposing King under fire. The pressure is on them now!"
                }
            };
    
            const defenderCheckMessage = {
            type: CHECK,
            payload: {
                message: "You are in Check! Defend your King immediately. Your move."
            }
            };
    
            userSocket.send(JSON.stringify(attackerCheckMessage));
            opponentSocket?.send(JSON.stringify(defenderCheckMessage));
    
            return;
        }
        

}


export async function handleRoomDraw(
  userSocket: WebSocket,
  opponentSocket: WebSocket | undefined,
  gameId: number,
  reason: string
): Promise<void> {
  try {
    // --- Construct the draw message ---
    const message = JSON.stringify({
      type: ROOM_DRAW,
      payload: { reason },
    });

    userSocket.send(message);
    opponentSocket?.send(message);

    await redis.hSet(`room-game:${gameId}`, {
      status: ROOM_GAME_OVER,
      winner: "draw",
      drawReason: reason,
    });

    await redis.expire(`room-game:${gameId}`, 86400);

    console.log(`GameDraw ${gameId}: ${reason}`);
  } catch (error) {
    console.error(`Error handling draw for game ${gameId}:`, error);
  }
}

export async function handleRoomReconnection(userId:number, userSocket:WebSocket, gameId:number,roomSocketManager:Map<number,WebSocket>) {
    const existingGame=await getRoomGameState(gameId)

    if(!existingGame){
        userSocket.send(JSON.stringify({
            type:ROOM_GAME_OVER,
            payload:{message:"The Game You are looking for is over"}
        }))
        return 
    }
    const opponentId=userId === existingGame.user1 ? existingGame.user2 : existingGame.user1
    const opponentSocket=roomSocketManager.get(opponentId)
    opponentSocket?.send(JSON.stringify({
        type:OPP_ROOM_RECONNECTED,
        payload:{message:"opponent reconnected to the game"}
    }))
    const chatArr=existingGame.chat ? existingGame.chat : []
    await redis.sAdd("room-active-games", gameId.toString());

    userSocket.send(JSON.stringify({
        type:ROOM_RECONNECT,
        payload:{
    user1: Number(existingGame.user1),
    user2: Number(existingGame.user2),
    fen: existingGame.fen,
    whiteTimer: Number(existingGame.whiteTimer),
    blackTimer: Number(existingGame.blackTimer),
    moves: existingGame.moves,
    moveCount: Number(existingGame.moveCount),
    status: existingGame.status,
    chat: chatArr
        }
    }))
    console.log(`Both players reconnected to room-game:${gameId}, restarting timers...`);
    
    roomManager.startRoomTimer()

}

export async function handleRoomChat(userId:number , 
    userSocket:WebSocket,
    gameId:number,
    message:string,
    roomSocketManager:Map<number,WebSocket>) {
    try {
    const existingGame=await getRoomGameState(gameId)

    if(!existingGame){
        userSocket.send(JSON.stringify({
            type:ROOM_GAME_OVER,
            payload:{message:"The Game You are looking for is over"}
        }))
        return 
    }
    const opponentId=userId === existingGame.user1 ? existingGame.user2 : existingGame.user1
    const opponentSocket=roomSocketManager.get(opponentId)
    await redis.rPush(`room-game:${gameId}:chat`,
        JSON.stringify({
            sender:userId,
            message,
            timestamp:Date.now()
        })
    )
    opponentSocket?.send(JSON.stringify({
        type:ROOM_CHAT,
        payload:{
            message:message,
            sender:userId,
            timestamp:Date.now()
        }
    }))
    
    userSocket?.send(JSON.stringify({
        type:ROOM_CHAT,
        payload:{
            message:message,
            sender:userId,
            timestamp:Date.now()
        }
    }))


    } catch (error) {
        console.log("Error in handleRoomChat: ",error)
        userSocket.send(JSON.stringify({
            type:SERVER_ERROR,
            payload:{
                message:"Server Error, Please send the message again!"
            }
        }))
    }
}

export function validatePayload(type:string,payload:any):string | null{
    if(!payload){
        return "Missing Payload Object"
    }
    switch(type){
        case INIT_GAME:
            if (!payload.roomId) return "Missing roomId";
            break;
        case ROOM_RECONNECT:
            if(!payload.roomGameId) return "Missing GameId";
            break;
        case ROOM_MOVE:
            if(!payload.to || !payload.from ||!payload.roomGameId) return "Missing Move or GameId";
            break;
        case ROOM_CHAT:
            if(!payload.message || !payload.roomGameId) return "Missing Message or GameId";
            break;
        case ROOM_LEAVE_GAME:
          if (!payload.roomGameId) return "Missing field: gameId";
          break;
        case LEAVE_ROOM:
            if(!payload.roomId) return "Missing Room Code";
            break;
        default:
            return null
    }
    return null


}

export async function handleRoomGameLeave(
  userId: number,
  userSocket: WebSocket,
  gameId: number,
  socketManager: Map<number, WebSocket>
) {
  try {
    // --- Fetch room and game details ---
    const room = await pc.room.findFirst({
      where: { gameId },
      include: { game: true },
    });

    if (!room) {
      userSocket.send(JSON.stringify({
        type: ROOM_NOT_FOUND,
        payload: { message: "Room not found" },
      }));
      return;
    }

    if (room.status !== "ACTIVE") {
      // Not an active game, ignore this handler
      userSocket.send(JSON.stringify({
        type: SERVER_ERROR,
        payload: { message: "No active game to leave" },
      }));
      return;
    }

    // --- Determine roles ---
    const isCreator = room.createdById === userId;
    const isJoiner = room.joinedById === userId;
    const winnerId = isCreator ? room.joinedById : room.createdById;

    // --- Fetch final Redis data (if exists) ---
    const finalGameData = await redis.hGetAll(`room-game:${gameId}`) as Record<string, string>;

    if (finalGameData && Object.keys(finalGameData).length > 0) {
      const movesRaw = await redis.lRange(`room-game:${gameId}:moves`, 0, -1);
      const chatRaw = await redis.lRange(`room-game:${gameId}:chat`, 0, -1);

      const moves = movesRaw.map(m => JSON.parse(m));
      const chat = chatRaw.map(c => JSON.parse(c));

      // --- Persist final game snapshot ---
      await pc.game.update({
        where: { id: gameId },
        data: {
          winnerId,
          loserId: userId,
          draw: false,
          endedAt: new Date(),
          moves,
          chat,
          currentFen: finalGameData.fen,
        },
      });
    } else {
      // --- No redis data, fallback to marking result ---
      await pc.game.update({
        where: { id: gameId },
        data: {
          winnerId,
          loserId: userId,
          draw: false,
          endedAt: new Date(),
        },
      });
    }

    // --- Update room to finished ---
    await pc.room.update({
      where: { id: room.id },
      data: { status: "FINISHED" },
    });

    // --- Notify sockets ---
    const oppSocket = socketManager.get(winnerId!);
    oppSocket?.send(JSON.stringify({
      type: ROOM_OPPONENT_LEFT,
      payload: { message: "Opponent left - you win!" },
    }));

    userSocket.send(JSON.stringify({
      type: ROOM_GAME_OVER,
      payload: { message: "You left the game." },
    }));

    // --- Redis cleanup ---
    await redis.sRem("room-active-games", gameId.toString());
    await redis.del(`room-game:${gameId}`);
    await redis.del(`room-game:${gameId}:moves`);
    await redis.del(`room-game:${gameId}:chat`);

  } catch (error) {
    console.error("Error in handleRoomGameLeave:", error);
  }
}

export async function handleRoomLeave(userId:number,roomCode:string,userSocket:WebSocket,roomSocketManager:Map<number,WebSocket>){
    try {
        const room=await pc.room.findFirst({
            where:{
                code:roomCode
            }
        })
      if (!room) {
      userSocket.send(JSON.stringify({
        type: ROOM_NOT_FOUND,
        payload: { message: "Room not found" },
      }));
      return;
    }
    if(room.status === "WAITING"){
         if(userId !== room.createdById){
            userSocket.send(JSON.stringify({
            type:SERVER_ERROR,
            payload:{message:"You Did not created this room"}       
            }))
            return
        }
        await pc.room.update({
            where:{
                id:room.id
            },
            data:{
                status:"CANCELLED"
            }
        })
        userSocket.send(JSON.stringify({
            type:ROOM_LEFT,
            payload:{
                message:"Room Left Successfully"
            }
        }))
        return
    }
    const isCreator = room.createdById === userId;
    const isJoiner = room.joinedById === userId;
    const opponentId = isCreator ? room.joinedById : room.createdById;

    if(room.status === "FULL" && isCreator ){
        await pc.room.update({
            where:{id:room.id},
            data:{
                joinedById:null,
                status:"CANCELLED"
            }
        })
      
      
      
        if (opponentId) {
        const oppSocket = roomSocketManager.get(opponentId);
        oppSocket?.send(JSON.stringify({
          type: ROOM_OPPONENT_LEFT,
          payload: { message: "Room creator left. Room cancelled." },
        }));
      }        

       userSocket.send(JSON.stringify({
        type: ROOM_GAME_OVER,
        payload: { message: "You left before game start." },
      }));


}
else if(room.status === "FULL" && isJoiner){
     await pc.room.update({
            where:{id:room.id},
            data:{
                joinedById:null,
                status:"WAITING"
            }
        })
        const creatorSocket = roomSocketManager.get(room.createdById);
      creatorSocket?.send(JSON.stringify({
        type: ROOM_OPPONENT_LEFT,
        payload: { message: "Opponent left. Waiting for new player..." },
      }));

       userSocket.send(JSON.stringify({
        type: ROOM_GAME_OVER,
        payload: { message: "You left before game start." },
      }));

}



    } catch (error) {
        
    }
}

async function provideRoomValidMove(fen:string) {
            const chess=new Chess(fen)
                    const moves=chess.moves({ verbose: true }); 
        // console.log(moves)
        const validMoves=moves.map(m=>({
            from:m.from,
            to:m.to,
            promotion:m.promotion ?? null
        }))


        return validMoves


    
}
async function saveGameProgress(gameId:number,game:Record<string,string>,currentFen:string,lastMoveBy:'w'|'b'){
    try {  
        const movesRaw=await redis.lRange(`room-game:${gameId}:moves`,0,-1)
        const moves=movesRaw.map(m=>JSON.parse(m))
        const chatRaw = await redis.lRange(`room-game:${gameId}:chat`, 0, -1);
        const chat = chatRaw.map(c => JSON.parse(c));
        await pc.$transaction([
            pc.game.update({where:{id:gameId},data:{
                moves:moves,
                lastMoveBy:lastMoveBy,
                lastMoveAt:new Date(),
                whiteTimeLeft:Number(game.whiteTimer),
                blackTimeLeft:Number(game.blackTimer),
                chat:chat,
                currentFen:currentFen
            }})
        ])
        console.log(`Game ${gameId}: Progress saved to DB at move count ${moves.length}`);
    } catch (error) {
        console.log(`Game: ${gameId} Progress Error: `,error);
        return null
    }

}

export async function resetCancelledRoom(roomCode: string, newCreatorId: number) {
  try {
    const room = await pc.room.findUnique({
      where: { code: roomCode }
    });

    if (!room || room.status !== "CANCELLED") {
      return null;
    }

    // Reset room for reuse
    await pc.room.update({
      where: { code: roomCode },
      data: {
        status: "WAITING",
        createdById: newCreatorId,
        joinedById: null,
        gameId: null
      }
    });

    return room;
  } catch (error) {
    console.error("Error resetting cancelled room:", error);
    return null;
  }
}