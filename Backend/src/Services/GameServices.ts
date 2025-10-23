import { WebSocket } from 'ws';
import { 
    CHECK, 
    DISCONNECTED, 
    DRAW_ACCEPTED, 
    DRAW_OFFERED, 
    DRAW_REJECTED, 
    GAME_ACTIVE, 
    GAME_NOT_FOUND, 
    GAME_OVER, 
    MOVE, 
    OFFER_DRAW, 
    OPP_RECONNECTED, 
    RECONNECT, 
    SERVER_ERROR, 
    STALEMATE, 
    WRONG_PLAYER_MOVE 
} from '../messages';
import { redis } from '../redisClient';
import { Chess, PieceSymbol, Square } from 'chess.js';
import { gameManager } from '../Classes/GameManager';

//This Method Will Help To return the gameState to reconnected player
export async function getGameState(gameId: string) {
    const existingGame = await redis.hGetAll(`game:${gameId}`) as Record<string, string>;
    console.log(existingGame);
    if (Object.keys(existingGame).length === 0) return null;
    const board = new Chess(existingGame.fen);
    const movesRaw = await redis.lRange(`game:${gameId}:moves`, 0, -1);
  const moves = movesRaw.map(m => JSON.parse(m));
    return {
        user1: existingGame.user1,
        user2: existingGame.user2,
        board,
        status: existingGame.status,
        fen: existingGame.fen,
        turn: board.turn(),
        whiteTimer: existingGame.whiteTimer,
        blackTimer: existingGame.blackTimer,
        gameStarted: existingGame.status === GAME_ACTIVE,
        gameEnded:existingGame.status===GAME_OVER,
        moves
    };
}

export async function makeMove(
    socket: WebSocket,
    move: { from: string; to: string; promotion?: string },
    gameId: string,
    playerId: string,
    socketMap: Map<string, WebSocket>,
) {
    const gameState = await getGameState(gameId);

    if (!gameState) {
        socket.send(JSON.stringify({
            type: GAME_NOT_FOUND,
            payload: {
                message: "Game Not Found"
            }
        }));
        return;
    }

    const isWhiteTurn = gameState.turn === "w";
    if ((isWhiteTurn && gameState.user1 !== playerId) || 
        (!isWhiteTurn && gameState?.user2 !== playerId)) 
        {
        console.log("Wrong player move");
        const message = JSON.stringify({
            type: WRONG_PLAYER_MOVE,
            payload: {
                message: "Not your turn"
            }
        });
        socket.send(message);
        return null;
    }

    
    
    const user1Socket = socketMap.get(gameState.user1);
    const user2Socket = socketMap.get(gameState.user2);
    if (!user1Socket || !user2Socket) {
        console.log("One or both players disconnected");
        return;
    }

    const board = gameState.board;

        try {
                board.move({
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion || "q"
                });

            await redis.rPush(`game:${gameId}:moves`, JSON.stringify(move));
            await redis.hSet(`game:${gameId}`, "fen", board.fen());
            

        } catch (err) {
            //if illegal moves is attempted direct this block will be executed 
            console.error("Error processing move:", err);
            socket.send(JSON.stringify({
                type: SERVER_ERROR,
                payload: { message: "Server error while processing move or illegal move attempted" }
            }));
            return;
        }
  

    if (board.isStalemate()) {
        const message = JSON.stringify({
            type: STALEMATE,
            payload: {
                reason: "Game over, its a draw"
            }
    });

        user1Socket.send(message);
        user2Socket.send(message);

        await redis.hSet(`game:${gameId}`, {
            status: GAME_OVER,
            winner: "draw (stalemate)"
        });
        await redis.expire(`game:${gameId}`, 600);

        return;
    }

    // Game Over logic
    if (board.isGameOver()) {
    const winnerColor = board.turn() === "w" ? "b" : "w";
    const winnerId = winnerColor === "w" ? gameState.user1 : gameState.user2;
    const loserId = winnerColor === "b" ? gameState.user2 : gameState.user1;
    const loserColor=winnerColor === "b" ? "w" : "b" 
    const winnerSocket = socketMap.get(winnerId);
    const loserSocket = socketMap.get(loserId);

    // --- Redis update ---
    await redis.hSet(`game:${gameId}`, {
        status: GAME_OVER,
        winner: winnerColor
    });
    await redis.expire(`game:${gameId}`, 600);

    // --- Construct clear payloads ---
    const winnerMessage = JSON.stringify({
        type: GAME_OVER,
        payload: {
            result: "win",
            message: "🏆 Congratulations! You’ve won the game.",
            winner: winnerColor,
            loser:loserColor
        },
    });

    const loserMessage = JSON.stringify({
        type: GAME_OVER,
        payload: {
            result: "lose",
            message: "💔 Game over. You’ve been checkmated.",
            winner: winnerColor,
            loser:loserColor
        },
    });

    // --- Send to each player ---
    winnerSocket?.send(winnerMessage);
    loserSocket?.send(loserMessage);

    return;
}
    const validMoves= await provideValidMoves(gameId)

    const oppPayload={
                type: MOVE,
                payload: {
                move,
                turn: board.turn(),
                fen: board.fen(),
                validMoves
                }
            }
            const currentPlayerPayload={
                type:MOVE,
                payload:{
                move,
                turn: board.turn(),
                fen: board.fen(),
                validMoves:[]
                }
            }
    const currentPlayerSocket = playerId === gameState.user1 ? user1Socket : user2Socket;
    const opponentSocket = playerId === gameState.user1 ? user2Socket : user1Socket;

    currentPlayerSocket.send(JSON.stringify(currentPlayerPayload));
    opponentSocket.send(JSON.stringify(oppPayload));

      
            
    if (board.isCheck()) {
        const attackerCheckMessage = {
            type: CHECK,
            payload: {
            message: "Check! You've put the opposing King under fire. The pressure is on them now!"
            }
        };

        const defenderCheckMessage = {
        type: CHECK,
        payload: {
            message: "You are in Check! Defend your King immediately. Your move."
        }
        };

        currentPlayerSocket.send(JSON.stringify(attackerCheckMessage));
        opponentSocket.send(JSON.stringify(defenderCheckMessage));

        return;
    }

    
  
}


