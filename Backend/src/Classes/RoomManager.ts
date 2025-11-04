  import WebSocket from "ws";
  import {
    ASSIGN_ID_FOR_ROOM,
    INIT_ROOM_GAME,
    LEAVE_ROOM,
    NO_ROOM_RECONNECTION,
    OPP_ROOM_RECONNECTED,
    PAYLOAD_ERROR,
    ROOM_CHAT,
    ROOM_GAME_ACTIVE,
    ROOM_GAME_ACTIVE_ERROR,
    ROOM_GAME_OVER,
    ROOM_LEAVE_GAME,
    ROOM_MOVE,
    ROOM_NOT_FOUND,
    ROOM_NOT_READY,
    ROOM_OPP_DISCONNECTED,
    ROOM_READY_TO_START,
    ROOM_RECONNECT,
    ROOM_TIME_EXCEEDED,
    ROOM_TIMER_UPDATE,
    SERVER_ERROR,
    UNAUTHORIZED,
    USER_HAS_JOINED,
    WRONG_ROOM_MESSAGE,
  } from "../messages";
  import { Chess } from "chess.js";
  import { redis } from "../redisClient";
  import pc from "../prismaClient";

  import { handleRoomChat, handleRoomGameLeave, handleRoomLeave, handleRoomMove, handleRoomReconnection, validatePayload } from "../Services/RoomGameServices";
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
  }
  class RoomManager {
    public roomSocketManager: Map<number, WebSocket> = new Map();
    public globalRoomClock: NodeJS.Timeout | null = null;
    public readonly MOVES_BEFORE_SAVE = 10;
    // if a opponent is reconnected after a certain time then a time buffer is offered to him 
    private readonly TIME_BUFFER_ON_CRASH = 10; 
    async addRoomUser(userId: number, userSocket: WebSocket) {
      this.roomSocketManager.set(userId, userSocket);
      this.addHandlerForRoom(userId, userSocket);

      userSocket.send(
        JSON.stringify({
          type: ASSIGN_ID_FOR_ROOM,
          payload: {
            message: "Id Assigned for room",
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
          await handleRoomReconnection(userId, userSocket, Number(gameIdFromRedis), this.roomSocketManager);
          return;
        }
      }

      const room = await pc.room.findFirst({
        where: {
          OR: [{ createdById: userId }, { joinedById: userId }],
          status: { in: ["FULL", "ACTIVE"] }
        },
        include: {
          game: { select: { id: true } }
        }
      });

      if (!room) return;

      if (room.status === "ACTIVE" && room.game?.id) {
        const restored = await this.restoreGameFromDB(room.game.id);
        if (restored) {
          await handleRoomReconnection(userId, userSocket, room.game.id, this.roomSocketManager);

          const opponentId = userId === restored.user1 ? restored.user2 : restored.user1;
          const opponentSocket = this.roomSocketManager.get(opponentId);
          opponentSocket?.send(JSON.stringify({
            type: OPP_ROOM_RECONNECTED,
            payload: { message: "Opponent has reconnected!" }
          }));
        }
        return;
      }

      if (room.status === "FULL") {
        const opponentId = userId === room.createdById ? room.joinedById : room.createdById;

        const opponentSocket = this.roomSocketManager.get(opponentId!);

        userSocket.send(JSON.stringify({
          type: ROOM_READY_TO_START,
          payload: {
            message: "Reconnected successfully. Both players are ready — you can start the game!",
            roomCode: room.code
          }
        }));

        // Optionally notify opponent that user is back
        opponentSocket?.send(JSON.stringify({
          type: OPP_ROOM_RECONNECTED,
          payload: { message: "Opponent has rejoined. Game can start now!" }
        }));

          
      }
    } catch (error) {
      console.error("Error checking for active or full game:", error);
    }
  }




    async roomJoined(createdById: number, opponentId: number) {
      const createdBySocket = this.roomSocketManager.get(createdById);
      createdBySocket?.send(
        JSON.stringify({
          type: USER_HAS_JOINED,
          payload: {
            message: "Opponent has joined!",
            opponentId,
          },
        })
      );
    }

    async startRoomTimer() {
      if (this.globalRoomClock) {
        console.log("Room Timer ALready Running");
        return
      };
      console.log("Starting Room Timer");

      this.globalRoomClock = setInterval(async () => {
        try {
          const activeRoomGames = await redis.sMembers("room-active-games") 
          if (!activeRoomGames || activeRoomGames.length === 0) {
            if (this.globalRoomClock) {
              clearInterval(this.globalRoomClock);
              this.globalRoomClock = null;
              console.log("No Active Games Stopping timer");
            }
            return;
          }

          for (const gameId of activeRoomGames) {
            const game = await redis.hGetAll(`room-game:${gameId}`) as Record<string,string>
            
            if (!game || Object.keys(game).length === 0) {
              await redis.sRem("room-active-games", gameId);
              continue;
            }

            if (game.status === ROOM_GAME_OVER) {
              await redis.sRem("room-active-games", gameId);
              continue;
            }

        
            let whiteTimer = Number(game.whiteTimer);
            let blackTimer = Number(game.blackTimer);
            const fen = String(game.fen);
            const turn = fen.split(" ")[1];

            // Decrement active player's timer
        if (turn === "w") {
            const updatedWhiteTimer=await redis.hIncrBy(`room-game:${gameId}`, "whiteTimer", -1);
            whiteTimer=Math.max(0,Number(updatedWhiteTimer))
          } else {
            const updatedBlackTimer=await redis.hIncrBy(`room-game:${gameId}`, "blackTimer", -1);
            blackTimer=Math.max(0,Number(updatedBlackTimer))
          }

            const whitePlayerId = Number(game.user1);
            const blackPlayerId = Number(game.user2);

            const whitePlayerSocket = this.roomSocketManager.get(whitePlayerId);
            const blackPlayerSocket = this.roomSocketManager.get(blackPlayerId);

            // Broadcast timer update
            if (whitePlayerSocket && blackPlayerSocket) {
              const timerMessage = {
                type: ROOM_TIMER_UPDATE,
                payload: {
                  whiteTimer,
                  blackTimer,
                },
              };

              whitePlayerSocket.send(JSON.stringify(timerMessage));
              blackPlayerSocket.send(JSON.stringify(timerMessage));
            }

            // Check for timeout
            if (whiteTimer <= 0 || blackTimer <= 0) {
              await this.handleRoomTimeExpired(game,gameId, whiteTimer, blackTimer);
            }
          }
        } catch (error) {
          console.error("Error in room timer:", error);
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
        const winnerId = whiteTimer <= 0 ? Number(game.user2) : Number(game.user1);
        const loserId = whiteTimer <= 0 ? Number(game.user1) : Number(game.user2);
        const winnerColor = winnerId === Number(game.user1) ? "w" : "b";

        const winnerSocket = this.roomSocketManager.get(winnerId);
        const loserSocket = this.roomSocketManager.get(loserId);

  
        const moves = game.moves ? JSON.parse(game.moves) : [];
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
            lastMoveBy: whiteTimer <= 0 ? "w" : "b",
            endedAt: new Date(),
          },
        }),

        pc.room.update({
          where: { gameId: Number(gameId) },
          data: { status: "FINISHED" },
        }),
      ]);

        await redis.hSet(`room-game:${gameId}`, {
          status: ROOM_GAME_OVER,
          winner: winnerId.toString(),
        });
        await redis.sRem("room-active-games", gameId);

        const winnerMessage = JSON.stringify({
          type: ROOM_GAME_OVER,
          payload: {
            result: "win",
            reason: ROOM_TIME_EXCEEDED,
            winner: winnerColor,
            message: "🎉 You won! Your opponent ran out of time.",
          },
        });

        const loserMessage = JSON.stringify({
          type: ROOM_GAME_OVER,
          payload: {
            result: "lose",
            reason: ROOM_TIME_EXCEEDED,
            winner: winnerColor,
            message: "⏱️ Time's up! You lost on time.",
          },
        });

        winnerSocket?.send(winnerMessage);
        loserSocket?.send(loserMessage);
      } catch (error) {
        console.log("Error handling time expiration:", error);
      }
    }

    async addHandlerForRoom(userId: number, userSocket: WebSocket) {
      userSocket.on("message", async (message: string) => {
        const msg = JSON.parse(message);
        const {type,payload} = msg;
         const validationError = validatePayload(type, payload);
      if (validationError) {
        userSocket.send(
          JSON.stringify({
            type: PAYLOAD_ERROR,
            payload: { message: validationError },
          })
        );
        return;
      }



        if (type === INIT_ROOM_GAME) {
          const chess = new Chess();
          
        const {roomId}=msg.payload
          const room=await pc.room.findUnique({
            where:{code:roomId},select:{id:true,createdById:true,joinedById:true,game:true}

          })
          if(!room){
            userSocket.send(JSON.stringify({
              type:ROOM_NOT_FOUND,
              payload:{message:"Invalid Code because Room Does not exist!"}
            }))
            return
          }
          if(room.game){
          userSocket.send(JSON.stringify({
              type:ROOM_GAME_ACTIVE_ERROR,
              payload:{message:"Room Game Already Active!"}
            }))
            return
          }
          if (!room.joinedById) {
            userSocket.send(JSON.stringify({
              type: ROOM_NOT_READY,
              payload: { message: "Waiting for opponent to join" }
            }));
            return;
          }
            if (userId !== room.createdById) {
            userSocket.send(JSON.stringify({
              type: UNAUTHORIZED,
              payload: { message: "Only the room creator can start the game" }
            }));
            return;
          }
            const creatorId = room.createdById;
            const joinerId = room.joinedById;

  const newGame = await pc.$transaction(async (tx) => {
    // Step 1: Create the game
          const game = await tx.game.create({
            data: {
              moves: [],
              currentFen: chess.fen(),
              roomId: roomId,
              blackTimeLeft: 600,
              whiteTimeLeft: 30,
              lastMoveAt: new Date(),
              type: "ROOM",
            },
            select: { id: true },
          });

          // Step 2: Update the room with the new game ID
          await tx.room.update({
            where: { code: roomId },
            data: { gameId: game.id,status:"ACTIVE" },
          });

          // Return game info
          return game;
        });
          const gameId=newGame.id
          await redis
            .multi()
            .hSet(`room-game:${gameId}`, {
              user1: creatorId.toString(),
              user2: joinerId.toString(),
              status: ROOM_GAME_ACTIVE,
              fen: chess.fen(),
              whiteTimer: '30',
              blackTimer: '600',
              moveCount: '0',
            })
            .setEx(`user:${creatorId}:room-game`, 86400, gameId.toString())
            .setEx(`user:${joinerId}:room-game`, 86400, gameId.toString())
            .exec();

          const whitePlayerSocket = this.roomSocketManager.get(creatorId);
          whitePlayerSocket?.send(
            JSON.stringify({
              type: INIT_ROOM_GAME,
              payload: {
                color: "w",
                fen: chess.fen(),
                whiteTimer: 30,
                blackTimer: 600,
                opponentId: joinerId,
                gameId:gameId
              },
            })
          );

          const blackPlayerSocket = this.roomSocketManager.get(joinerId);
          blackPlayerSocket?.send(
            JSON.stringify({
              type: INIT_ROOM_GAME,
              payload: {
                color: "b",
                fen: chess.fen(),
                opponentId: creatorId,
                whiteTimer: 30,
                blackTimer: 600,
                gameId:gameId
              },
            })
          );

          await redis.sAdd("room-active-games", gameId.toString());
          await this.startRoomTimer();
          return;
        }

        else if (type === ROOM_MOVE) {
          const { payload } = msg;
          const { to, from, promotion, gameId } = payload;
          const gameExists = await redis.exists(`room-game:${gameId}`);

          if (!gameExists) {
            await this.restoreGameFromDB(gameId);
          }

          await handleRoomMove(
            userId,
            userSocket,
            { from,to,promotion },
            gameId,
            this.roomSocketManager
          );
          return;
        }
        else if (type === ROOM_CHAT){
          
            const {message,gameId}=payload;
            const gameExists=await redis.exists(`room-game:${gameId}`)
            if (!gameExists) {
            await this.restoreGameFromDB(gameId);
          }

          await handleRoomChat(userId, userSocket, gameId,message,this.roomSocketManager);
          return;
        }

        else if (type === ROOM_LEAVE_GAME) {
        
          const { gameId } = payload;
          const gameExists = await redis.exists(`room-game:${gameId}`);

          if (!gameExists) {
            await this.restoreGameFromDB(gameId);
          }

          await handleRoomGameLeave(userId, userSocket, gameId,this.roomSocketManager);
          return;
        }

        else if (type === ROOM_RECONNECT) {

          const gameId = payload.gameId;
          const gameExists = await redis.exists(`room-game:${gameId}`);

          if (!gameExists) {
            const restored = await this.restoreGameFromDB(gameId);
            if (!restored) {
              userSocket.send(
                JSON.stringify({
                  type: NO_ROOM_RECONNECTION,
                  payload: {
                    message: "Game reconnection not possible - game is finished",
                  },
                })
              );
              return;
            }
          }

          await handleRoomReconnection(userId, userSocket, gameId, this.roomSocketManager);
        }
        else if (type === LEAVE_ROOM){
            const roomId = payload.roomId;
          await handleRoomLeave(userId,roomId,userSocket,this.roomSocketManager);
        }
        else {
          userSocket.send(
            JSON.stringify({
              type: WRONG_ROOM_MESSAGE,
              payload: { message: "Invalid Action" },
            })
          );
        }
      });
    }

    // ✅ Simple restoration from DB
    async restoreGameFromDB(gameId: number):Promise<RestoredGameState | null> {
      try {
        const gameFromDB = await pc.game.findUnique({
          where: { id: gameId },
          include: { room: true },
        });

        if (!gameFromDB || !gameFromDB.room || gameFromDB.room.status === "FINISHED" || gameFromDB.room.status ==="FULL") {
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
          if(elapsedSeconds > 10){
            whiteTimeLeft += this.TIME_BUFFER_ON_CRASH;
            blackTimeLeft += this.TIME_BUFFER_ON_CRASH;

          }else console.log("Quick Reconnection in restoreFromDb! No Buffer Added")



        }
        const chatArray=(Array.isArray(gameFromDB.chat) ? gameFromDB.chat : []) as string[] 
        const movesArray=(Array.isArray(gameFromDB.moves) ? gameFromDB.moves : []) as string[]
        const movesCountStr=movesArray.length.toString()
        await redis.hSet(`room-game:${gameId}`, {
          user1: gameFromDB.room.createdById.toString(),
          user2: gameFromDB.room.joinedById!.toString(),
          status: ROOM_GAME_ACTIVE,
          fen: gameFromDB.currentFen || new Chess().fen(),
          whiteTimer: whiteTimeLeft.toString(),
          blackTimer: blackTimeLeft.toString(),
          moveCount:movesCountStr,
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

        await redis.sAdd("room-active-games", gameId.toString());

        return {
        user1: gameFromDB.room.createdById,
        user2: gameFromDB.room.joinedById!,
        fen: gameFromDB.currentFen || new Chess().fen(),
        whiteTimer: whiteTimeLeft,
        blackTimer: blackTimeLeft,
        moves: movesArray,
        moveCount: movesArray.length,
        status: ROOM_GAME_ACTIVE,
        chat: chatArray
      };
      } catch (error) {
        console.error("Failed to restore game from DB:", error);
        return null;
      }
    }

      async handleDisconnection(userId: number, userSocket: WebSocket) {
      try {
        // Remove the socket reference from memory
        this.roomSocketManager.delete(userId);

        // 🧠 FIX: the Prisma OR query was incorrect before.
        // It was: { OR: [{ createdById: userId, joinedById: userId }] }
        // That’s invalid syntax — both conditions in a single object are AND-ed.
        // Correct way: separate them into different objects.
        const userRoom = await pc.room.findFirst({
          where: {
            OR: [
              { createdById: userId },
              { joinedById: userId }
            ],
            status: {
              in: ["ACTIVE", "FULL"]
            }
          },
          include: {
            game: {
              select: {
                id: true,
                winnerId: true,
                loserId: true,
                draw: true
              }
            }
          }
        });

        if (!userRoom) {
          console.log("⚠️ No active or waiting room found for user:", userId);
          return;
        }

        // Identify the opponent (if exists)
        const opponentId =
          userRoom.createdById === userId
            ? userRoom.joinedById
            : userRoom.createdById;

        if (!opponentId) {
          console.log(`Opponent not found for disconnected user ${userId}`);
          return;
        }

        const opponentSocket = this.roomSocketManager.get(opponentId);

        if (userRoom.status === "ACTIVE") {

          opponentSocket?.send(
            JSON.stringify({
              type: ROOM_OPP_DISCONNECTED,
              payload: {
                message: "Opponent disconnected during game. Waiting for reconnection..."
              }
            })
          );

          console.log(`User ${userId} disconnected mid-game from room ${userRoom.code}`);
        } 
        else if (userRoom.status === "FULL") {
          // Game not started yet
          opponentSocket?.send(
            JSON.stringify({
              type: ROOM_OPP_DISCONNECTED,
              payload: {
                message: "Opponent left the lobby before game start."
              }
            })
          );

          console.log(`User ${userId} disconnected from lobby of room ${userRoom.code}`);
        }

      } catch (error) {
        console.error("❌ Error handling room disconnection:", error);
      }
    }

      
  }



  
  export const roomManager = new RoomManager();