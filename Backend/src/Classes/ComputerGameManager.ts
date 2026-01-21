import WebSocket from 'ws';
import { ErrorMessages, ComputerGameMessages } from '../utils/messages';
import { Chess } from 'chess.js';
import { redis } from '../clients/redisClient';
import pc from '../clients/prismaClient';
import {
  getComputerMove,
  handleComputerMove,
  handlePlayerMove,
  handlePlayerQuit,
  validateComputerGamePayload,
} from '../Services/ComputerGameServices';
import { Move } from '../Services/GameServices';
import provideValidMoves, { delay, parseMoves } from '../utils/chessUtils';

class ComputerGameManager {
  globalSetInterval: NodeJS.Timeout | null = null;
  computerGameSocketManager: Map<number, WebSocket> = new Map();
  public readonly MOVES_BEFORE_SAVE = 10;

  public addForComputerGame(userId: number, userSocket: WebSocket) {
    this.computerGameSocketManager.set(userId, userSocket);
    this.playerMessageHandler(userId, userSocket);
    this.checkAndRestoreActiveGame(userId, userSocket);
  }

  async restoreGameFromDb(computerGameId: number) {
    try {
      const gameFromDB = await pc.computerGame.findUnique({
        where: { id: computerGameId },
        select: {
          id: true,
          currentFen: true,
          moves: true,
          playerColor: true,
          computerDifficulty: true,
          capturedPieces: true,
          status: true,
        },
      });

      if (!gameFromDB || gameFromDB.status === 'FINISHED') {
        return null;
      }

      const movesArray = gameFromDB.moves as string[] || []
      const capturedPiecesArray = (
        Array.isArray(gameFromDB.capturedPieces)
          ? gameFromDB.capturedPieces
          : []
      ) as string[];

      // Restore to Redis
      await redis.hSet(`computer-game:${computerGameId}`, {
        playerColor: gameFromDB.playerColor || 'w',
        fen: gameFromDB.currentFen || new Chess().fen(),
        status: ComputerGameMessages.COMPUTER_GAME_ACTIVE,
        difficulty: gameFromDB.computerDifficulty || 'MEDIUM',
        movesCount: movesArray.length.toString(),
      });

      // Restore moves list
      if (movesArray.length > 0) {
        await redis.del(`computer-game:${computerGameId}:moves`);
        for (const move of movesArray) {
          await redis.rPush(
            `computer-game:${computerGameId}:moves`,
            JSON.stringify(move)
          );
        }
      }

      // Restore captured pieces
      if (capturedPiecesArray.length > 0) {
        await redis.del(`computer-game:${computerGameId}:capturedPieces`);
        for (const piece of capturedPiecesArray) {
          await redis.rPush(
            `computer-game:${computerGameId}:capturedPieces`,
            piece
          );
        }
      }

      return {
        fen: gameFromDB.currentFen || new Chess().fen(),
        playerColor: gameFromDB.playerColor || 'w',
        difficulty: gameFromDB.computerDifficulty || 'MEDIUM',
        moves: movesArray,
        capturedPieces: capturedPiecesArray,
      };
    } catch (error) {
      console.error('Failed to restore computer game from DB:', error);
      return null;
    }
  }



async checkAndRestoreActiveGame(userId: number, userSocket: WebSocket) {
  try {
 
    const gameIdFromRedis = await redis.get(`user:${userId}:computer-game`);
    
    if (gameIdFromRedis) {
      const gameExists = await redis.exists(`computer-game:${gameIdFromRedis}`);
      if (gameExists) {
        const gameState = (await redis.hGetAll(`computer-game:${gameIdFromRedis}`)) as Record<string, string>;
        const moves = await parseMoves(`computer-game:${gameIdFromRedis}:moves`);
        const capturedPieces = await redis.lRange(`computer-game:${gameIdFromRedis}:capturedPieces`, 0, -1);
        const validMoves = provideValidMoves(gameState.fen);

        userSocket.send(JSON.stringify({
          type: ComputerGameMessages.COMPUTER_GAME_ACTIVE,
          payload: {
            computerGameId: Number(gameIdFromRedis),
            fen: gameState.fen,
            playerColor: gameState.playerColor,
            difficulty: gameState.difficulty,
            moves: Array.isArray(moves) ? [...moves] : [],
            message: 'Reconnected to active game (Redis)',
            validMoves: validMoves,
            capturedPieces: capturedPieces || [],
          },
        }));

        const currentTurn = gameState.fen.split(' ')[1];
        if (gameState.playerColor !== currentTurn) {
          try {
            await delay(2000);
            const computerMove: Move = await getComputerMove(gameState.fen, gameState.difficulty);
            await handleComputerMove(userSocket, computerMove, Number(gameIdFromRedis), userId);
          } catch (err) {
            console.error("Redis Restore Move Error:", err);
          
            userSocket.send(JSON.stringify({
              type: ErrorMessages.SERVER_ERROR,
              payload: { message: "Computer timed out. Refresh to try again." }
            }));
          }
        }
        return; 
      }
    }

    
    const gameFromDB = await pc.computerGame.findFirst({
      where: { userId: userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    if (gameFromDB) {
      const restored = await this.restoreGameFromDb(gameFromDB.id);
      if (restored) {
        const validMoves = provideValidMoves(restored.fen);

        userSocket.send(JSON.stringify({
          type: ComputerGameMessages.COMPUTER_GAME_ACTIVE,
          payload: {
            computerGameId: gameFromDB.id,
            fen: restored.fen,
            playerColor: restored.playerColor,
            difficulty: restored.difficulty,
            moves: restored.moves,
            message: 'Reconnected to active game (DB)',
            validMoves: validMoves,
            capturedPieces: restored.capturedPieces || [],
          },
        }));

        const currentTurn = restored.fen.split(' ')[1];
        if (restored.playerColor !== currentTurn) {
          try {
            await delay(2000);
            const computerMove: Move = await getComputerMove(restored.fen, restored.difficulty);
            await handleComputerMove(userSocket, computerMove, gameFromDB.id, userId);
          } catch (err) {
            console.error("DB Restore Move Error:", err);
            userSocket.send(JSON.stringify({
              type: ErrorMessages.SERVER_ERROR,
              payload: { message: "Engine timed out during restoration." }
            }));
          }
        }
      }
    }
  } catch (error) {
    console.error('Global Restore Error:', error);
  }
}

  playerMessageHandler(userId: number, userSocket: WebSocket) {
    userSocket.on('message', async (message: string) => {
      const msg = JSON.parse(message);
      const { type, payload } = msg;
      const validationError = validateComputerGamePayload(type, payload);
      if (validationError) {
        userSocket.send(
          JSON.stringify({
            type: ErrorMessages.PAYLOAD_ERROR,
            payload: { message: validationError },
          })
        );
        return;
      }

   
      if (type === ComputerGameMessages.PLAYER_MOVE) {
        const { computerGameId, move } = payload;

        await handlePlayerMove(userId, userSocket, computerGameId, move);

        return;
      } else if (type === ComputerGameMessages.PLAYER_QUIT) {
        const { computerGameId } = payload;
        await handlePlayerQuit(userId, computerGameId);
        return;
      }
    });
  }

  async handleDisconnection(userId: number) {
    try {
      this.computerGameSocketManager.delete(userId);
      console.log(`Computer game player ${userId} disconnected`);
    } catch (error) {
      console.error('Error handling computer game disconnection:', error);
    }
  }
}

export const computerGameManager = new ComputerGameManager();