export async function reconnectPlayer(playerId: string, gameId: string, socket: WebSocket, socketMap: Map<string, WebSocket>) {
    const game = await getGameState(gameId);
    console.log("reconnection player");
    if (!game) {
        const message={
            type:GAME_NOT_FOUND,
            payload:{
                message:"Previous Game Not found Internal Server Error "
            }
        }
        socket.send(JSON.stringify(message))
        return;
    }
    console.log(game.status)
    console.log("GameEnded: ",game.gameEnded)
    if (game.gameEnded) {
        const message={
            type:GAME_OVER,
            payload:{
                message:"Previous Game Over "
            }
        }
        socket.send(JSON.stringify(message))
        return;
    }
    if(game.status===DISCONNECTED){
        const timeElapsed=Date.now()-Number(await redis.hGet(`game:${gameId}`,"timestamp"))
        // const disconnectedBy = await redis.hGet(`game:${gameId}`, "disconnectedBy");
        if(timeElapsed > 60* 1000){
            socket.send(JSON.stringify({
                type:GAME_NOT_FOUND,
                payload:{
                    message:"Disconnected For Too Long"
                }
            }))
            return
        }
    }

    await redis.hSet(`game:${gameId}`, { status: GAME_ACTIVE });
    await redis.sAdd("active-games", gameId);
    

    const color = playerId === game.user1 ? 'w' : 'b';
    const opponentId = playerId === game.user1 ? game.user2 : game.user1;

    console.log("sending the current moves to ", playerId);
    const validMoves = await provideValidMoves(gameId);

    socket.send(JSON.stringify({
        type: RECONNECT,
        payload: {
                fen: game.board.fen(),
                color: color,
                turn: game.board.turn(),
                opponentId,
                gameId,
                whiteTimer:game.whiteTimer,
                blackTimer:game.blackTimer,
                validMoves: validMoves || [],
                moves:game.moves,
                status:game.status
            }
        }));

        const opponentSocket = socketMap.get(opponentId);
        gameManager.startTimer()
        console.log("Sending reconnect notice to:", opponentId, socketMap.has(opponentId));

        opponentSocket?.send(JSON.stringify({
            type: OPP_RECONNECTED,
            payload: {
                message: "Opponent reconnected"
            }
        }));

    }

