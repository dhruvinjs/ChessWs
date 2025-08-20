import { WebSocket } from 'ws';
import { 
    CHECK, 
    GAME_ACTIVE, 
    GAME_COMPLETED, 
    GAME_FOUND, 
    GAME_NOT_FOUND, 
    GAME_OVER, 
    MOVE, 
    OPP_RECONNECTED, 
    SERVER_ERROR, 
    STALEMATE, 
    TIME_EXCEEDED, 
    WRONG_MOVE, 
    WRONG_PLAYER_MOVE 
} from '../messages';
import { redis } from '../redisClient';
import { Chess } from 'chess.js';

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
        turn: board.turn()
    };
}

export async function makeMove(
    socket: WebSocket,
    move: { from: string; to: string; promotion?: string },
    gameId: string,
    playerId: string,
    socketMap: Map<string, WebSocket>,
    timeOfMove: number
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

    const lastMoveTime = await redis.hGet(`game:${gameId}:move-time`, "timeOfMove");
    const finalLastMovetime = Number(lastMoveTime) || 0;

    const { exceeded, remainingTime } = calculateTime(Number(finalLastMovetime));
    console.log(`remaining time:${remainingTime}`);

    const user1Socket = socketMap.get(gameState.user1);
    const user2Socket = socketMap.get(gameState.user2);
    if (!user1Socket || !user2Socket) {
        console.log("One or both players disconnected");
        return;
    }

    // Time Exceeded Block
    if (finalLastMovetime !== 0 && exceeded) {
        const turn = gameState.turn;
        const flippedFen = flipTurn(gameState.board.fen(), turn);

        await redis.hSet(`game:${gameId}`, {
            fen: flippedFen,
            status: "Active"
        });

        const timeoutMessage = {
            type: TIME_EXCEEDED,
            payload: {
                reason: "Player execeeded the time limit",
                currentTurn: turn === "w" ? "b" : "w",
                fen: flippedFen
            }
        };
        user1Socket.send(JSON.stringify(timeoutMessage));
        user2Socket.send(JSON.stringify(timeoutMessage));

        await redis.hSet(`game:${gameId}:move-time`, {
            timeOfMove: Date.now(),
            currentPlayerId: playerId
        });

        gameState.board.load(flippedFen);
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
            await redis.hSet(`game:${gameId}`, "fen", gameState.board.fen());
            await redis.hSet(`game:${gameId}:move-time`, {
                timeOfMove: timeOfMove,
                currentPlayerId: playerId
            });

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

        const status = {
            status: "Completed",
            winner: "draw (stalemate)"
        };
        await redis.hSet(`game:${gameId}`, status);
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

        const status = {
            status: GAME_COMPLETED,
            winner: winner
        };
        await redis.hSet(`game:${gameId}`, status);
        await redis.expire(`game:${gameId}`, 600);

        user1Socket.send(message);
        user2Socket.send(message);
        return;
    }
    //stop the timer for the player who has made the move and it has passed all if 
    //start the timer for player who will now make move

    const opponent = playerId === gameState.user1 ? user2Socket : user1Socket;
    opponent.send(JSON.stringify({
        type: MOVE,
        payload: {
            move
        }
    }));
}


export async function reconnectPlayer(playerId: string, gameId: string, socket: WebSocket, socketMap: Map<string, WebSocket>) {
    const game = await getGameState(gameId);

    console.log("reconnection player");
    if (!game) {
        console.log("Game Not found");
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
            gameId
        }
    }));

    const status = {
        status: GAME_ACTIVE,
    };
    await redis.hSet(`game:${gameId}`, status);

    const opponentSocket = socketMap.get(opponentId);
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

export async function playerLeft() {
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

export function flipTurn(fen: string, turn: string) {
    const part = fen.split(" ");
    part[1] = turn === "w" ? "b" : "w";
    const newFen = part.join(" ");
    console.log(newFen);
    return newFen;
}


export function startTimer(userId:string,socketMap:Map<string,WebSocket>){
    const timer = 0
    const userSocket = socketMap.get(userId)
    

    setInterval(()=>{

    },1000)
}
