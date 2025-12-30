import WebSocket from 'ws';
import { GameMessages, RoomMessages, ErrorMessages } from '../utils/messages';
import { Chess } from 'chess.js';
import { redis } from '../clients/redisClient';
import pc from '../clients/prismaClient';
import {
  handleRoomChat,
  handleRoomGameLeave,
  handleRoomLeave,
  handleRoomMove,
  handleRoomReconnection,
  validatePayload,
  handleRoomDrawOffer,
  handleRoomDrawAcceptance,
  handleRoomDrawRejection,
} from '../Services/RoomGameServices';
import provideValidMoves from '../utils/chessUtils';

interface RestoredGameState {
  user1: number;
  user2: number;
  fen: string;
  whiteTimer: number;
  blackTimer: number;
  moves: string[];
  moveCount: number;
  status: string;
  chat: string[];
  capturedPieces: string[];
  roomCode: string;
}

class RoomManager {
  public roomSocketManager: Map<number, WebSocket> = new Map();
  public globalRoomClock: NodeJS.Timeout | null = null;
  public readonly MOVES_BEFORE_SAVE = 10;
  private readonly TIME_BUFFER_ON_CRASH = 10;

  async addRoomUser(userId: number, userSocket: WebSocket) {
    this.roomSocketManager.set(userId, userSocket);
    this.messageHandlerForRoom(userId, userSocket);

    userSocket.send(
      JSON.stringify({
        type: RoomMessages.ASSIGN_ID_FOR_ROOM,
        payload: {
          message: 'Id Assigned for room',
        },
      })
    );
    await this.checkAndRestoreActiveGame(userId, userSocket);
  }