export async function getGamesCount() {
    const count = await redis.get("guest:games:total");
    console.log(count);
    return count ? parseInt(count) : 0;
}
export async function playerLeft(
  playerId: string,
  gameId: string,
  socket: WebSocket,
  socketMap: Map<string, WebSocket>
) {
  const game = await getGameState(gameId);
  
  if (!game) {
    console.log("Game Not found");
    socket.send(
      JSON.stringify({
        type: GAME_NOT_FOUND,
        payload: {
          message: "Cannot leave game due to game not found",
        },
      })
    );
    return;
  }

  // Check if game is already over
  if (game.gameEnded) {
    console.log("Game already over, ignoring player left");
    return;
  }

  console.log("In player left method");

  const winnerColor = playerId === game.user1 ? "b" : "w";
  const opponentId = playerId === game.user1 ? game.user2 : game.user1;
  const loserColor = winnerColor === "b" ? "w" : "b";
  const winnerSocket = socketMap.get(opponentId);
  const loserSocket = socketMap.get(playerId);

  const winnerMessage = {
    type: GAME_OVER,
    payload: {
      result: "win",
      message: "Player Left You Won!",
      winner: winnerColor,
      loser: loserColor,
    },
  };

  const loserMessage = {
    type: GAME_OVER,
    payload: {
      result: "lose",
      message: "You Lost",
      winner: winnerColor,
      loser: loserColor,
    },
  };

  // ✅ CRITICAL FIX: Use individual hSet calls in transaction
  // Object syntax doesn't work properly in Redis MULTI
  try {
    await redis
      .multi()
      .hSet(`game:${gameId}`, "status", GAME_OVER)
      .hSet(`game:${gameId}`, "winner", winnerColor)
      .hSet(`game:${gameId}`, "reason", "player_left")
      .expire(`game:${gameId}`, 600)
      .expire(`game:${gameId}:moves`, 600)
      .sRem("active-games", gameId)
      .exec();

    console.log(`✅ Game ${gameId} ended - Status set to GAME_OVER`);
  } catch (error) {
    console.error("Error updating game status:", error);
  }

  // Notify both players
  winnerSocket?.send(JSON.stringify(winnerMessage));
  loserSocket?.send(JSON.stringify(loserMessage));
}


export function calculateTime(lastMoveTime: number) {
    const currentTime = Date.now();
    const elapsed = currentTime - lastMoveTime;

    const ten_min = 10 * 60 * 1000;
    const remainingTime = Math.max(0, ten_min - elapsed);
    const exceeded = elapsed > ten_min;

    return {
        exceeded,
        remainingTime
    };
}


export async function verifyCookie(cookieName:string){
    // const cookie = req.headers.cookieName

    const session = await redis.get(`guest:${cookieName}`)
    if(!session) 
        {   console.log("in verify cookie returning null")
            return null

        }
        console.log('in verify cookie returning true');
    return true

}
interface Move{
    to:Square,from:Square,promotion?:PieceSymbol|null
}
export type Moves=Move[]
export async function provideValidMoves(gameId:string):Promise<Moves | null> {
        const gameState=await getGameState(gameId)
        if(!gameState?.fen){
            console.log("Fen Missing in Game State IN provideMove")
            return null
        }   
        const chess=new Chess(gameState.fen)

        const moves=chess.moves({ verbose: true }); 
        // console.log(moves)
        const validMoves=moves.map(m=>({
            from:m.from,
            to:m.to,
            promotion:m.promotion ?? null
        }))


        return validMoves

}

