import { WebSocket } from 'ws';
import { Request } from 'express';
import { 
    CHECK, 
    GAME_ACTIVE, 
    GAME_FOUND, 
    GAME_NOT_FOUND, 
    GAME_OVER, 
    MOVE, 
    OPP_RECONNECTED, 
    SERVER_ERROR, 
    STALEMATE, 
    WRONG_PLAYER_MOVE 
} from '../messages';
import { redis } from '../redisClient';
import { Chess, PieceSymbol, Square } from 'chess.js';
import { gameManager, GameManager } from '../Classes/GameManager';

//This Method Will Help To return the gameState to reconnected player
export async function getGameState(gameId: string) {
    const existingGame = await redis.hGetAll(`game:${gameId}`) as Record<string, string>;
    if (Object.keys(existingGame).length === 0) return null;
    const board = new Chess(existingGame.fen);
    return {
        user1: existingGame.user1,
        user2: existingGame.user2,
        board,
        status: existingGame.status,
        fen: existingGame.fen,
        turn: board.turn(),
        whiteTimer: existingGame.whiteTimer,
        blackTimer: existingGame.blackTimer,
        gameStarted: existingGame.status === GAME_ACTIVE
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
    if ((isWhiteTurn && gameState.user1 !== playerId) || (!isWhiteTurn && gameState?.user2 !== playerId)) {
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
            
    if (board.isCheck()) {
        const message = JSON.stringify({
            type: CHECK,
            payload: {
                move
            }
        });
        user1Socket.send(message);
        user2Socket.send(message);
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
        const winner = board.turn() === "w" ? "black" : "white";

        const message = JSON.stringify({
            type: GAME_OVER,
            payload: {
                winner: winner
            }
        });

        await redis.hSet(`game:${gameId}`, {
            status: GAME_OVER,
            winner: winner
        });
        await redis.expire(`game:${gameId}`, 600);

        user1Socket.send(message);
        user2Socket.send(message);
        return;
    }
    
    const validMoves= await provideValidMoves(gameId)
    const opponent = playerId === gameState.user1 ? user2Socket : user1Socket;
    opponent.send(JSON.stringify({
        type: MOVE,
        payload: {
            move,
            turn:board.turn(),
            fen:board.fen(),
            validMoves:validMoves
        }
    }));
    

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
    if (game.status === GAME_OVER) {
        const message={
            type:GAME_OVER,
            payload:{
                message:"Previous Game Over "
            }
        }
        socket.send(JSON.stringify(message))
        return;
    }

   

    const color = playerId === game.user1 ? 'w' : 'b';
    const opponentId = playerId === game.user1 ? game.user2 : game.user1;

    console.log("sending the current moves to ", playerId);

    socket.send(JSON.stringify({
        type: GAME_FOUND,
        payload: {
                fen: game.board.fen(),
                color: color,
                turn: game.board.turn(),
                opponentId,
                gameId,
                whiteTimer:game.whiteTimer,
                blackTimer:game.blackTimer
            }
        }));

        await redis.hSet(`game:${gameId}`, {
            status: GAME_ACTIVE
        });
        await redis.sAdd("active-games", gameId);
        const opponentSocket = socketMap.get(opponentId);
        // gameManager.startTimer()
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
//todo->leave game functionality 
export async function playerLeft(playerId:string,gameId:string,socket:WebSocket,socketMap:Map<string,WebSocket>) {
        const game = await getGameState(gameId);
        if(!game){
            console.log("Game Not found")
            socket.send(JSON.stringify({
                type:GAME_NOT_FOUND,
                payload:{
                    message:"Cannot leave game due to game not found"
                }
            }))
            return
        }
        console.log("In player left method")
        const winner = playerId === game.user1 ?"b" :"w"
        const opponentId = playerId === game.user1 ? game.user2 : game.user1;

        const user2Socket=socketMap.get(opponentId)

        const message={
            type:GAME_OVER,
            payload:{
                message:"Player Left You Won!"
            }
        }

        await redis.hSet(`game:${gameId}`, {
        status: GAME_OVER,
        winner: winner
        });        
        await redis.expire(`game:${gameId}`, 600);
//we will only send the message to opp because the other player left
        user2Socket?.send(JSON.stringify(message))

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
    if(!session) return null
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