  async checkAndRestoreActiveGame(userId: number, userSocket: WebSocket) {
    try {
      const gameIdFromRedis = await redis.get(`user:${userId}:room-game`);
      if (gameIdFromRedis) {
        const gameExists = await redis.exists(`room-game:${gameIdFromRedis}`);
        if (gameExists) {
          await handleRoomReconnection(
            userId,
            userSocket,
            Number(gameIdFromRedis),
            this.roomSocketManager
          );
          return;
        }
      }

      // Find the most recent active or waiting room (excluding finished/cancelled ones)
      const room = await pc.room.findFirst({
        where: {
          OR: [{ createdById: userId }, { joinedById: userId }],
          status: { in: ['FULL', 'ACTIVE'] },
          NOT: { status: { in: ['FINISHED', 'CANCELLED'] } },
        },
        include: {
          game: {
            select: {
              id: true,
              winnerId: true,
              loserId: true,
              draw: true,
              endedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      console.log(room);
      if (!room) {
        console.log(`✅ No active/waiting room found for user ${userId}`);
        return;
      }

      if (room.status === 'ACTIVE' && room.game?.id) {
        const restored = await this.restoreGameFromDB(room.game.id);
        if (restored) {
          await handleRoomReconnection(
            userId,
            userSocket,
            room.game.id,
            this.roomSocketManager
          );

          const opponentId =
            userId === restored.user1 ? restored.user2 : restored.user1;
          const opponentSocket = this.roomSocketManager.get(opponentId);
          opponentSocket?.send(
            JSON.stringify({
              type: RoomMessages.OPP_ROOM_RECONNECTED,
              payload: { message: 'Opponent has reconnected!' },
            })
          );
        }
        return;
      }

      if (room.status === 'FULL') {
        const opponentId =
          userId === room.createdById ? room.joinedById : room.createdById;
        const isCreator = userId === room.createdById;

        // Get opponent info for proper state sync
        const opponent = await pc.user.findUnique({
          where: { id: opponentId! },
          select: { name: true },
        });

        const opponentSocket = this.roomSocketManager.get(opponentId!);

        // Send single consolidated message with all necessary room state
        console.log(
          `🔄 User ${userId} reconnecting to FULL room (isCreator: ${isCreator})`
        );
        userSocket.send(
          JSON.stringify({
            type: GameMessages.USER_HAS_JOINED,
            payload: {
              message: isCreator
                ? 'Welcome back! Opponent is ready.'
                : 'Rejoined room successfully!',
              opponentId: opponentId,
              opponentName: opponent?.name || null,
              roomCode: room.code,
              roomStatus: 'FULL',
              isCreator: isCreator,
            },
          })
        );

        // Notify opponent that this user has reconnected
        opponentSocket?.send(
          JSON.stringify({
            type: RoomMessages.OPP_ROOM_RECONNECTED,
            payload: { message: 'Opponent has rejoined. Game can start now!' },
          })
        );
      }
    } catch (error) {
      console.error('Error checking for active or full game:', error);
    }
  }

  async roomJoined(createdById: number, opponentId: number) {
    try {
      const opponent = await pc.user.findUnique({
        where: { id: opponentId },
        select: { name: true },
      });

      const createdBySocket = this.roomSocketManager.get(createdById);

      console.log(
        `🔔 Notifying creator ${createdById} about opponent ${opponentId} joining`
      );
      console.log(`Creator socket connected: ${!!createdBySocket}`);

      if (createdBySocket) {
        createdBySocket.send(
          JSON.stringify({
            type: GameMessages.USER_HAS_JOINED,
            payload: {
              message: 'Opponent has joined!',
              opponentId,
              opponentName: opponent?.name || null,
            },
          })
        );
        console.log(
          `✅ USER_HAS_JOINED message sent to creator ${createdById}`
        );
      } else {
        console.log(
          `⚠️ Creator ${createdById} not connected to WebSocket yet - will sync on connection`
        );
      }
    } catch (error) {
      console.error('Error in roomJoined:', error);
      const createdBySocket = this.roomSocketManager.get(createdById);
      createdBySocket?.send(
        JSON.stringify({
          type: GameMessages.USER_HAS_JOINED,
          payload: {
            message: 'Opponent has joined!',
            opponentId,
            opponentName: null,
          },
        })
      );
    }
  }

  async startRoomTimer() {
    if (this.globalRoomClock) {
      console.log('Room Timer Already Running');
      return;
    }
    console.log('Starting Room Timer');

    this.globalRoomClock = setInterval(async () => {
      try {
        const activeRoomGames = await redis.sMembers('room-active-games');
        if (!activeRoomGames || activeRoomGames.length === 0) {
          if (this.globalRoomClock) {
            clearInterval(this.globalRoomClock);
            this.globalRoomClock = null;
            console.log('No Active Games Stopping timer');
          }
          return;
        }

        for (const gameId of activeRoomGames) {
          const game = (await redis.hGetAll(`room-game:${gameId}`)) as Record<
            string,
            string
          >;

          if (!game || Object.keys(game).length === 0) {
            await redis.sRem('room-active-games', gameId);
            continue;
          }

          if (game.status === RoomMessages.ROOM_GAME_OVER) {
            await redis.sRem('room-active-games', gameId);
            continue;
          }

          let whiteTimer = Number(game.whiteTimer);
          let blackTimer = Number(game.blackTimer);
          const fen = String(game.fen);
          const turn = fen.split(' ')[1];

          if (turn === 'w') {
            const updatedWhiteTimer = await redis.hIncrBy(
              `room-game:${gameId}`,
              'whiteTimer',
              -1
            );
            whiteTimer = Math.max(0, Number(updatedWhiteTimer));
          } else {
            const updatedBlackTimer = await redis.hIncrBy(
              `room-game:${gameId}`,
              'blackTimer',
              -1
            );
            blackTimer = Math.max(0, Number(updatedBlackTimer));
          }

          const whitePlayerId = Number(game.user1);
          const blackPlayerId = Number(game.user2);

          const whitePlayerSocket = this.roomSocketManager.get(whitePlayerId);
          const blackPlayerSocket = this.roomSocketManager.get(blackPlayerId);

          if (whitePlayerSocket && blackPlayerSocket) {
            const timerMessage = {
              type: RoomMessages.ROOM_TIMER_UPDATE,
              payload: {
                whiteTimer,
                blackTimer,
              },
            };

            whitePlayerSocket.send(JSON.stringify(timerMessage));
            blackPlayerSocket.send(JSON.stringify(timerMessage));
          }

          if (whiteTimer <= 0 || blackTimer <= 0) {
            await this.handleRoomTimeExpired(
              game,
              gameId,
              whiteTimer,
              blackTimer
            );
          }
        }
      } catch (error) {
        console.error('Error in room timer:', error);
      }
    }, 1000);
  }

  async handleRoomTimeExpired(
    game: Record<string, string>,
    gameId: string,
    whiteTimer: number,
    blackTimer: number
  ) {
    try {
      const winnerId =
        whiteTimer <= 0 ? Number(game.user2) : Number(game.user1);
      const loserId = whiteTimer <= 0 ? Number(game.user1) : Number(game.user2);
      const winnerColor = winnerId === Number(game.user1) ? 'w' : 'b';

      const winnerSocket = this.roomSocketManager.get(winnerId);
      const loserSocket = this.roomSocketManager.get(loserId);

      const moves = game.moves ? JSON.parse(game.moves) : [];
      const roomCode = game.roomCode;

      if (!roomCode) {
        console.error(
          `[handleRoomTimeExpired] Room code not found in Redis for game ${gameId}`
        );

        // Still notify clients even if room code not found
        const errorMessage = JSON.stringify({
          type: RoomMessages.ROOM_GAME_OVER,
          payload: {
            result: 'error',
            reason: 'ROOM_CODE_MISSING',
            message: 'Game ended due to time, but room data is missing',
            gameId: gameId,
          },
        });

        winnerSocket?.send(errorMessage);
        loserSocket?.send(errorMessage);

        // Clean up Redis anyway
        await redis.del(`user:${winnerId}:room-game`);
        await redis.del(`user:${loserId}:room-game`);
        await redis.del(`room-game:${gameId}`);
        await redis.sRem('room-active-games', gameId);

        return;
      }

      // Use roomCode directly - much simpler!
      await pc.$transaction([
        pc.game.update({
          where: { id: Number(gameId) },
          data: {
            winnerId,
            loserId,
            draw: false,
            moves,
            currentFen: game.fen,
            whiteTimeLeft: whiteTimer,
            blackTimeLeft: blackTimer,
            lastMoveAt: new Date(),
            lastMoveBy: whiteTimer <= 0 ? 'w' : 'b',
            endedAt: new Date(),
            status: 'FINISHED',
          },
        }),

        pc.room.update({
          where: { code: roomCode },
          data: { status: 'FINISHED' },
        }),
      ]);

      await redis.del(`user:${winnerId}:room-game`);
      await redis.del(`user:${loserId}:room-game`);
      await redis.hSet(`room-game:${gameId}`, {
        status: RoomMessages.ROOM_GAME_OVER,
        winner: winnerId.toString(),
      });
      await redis.sRem('room-active-games', gameId);

      const winnerMessage = JSON.stringify({
        type: RoomMessages.ROOM_GAME_OVER,
        payload: {
          result: 'win',
          reason: RoomMessages.ROOM_TIME_EXCEEDED,
          winner: winnerColor,
          message: '🎉 You won! Your opponent ran out of time.',
          roomStatus: 'FINISHED',
          gameStatus: 'GAME_OVER',
        },
      });

      const loserMessage = JSON.stringify({
        type: RoomMessages.ROOM_GAME_OVER,
        payload: {
          result: 'lose',
          reason: RoomMessages.ROOM_TIME_EXCEEDED,
          winner: winnerColor,
          message: "⏱️ Time's up! You lost on time.",
          roomStatus: 'FINISHED',
          gameStatus: 'GAME_OVER',
        },
      });

      winnerSocket?.send(winnerMessage);
      loserSocket?.send(loserMessage);
    } catch (error) {
      console.error(
        '[handleRoomTimeExpired] Error handling time expiration:',
        error
      );

      // Get user IDs from game data
      const user1Id = Number(game.user1);
      const user2Id = Number(game.user2);
      const socket1 = this.roomSocketManager.get(user1Id);
      const socket2 = this.roomSocketManager.get(user2Id);

      // Notify both players of the error
      const errorMessage = JSON.stringify({
        type: RoomMessages.ROOM_GAME_OVER,
        payload: {
          result: 'error',
          reason: 'TIME_HANDLER_ERROR',
          message:
            'Game ended due to time, but there was an error processing the result. Please refresh.',
          gameId: gameId,
        },
      });

      socket1?.send(errorMessage);
      socket2?.send(errorMessage);

      // Try to clean up Redis even if DB transaction failed
      try {
        await redis.del(`user:${user1Id}:room-game`);
        await redis.del(`user:${user2Id}:room-game`);
        await redis.del(`room-game:${gameId}`);
        await redis.sRem('room-active-games', gameId);
      } catch (redisError) {
        console.error(
          '[handleRoomTimeExpired] Redis cleanup failed:',
          redisError
        );
      }
    }
  }

  async messageHandlerForRoom(userId: number, userSocket: WebSocket) {
    userSocket.on('message', async (message: string) => {
      const msg = JSON.parse(message);
      const { type, payload } = msg;

      const validationError = validatePayload(type, payload);
      if (validationError) {
        userSocket.send(
          JSON.stringify({
            type: ErrorMessages.PAYLOAD_ERROR,
            payload: { message: validationError },
          })
        );
        return;
      }

      if (type === RoomMessages.INIT_ROOM_GAME) {
        const chess = new Chess();

        const { roomCode } = msg.payload;
        const room = await pc.room.findUnique({
          where: { code: roomCode },
          select: { id: true, createdById: true, joinedById: true, game: true },
        });

        if (!room) {
          userSocket.send(
            JSON.stringify({
              type: RoomMessages.ROOM_NOT_FOUND,
              payload: { message: 'Invalid Code because Room Does not exist!' },
            })
          );
          return;
        }

        if (room.game) {
          userSocket.send(
            JSON.stringify({
              type: RoomMessages.ROOM_GAME_ACTIVE_ERROR,
              payload: { message: 'Room Game Already Active!' },
            })
          );
          return;
        }

        if (!room.joinedById) {
          userSocket.send(
            JSON.stringify({
              type: RoomMessages.ROOM_NOT_READY,
              payload: { message: 'Waiting for opponent to join' },
            })
          );
          return;
        }

        if (userId !== room.createdById) {
          userSocket.send(
            JSON.stringify({
              type: ErrorMessages.UNAUTHORIZED,
              payload: { message: 'Only the room creator can start the game' },
            })
          );
          return;
        }

        const creatorId = room.createdById;
        const joinerId = room.joinedById;

        const newGame = await pc.$transaction(async (tx) => {
          const game = await tx.game.create({
            data: {
              moves: [],
              currentFen: chess.fen(),
              roomId: room.id,
              blackTimeLeft: 600,
              whiteTimeLeft: 30,
              lastMoveAt: new Date(),
              type: 'ROOM',
              status: 'ACTIVE',
            },
            select: { id: true },
          });

          await tx.room.update({
            where: { id: room.id },
            data: { status: 'ACTIVE' },
          });

          return game;
        });

        const gameId = newGame.id;
        const moves = provideValidMoves(chess.fen());

        await redis
          .multi()
          .hSet(`room-game:${gameId}`, {
            user1: creatorId.toString(),
            user2: joinerId.toString(),
            status: RoomMessages.ROOM_GAME_ACTIVE,
            fen: chess.fen(),
            whiteTimer: '600',
            blackTimer: '600',
            moveCount: '0',
            roomCode: roomCode,
          })
          .setEx(`user:${creatorId}:room-game`, 86400, gameId.toString())
          .setEx(`user:${joinerId}:room-game`, 86400, gameId.toString())
          .exec();

        const whitePlayerSocket = this.roomSocketManager.get(creatorId);
        whitePlayerSocket?.send(
          JSON.stringify({
            type: RoomMessages.INIT_ROOM_GAME,
            payload: {
              color: 'w',
              fen: chess.fen(),
              whiteTimer: 600,
              blackTimer: 600,
              opponentId: joinerId,
              roomGameId: gameId,
              validMoves: moves,
            },
          })
        );

        const blackPlayerSocket = this.roomSocketManager.get(joinerId);
        blackPlayerSocket?.send(
          JSON.stringify({
            type: RoomMessages.INIT_ROOM_GAME,
            payload: {
              color: 'b',
              fen: chess.fen(),
              opponentId: creatorId,
              whiteTimer: 600,
              blackTimer: 600,
              roomGameId: gameId,
              validMoves: [],
            },
          })
        );

        await redis.sAdd('room-active-games', gameId.toString());
        await this.startRoomTimer();
        return;
      } else if (type === RoomMessages.ROOM_MOVE) {
        const { payload } = msg;
        const { to, from, promotion, roomGameId } = payload;
        const gameExists = await redis.exists(`room-game:${roomGameId}`);

        if (!gameExists) {
          await this.restoreGameFromDB(roomGameId);
        }

        await handleRoomMove(
          userId,
          userSocket,
          { from, to, promotion },
          roomGameId,
          this.roomSocketManager
        );
        return;
      } else if (type === RoomMessages.ROOM_CHAT) {
        const { message, roomGameId, roomId } = payload;

        if (roomGameId) {
          const gameExists = await redis.exists(`room-game:${roomGameId}`);
          if (!gameExists) {
            await this.restoreGameFromDB(roomGameId);
          }
          await handleRoomChat(
            userId,
            userSocket,
            roomGameId,
            message,
            this.roomSocketManager
          );
        } else if (roomId) {
          const room = await pc.room.findUnique({
            where: { code: roomId },
            select: { createdById: true, joinedById: true, status: true },
          });

          if (!room) {
            userSocket.send(
              JSON.stringify({
                type: RoomMessages.ROOM_NOT_FOUND,
                payload: { message: 'Room not found' },
              })
            );
            return;
          }

          // Determine opponent
          const opponentId =
            userId === room.createdById ? room.joinedById : room.createdById;

          if (!opponentId) {
            userSocket.send(
              JSON.stringify({
                type: RoomMessages.ROOM_CHAT,
                payload: {
                  message: message,
                  sender: userId,
                  timestamp: Date.now(),
                },
              })
            );
            return;
          }

          const opponentSocket = this.roomSocketManager.get(opponentId);
          const timestamp = Date.now();

          // Send to opponent
          opponentSocket?.send(
            JSON.stringify({
              type: RoomMessages.ROOM_CHAT,
              payload: {
                message: message,
                sender: userId,
                timestamp: timestamp,
              },
            })
          );

          userSocket.send(
            JSON.stringify({
              type: RoomMessages.ROOM_CHAT,
              payload: {
                message: message,
                sender: userId,
                timestamp: timestamp,
              },
            })
          );
        } else {
          userSocket.send(
            JSON.stringify({
              type: ErrorMessages.PAYLOAD_ERROR,
              payload: {
                message: 'Either roomGameId or roomId is required for chat',
              },
            })
          );
        }
        return;
      } else if (type === RoomMessages.ROOM_LEAVE_GAME) {
        const { roomGameId } = payload;
        const gameExists = await redis.exists(`room-game:${roomGameId}`);

        if (!gameExists) {
          await this.restoreGameFromDB(roomGameId);
        }

        await handleRoomGameLeave(
          userId,
          userSocket,
          roomGameId,
          this.roomSocketManager
        );
        return;
      } else if (type === RoomMessages.ROOM_RECONNECT) {
        const gameId = payload.roomGameId;
        const gameExists = await redis.exists(`room-game:${gameId}`);

        if (!gameExists) {
          const restored = await this.restoreGameFromDB(gameId);
          if (!restored) {
            userSocket.send(
              JSON.stringify({
                type: RoomMessages.NO_ROOM_RECONNECTION,
                payload: {
                  message: 'Game reconnection not possible - game is finished',
                },
              })
            );
            return;
          }
        }

        await handleRoomReconnection(
          userId,
          userSocket,
          gameId,
          this.roomSocketManager
        );
      } else if (type === RoomMessages.LEAVE_ROOM) {
        const roomId = payload.roomId;
        await handleRoomLeave(
          userId,
          roomId,
          userSocket,
          this.roomSocketManager
        );
      } else if (type === GameMessages.OFFER_DRAW) {
        const { roomGameId } = payload;
        const gameExists = await redis.exists(`room-game:${roomGameId}`);

        if (!gameExists) {
          const restored = await this.restoreGameFromDB(roomGameId);
          if (!restored) {
            userSocket.send(
              JSON.stringify({
                type: RoomMessages.NO_ROOM_RECONNECTION,
                payload: {
                  message: 'Game reconnection not possible - game is finished',
                },
              })
            );
            return;
          }
        }
        await handleRoomDrawOffer(
          userId,
          userSocket,
          roomGameId,
          this.roomSocketManager
        );
      } else if (type === GameMessages.ACCEPT_DRAW) {
        const { roomGameId } = payload;
        const gameExists = await redis.exists(`room-game:${roomGameId}`);

        if (!gameExists) {
          await this.restoreGameFromDB(roomGameId);
        }
        await handleRoomDrawAcceptance(
          userId,
          userSocket,
          roomGameId,
          this.roomSocketManager
        );
      } else if (type === GameMessages.REJECT_DRAW) {
        const { roomGameId } = payload;
        const gameExists = await redis.exists(`room-game:${roomGameId}`);

        if (!gameExists) {
          await this.restoreGameFromDB(roomGameId);
        }
        await handleRoomDrawRejection(
          userId,
          userSocket,
          roomGameId,
          this.roomSocketManager
        );
      } else {
        userSocket.send(
          JSON.stringify({
            type: RoomMessages.WRONG_ROOM_MESSAGE,
            payload: { message: 'Invalid Action' },
          })
        );
      }
    });
  }

  async restoreGameFromDB(gameId: number): Promise<RestoredGameState | null> {
    try {
      const gameFromDB = await pc.game.findUnique({
        where: { id: gameId },
        include: { room: true },
      });

      if (
        !gameFromDB ||
        !gameFromDB.room ||
        gameFromDB.room.status === 'FINISHED' ||
        gameFromDB.room.status === 'FULL'
      ) {
        return null;
      }

      let whiteTimeLeft = gameFromDB.whiteTimeLeft;
      let blackTimeLeft = gameFromDB.blackTimeLeft;

      if (gameFromDB.lastMoveAt && gameFromDB.lastMoveBy) {
        const elapsedSeconds = Math.floor(
          (Date.now() - gameFromDB.lastMoveAt.getTime()) / 1000
        );

        const chess = new Chess(gameFromDB.currentFen || undefined);
        const currentTurn = chess.turn();

        if (currentTurn === 'w' && gameFromDB.lastMoveBy === 'b') {
          whiteTimeLeft = Math.max(0, whiteTimeLeft - elapsedSeconds);
        } else if (currentTurn === 'b' && gameFromDB.lastMoveBy === 'w') {
          blackTimeLeft = Math.max(0, blackTimeLeft - elapsedSeconds);
        }

        if (elapsedSeconds > 10) {
          whiteTimeLeft += this.TIME_BUFFER_ON_CRASH;
          blackTimeLeft += this.TIME_BUFFER_ON_CRASH;
        } else {
          console.log('Quick Reconnection in restoreFromDb! No Buffer Added');
        }
      }

      const chatArray = (
        Array.isArray(gameFromDB.chat) ? gameFromDB.chat : []
      ) as string[];
      const movesArray = (
        Array.isArray(gameFromDB.moves) ? gameFromDB.moves : []
      ) as string[];
      const movesCountStr = movesArray.length.toString();

      await redis.hSet(`room-game:${gameId}`, {
        user1: gameFromDB.room.createdById.toString(),
        user2: gameFromDB.room.joinedById!.toString(),
        status: RoomMessages.ROOM_GAME_ACTIVE,
        fen: gameFromDB.currentFen || new Chess().fen(),
        whiteTimer: whiteTimeLeft.toString(),
        blackTimer: blackTimeLeft.toString(),
        moveCount: movesCountStr,
        roomCode: gameFromDB.room.code,
      });

      if (movesArray.length > 0) {
        await redis.del(`room-game:${gameId}:moves`);
        for (const move of movesArray) {
          await redis.rPush(`room-game:${gameId}:moves`, JSON.stringify(move));
        }
      }

      if (chatArray.length > 0) {
        await redis.del(`room-game:${gameId}:chat`);
        for (const chat of chatArray) {
          await redis.rPush(`room-game:${gameId}:chat`, JSON.stringify(chat));
        }
      }

      // Restore captured pieces
      const capturedPiecesArray = (
        Array.isArray(gameFromDB.capturedPieces)
          ? gameFromDB.capturedPieces
          : []
      ) as string[];
      if (capturedPiecesArray.length > 0) {
        await redis.del(`room-game:${gameId}:capturedPieces`);
        for (const piece of capturedPiecesArray) {
          await redis.rPush(`room-game:${gameId}:capturedPieces`, piece);
        }
      }

      await redis.sAdd('room-active-games', gameId.toString());

      return {
        user1: gameFromDB.room.createdById,
        user2: gameFromDB.room.joinedById!,
        fen: gameFromDB.currentFen || new Chess().fen(),
        whiteTimer: whiteTimeLeft,
        blackTimer: blackTimeLeft,
        moves: movesArray,
        moveCount: movesArray.length,
        status: RoomMessages.ROOM_GAME_ACTIVE,
        chat: chatArray,
        capturedPieces: gameFromDB.capturedPieces || [],
        roomCode: gameFromDB.room.code,
      };
    } catch (error) {
      console.error('Failed to restore game from DB:', error);
      return null;
    }
  }

  async handleDisconnection(userId: number) {
    try {
      this.roomSocketManager.delete(userId);

      const userRoom = await pc.room.findFirst({
        where: {
          OR: [{ createdById: userId }, { joinedById: userId }],
          status: {
            in: ['ACTIVE', 'FULL'],
          },
          NOT: {
            status: { in: ['FINISHED', 'CANCELLED'] },
          },
        },
        include: {
          game: {
            select: {
              id: true,
              winnerId: true,
              loserId: true,
              draw: true,
            },
          },
        },
      });

      if (!userRoom) {
        console.log('⚠️ No active or waiting room found for user:', userId);
        return;
      }

      const opponentId =
        userRoom.createdById === userId
          ? userRoom.joinedById
          : userRoom.createdById;

      if (!opponentId) {
        console.log(`Opponent not found for disconnected user ${userId}`);
        return;
      }

      const opponentSocket = this.roomSocketManager.get(opponentId);

      if (userRoom.status === 'ACTIVE') {
        opponentSocket?.send(
          JSON.stringify({
            type: RoomMessages.ROOM_OPP_DISCONNECTED,
            payload: {
              message:
                'Opponent disconnected during game. Waiting for reconnection...',
            },
          })
        );

        console.log(
          `User ${userId} disconnected mid-game from room ${userRoom.code}`
        );
      } else if (userRoom.status === 'FULL') {
        opponentSocket?.send(
          JSON.stringify({
            type: RoomMessages.ROOM_OPP_DISCONNECTED,
            payload: {
              message: 'Opponent left the lobby before game start.',
            },
          })
        );

        console.log(
          `User ${userId} disconnected from lobby of room ${userRoom.code}`
        );
      }
    } catch (error) {
      console.error('❌ Error handling room disconnection:', error);
    }
  }
}

export const roomManager = new RoomManager();