export async function offerDraw(playerId:string,gameId:string,offerSenderSocket:WebSocket,socketMap:Map<string,WebSocket>) {
    const game=await getGameState(gameId)
    if(!game || game.gameEnded){
       offerSenderSocket.send(JSON.stringify({
        type:GAME_NOT_FOUND,
        payload:{message:"The Game You Are looking for is over"}
       }))
       return
    }    
    // const draw_offer_sender=socketMap.get(playerId)
    const offerCountKey = `drawOffers:${gameId}:${playerId}`;
    const count = await redis.incr(offerCountKey);

    if (count > 3) {
    offerSenderSocket.send(JSON.stringify({
        type: "ERROR",
        payload: { message: "You’ve reached the maximum of 3 draw offers." }
    }));
    await redis.decr(offerCountKey);
    return;
    }

    const offerSenderColor=playerId === game.user1 ? "w" :"b"
        offerSenderSocket?.send(
            JSON.stringify({
                type:OFFER_DRAW,
                payload:{
                    message:"Draw offered to the opponent. Waiting For the response!",
                    offerSenderColor:offerSenderColor
                }
            })
        )
        const draw_offer_recieverId=game.user1 === playerId ? game.user2 : game.user1
        const offerRecieverSocket=socketMap.get(draw_offer_recieverId)
        offerRecieverSocket?.send(JSON.stringify({
            type:DRAW_OFFERED,
            payload:{message:"Draw Offered Do you want to accept it?",offerSenderColor:offerSenderColor}
        }))

}

export async function acceptDraw(playerId:string,gameId:string,offerAcceptedSocket:WebSocket,socketMap:Map<string,WebSocket>) {
    const game=await getGameState(gameId)
     if(!game || game.gameEnded){
       offerAcceptedSocket.send(JSON.stringify({
        type:GAME_NOT_FOUND,
        payload:{message:"The Game You Are looking for is over"}
       }))
       return
    }  

    const offerSenderId=playerId === game.user1 ? game.user2 : game.user1
    const offerSenderSocket=socketMap.get(offerSenderId)
   try {
    await redis
      .multi()
      .hSet(`game:${gameId}`, "status", GAME_OVER)
      .hSet(`game:${gameId}`, "winner", "draw")
      .hSet(`game:${gameId}`, "reason", "draw offer accepted")
      .expire(`game:${gameId}`, 600)
      .expire(`game:${gameId}:moves`, 600)
      .sRem("active-games", gameId)
      .exec();

    console.log(`✅ Game ${gameId} ended - Status set to GAME_OVER`);
  } catch (error) {
    console.error("Error updating game status:", error);
  }
    offerSenderSocket?.send(JSON.stringify({
        type:DRAW_ACCEPTED,
        payload:{
            result:"draw"
        }
    })) 
    offerAcceptedSocket.send(JSON.stringify({
        type:DRAW_ACCEPTED,
        payload:{
            result:"draw"
        }
    }))
}

export async function rejectDraw(playerId:string,gameId:string,offerRejecterSocket:WebSocket,socketMap:Map<string,WebSocket>)  {
  const game=await getGameState(gameId)
  if(!game || game.gameEnded){
       offerRejecterSocket.send(JSON.stringify({
        type:GAME_NOT_FOUND,
        payload:{message:"The Game You Are looking for is over"}
       }))
       return
    }  

 const otherPlayerId=playerId === game.user1 ? game.user2 : game.user1
 const otherPlayerSocket=socketMap.get(otherPlayerId)
 otherPlayerSocket?.send(JSON.stringify({
    type:DRAW_REJECTED,
    payload:{message:"Draw Offer Rejected! Game Should Go On"}
 }))
 offerRejecterSocket.send(JSON.stringify({
        type:DRAW_REJECTED,
        payload:{message:"Draw Rejected Offer sent to the Other Socket!"}

 }))
}