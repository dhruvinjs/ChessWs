import { redis } from '../clients/redisClient';
import { WebSocket } from 'ws';
import { GameMessages, ErrorMessages } from '../utils/messages';
import {
  acceptDraw,
  getGameState,
  handleGuestGameMove,
  offerDraw,
  playerLeft,
  reconnectPlayer,
  rejectDraw,
  validateGamePayload,
} from '../Services/GameServices';
import {
  insertPlayerInQueue,
  matchingPlayer,
  removePlayerFromQueue,
} from '../Services/MatchMaking';
import { Chess } from 'chess.js';
import provideValidMoves, { GUEST_MATCHMAKING_KEY } from '../utils/chessUtils';
import pc from '../clients/prismaClient';
export class GameManager {
  private socketMap: Map<string, WebSocket> = new Map();
  private globalSetInterval: NodeJS.Timeout | null = null;
  private checkQueueInterval: NodeJS.Timeout | null = null;
  async addUser(socket: WebSocket, id: string) {
    this.socketMap.set(id, socket);
    this.gameMessageHandler(socket, id);

    const existingGameId = await redis.get(`user:${id}:game`);
    if (existingGameId) {
      // update socketMap for reconnection
      await reconnectPlayer(id, existingGameId, socket, this.socketMap);
      return;
    }

    // Check if player is already in matchmaking queue (e.g., after page reload)
    const isInQueue = await redis.zScore(GUEST_MATCHMAKING_KEY, id);
    if (isInQueue !== null) {
      console.log(`Player ${id} is already in queue, restoring search state`);
      socket.send(
        JSON.stringify({
          type: GameMessages.ALREADY_IN_QUEUE,
          payload: {
            searching: true,
            message: 'You are already in the matchmaking queue',
          },
        })
      );
    }
  }

  async checkQueueAndSendMessage() {
    //already running then return otherwise 2 setIntervals will be running
    if (this.checkQueueInterval) return;
    //Check every 30 seconds for players in queue

    this.checkQueueInterval = setInterval(async () => {
      const now = Date.now();
      const twoMinutesAgo = now - 2 * 60 * 1000;
      const queue_length = await redis.zCard(GUEST_MATCHMAKING_KEY);
      if (queue_length === 0 && this.checkQueueInterval) {
        console.log('Queue empty, stopping queue check interval');

        clearInterval(this.checkQueueInterval);
        this.checkQueueInterval = null;
        return;
      }
      // Remove players who have been in queue for more than 5 minutes
      const expiredPlayers = await redis.zRangeByScore(
        GUEST_MATCHMAKING_KEY,
        0,
        twoMinutesAgo
      );

      if (expiredPlayers.length > 0) {
        console.log(
          `Removing ${expiredPlayers.length} expired players from queue`
        );
        for (const playerId of expiredPlayers) {
          await redis.zRem(GUEST_MATCHMAKING_KEY, playerId);
          await redis.zRem('guest:notified:players', playerId);

          const playerSocket = this.socketMap.get(playerId);
          if (playerSocket) {
            playerSocket.send(
              JSON.stringify({
                type: GameMessages.QUEUE_EXPIRED,
                payload: {
                  message:
                    'Your matchmaking session has expired. Please try again.',
                },
              })
            );
          }
        }
      }

      // Notify players waiting for 3+ minutes but less than 5 minutes
      const queue = await redis.zRangeByScore(
        GUEST_MATCHMAKING_KEY,
        0, // max or larger score
        twoMinutesAgo // min or lower score becuase 3 minutes ago is still smaller than 0
      );
      console.log(
        `in checkQueueInterval, found ${queue.length} players waiting 3+ minutes`
      );
      if (queue.length <= 0) return;
      console.log('QUEUE EXISTS CHECKPOINT');
      for (const playerId of queue) {
        // Check if we've already notified this player using sorted set
        const notifiedScore = await redis.zScore(
          'guest:notified:players',
          playerId
        );
        if (notifiedScore !== null) {
          continue; // Skip if already notified
        }

        const playerSocket = this.socketMap.get(playerId);
        if (!playerSocket) {
          //removing the staleId from the sortedSets who doesnt have sockets
          await redis.zRem(GUEST_MATCHMAKING_KEY, playerId);
          continue;
        }
        console.log(`Sending the messages to user ${playerId} CHECKPOINT`);
        playerSocket.send(
          JSON.stringify({
            type: GameMessages.NO_ACTIVE_USERS,
            payload: {
              message: 'No active users for now, So can you sign in basically!',
            },
          })
        );
        // Mark player as notified with timestamp in sorted set
        await redis.zAdd('guest:notified:players', {
          value: playerId,
          score: now,
        });
      }
    }, 30000); // Run every 30 seconds
  }

  async startTimer() {
    // if globalSetInterval is not null means it is already running and this will run
    // there are active-games other wise it will stop
    if (this.globalSetInterval) {
      console.log('Timer already running');
      return;
    }

    console.log('⏰ Starting global timer');

    //running all the time
    this.globalSetInterval = setInterval(async () => {
      try {
        // Get all active games
        const activeGames = await redis.sMembers('active-games');

        // If no games, stop the timer
        if (!activeGames || activeGames.length === 0) {
          console.log('No active games, stopping timer');
          if (this.globalSetInterval) {
            clearInterval(this.globalSetInterval);
            this.globalSetInterval = null;
          }
          return;
        }

        // Process each game
        for (const gameId of activeGames) {
          const game = (await redis.hGetAll(`guest-game:${gameId}`)) as Record<
            string,
            string
          >;

          // Skip if game not found
          if (!game || Object.keys(game).length === 0) {
            await redis.sRem('active-games', gameId);
            continue;
          }

          // Skip if game already over
          if (
            game.status === GameMessages.GAME_OVER ||
            game.status === GameMessages.DISCONNECTED
          ) {
            await redis.sRem('active-games', gameId);
            continue;
          }

          // Get current timers and turn
          let blackTimer = Number(game.blackTimer) || 0;
          let whiteTimer = Number(game.whiteTimer) || 0;
          const fen = game.fen;
          const turn = fen.split(' ')[1]; // 'w' or 'b'

          // Only decrement if timer is still positive
          if (turn === 'w' && whiteTimer > 0) {
            const newWhiteTimer = await redis.hIncrBy(
              `guest-game:${gameId}`,
              'whiteTimer',
              -1
            );
            whiteTimer = Math.max(0, Number(newWhiteTimer));
            // If timer went negative, reset to 0 in Redis
            if (newWhiteTimer < 0) {
              await redis.hSet(`guest-game:${gameId}`, 'whiteTimer', '0');
              whiteTimer = 0;
            }
          } else if (turn === 'b' && blackTimer > 0) {
            const newBlackTimer = await redis.hIncrBy(
              `guest-game:${gameId}`,
              'blackTimer',
              -1
            );
            blackTimer = Math.max(0, Number(newBlackTimer));
            // If timer went negative, reset to 0 in Redis
            if (newBlackTimer < 0) {
              await redis.hSet(`guest-game:${gameId}`, 'blackTimer', '0');
              blackTimer = 0;
            }
          }

          // Get sockets
          const whiteSocket = this.socketMap.get(game.whitePlayerId);
          const blackSocket = this.socketMap.get(game.blackPlayerId);

          // Send timer update to both players
          if (whiteSocket && blackSocket) {
            const timerMessage = {
              type: GameMessages.TIMER_UPDATE,
              payload: {
                whiteTimer: whiteTimer,
                blackTimer: blackTimer,
              },
            };

            whiteSocket.send(JSON.stringify(timerMessage));
            blackSocket.send(JSON.stringify(timerMessage));
          }

          // Check if time ran out
          if (whiteTimer <= 0 || blackTimer <= 0) {
            await this.handleTimeExpired(game, gameId, whiteTimer, blackTimer);
          }
        }
      } catch (error) {
        console.error('Error in timer:', error);
      }
    }, 1000); // Run every 1 second
  }

  async handleTimeExpired(
    game: Record<string, string>,
    gameId: string,
    whiteTimer: number,
    blackTimer: number
  ) {
    try {
      // If white timer <= 0, black wins. If black timer <= 0, white wins.
      const winnerId =
        whiteTimer <= 0 ? game.blackPlayerId : game.whitePlayerId;
      const loserId = whiteTimer <= 0 ? game.whitePlayerId : game.blackPlayerId;
      const winnerColor = whiteTimer <= 0 ? 'b' : 'w';
      const loserColor = whiteTimer <= 0 ? 'w' : 'b';
      const existingGameFromDb = await pc.guestGames.findUnique({
        where: { id: Number(gameId) },
        select: {
          player1Color: true,
        },
      });
      if (!existingGameFromDb) {
        console.log(`The game ${gameId} does not exist in DB`);
        return;
      }
      await redis.hSet(`guest-game:${gameId}`, {
        status: GameMessages.GAME_OVER,
        winner: winnerColor,
        whiteTimer: String(whiteTimer),
        blackTimer: String(blackTimer),
      });
      const final_capturedPieces = await redis.lRange(
        `guest-game:${gameId}:capturedPieces`,
        0,
        -1
      );
      const raw_moves = await redis.lRange(`guest-game:${gameId}:moves`, 0, -1);
      const final_moves = raw_moves.map((move) => JSON.parse(move));
      //Time Logic FOR DB
      const player1TimerLeft =
        existingGameFromDb.player1Color === 'w' ? whiteTimer : blackTimer;
      const player2TimeLeft =
        existingGameFromDb.player1Color === 'w' ? blackTimer : whiteTimer;
      const final_player1DrawCount =
        existingGameFromDb.player1Color === 'w'
          ? game.whitePlayerDrawOfferCount
          : game.blackPlayerDrawOfferCount;
      const final_player2DrawCount =
        existingGameFromDb.player1Color === 'b'
          ? game.whitePlayerDrawOfferCount
          : game.blackPlayerDrawOfferCount;

      await redis.sRem('active-games', gameId);
      await redis.expire(`guest-game:${gameId}`, 600);
      await pc.guestGames.update({
        where: {
          id: Number(gameId),
        },
        data: {
          status: 'FINISHED',
          winner: winnerColor,
          loser: loserColor,
          moves: final_moves,
          capturedPieces: final_capturedPieces,
          endedAt: new Date(),
          currentFen: game.fen,
          draw: false,
          player1TimeLeft: player1TimerLeft,
          player2TimeLeft: player2TimeLeft,
          player1DrawOfferCount: Number(final_player1DrawCount),
          player2DrawOfferCount: Number(final_player2DrawCount),
        },
      });
      const winnerSocket = this.socketMap.get(winnerId);
      const loserSocket = this.socketMap.get(loserId);
      const winnerMessage = JSON.stringify({
        type: GameMessages.TIME_EXCEEDED,
        payload: {
          result: 'win',
          reason: GameMessages.TIME_EXCEEDED,
          winner: winnerColor,
          loser: loserColor,
          message: '🎉 You won! Your opponent ran out of time.',
        },
      });

      // Send loser message
      const loserMessage = JSON.stringify({
        type: GameMessages.TIME_EXCEEDED,
        payload: {
          result: 'lose',
          reason: GameMessages.TIME_EXCEEDED,
          winner: winnerColor,
          loser: loserColor,
          message: "⏱️ Time's up! You lost on time.",
        },
      });

      winnerSocket?.send(winnerMessage);
      loserSocket?.send(loserMessage);
    } catch (error) {
      console.log('error in handleTimeExpired: ', error);
    }
  }

  async restoreGuestGameFromDb(gameId: string, socket: WebSocket) {
    const restoredGameFromDb = await pc.guestGames.findFirst({
      where: {
        id: Number(gameId),
      },
    });
    if (!restoredGameFromDb || restoredGameFromDb.status === 'FINISHED') {
      console.log(`Game : ${gameId} does not exist on DB or Game is FINISHED`);
      socket.send(
        JSON.stringify({
          type: GameMessages.GAME_NOT_FOUND,
          payload: {
            code: 'GAME_NOT_FOUND',
            message: 'Your game session has expired or was lost.',
          },
        })
      );
      return;
    }
    //Timers
    let whiteTimer =
      restoredGameFromDb.player1Color === 'w'
        ? restoredGameFromDb.player1TimeLeft
        : restoredGameFromDb.player2TimeLeft;
    let blackTimer =
      restoredGameFromDb.player1Color === 'w'
        ? restoredGameFromDb.player2TimeLeft
        : restoredGameFromDb.player1TimeLeft;
    //Ids
    let whitePlayerId =
      restoredGameFromDb.player1Color === 'w'
        ? restoredGameFromDb.player1GuestId
        : restoredGameFromDb.player2GuestId;
    let blackPlayerId =
      restoredGameFromDb.player1Color === 'w'
        ? restoredGameFromDb.player2GuestId
        : restoredGameFromDb.player1GuestId;
    const whitePlayerDrawOfferCount =
      restoredGameFromDb.player1Color === 'w'
        ? restoredGameFromDb.player1DrawOfferCount
        : restoredGameFromDb.player2DrawOfferCount;
    const blackPlayerDrawOfferCount =
      restoredGameFromDb.player1Color === 'b'
        ? restoredGameFromDb.player1DrawOfferCount
        : restoredGameFromDb.player2DrawOfferCount;

    const movesArray = (
      Array.isArray(restoredGameFromDb.moves) ? restoredGameFromDb.moves : []
    ) as string[];
    const movesCount = movesArray.length.toString();
    await redis.hSet(`guest-game:${gameId}`, {
      player1TimeLeft: String(restoredGameFromDb.player1TimeLeft),
      player2TimeLeft: String(restoredGameFromDb.player2TimeLeft),
      whiteTimer: String(whiteTimer),
      blackTimer: String(blackTimer),
      whitePlayerId: whitePlayerId,
      blackPlayerId: blackPlayerId,
      status: GameMessages.GAME_ACTIVE,
      fen: restoredGameFromDb.currentFen,
      movesCount: movesCount,
      whitePlayerDrawCount: whitePlayerDrawOfferCount,
      blackPlayerDrawCount: blackPlayerDrawOfferCount,
    });
    if (movesArray.length > 0) {
      await redis.del(`guest-games:${gameId}:moves`);
      for (const move of movesArray) {
        await redis.rPush(`guest-game:${gameId}:moves`, JSON.stringify(move));
      }
    }
    await redis.sAdd('active-games', gameId.toString());
    if (restoredGameFromDb.capturedPieces.length > 0) {
      await redis.del(`guest-game:${gameId}:capturedPieces`);
      //Use for of loop basically for async await becuase in
      //forEach the promises are not awaited which can crash the code
      for (const pieces of restoredGameFromDb.capturedPieces) {
        await redis.rPush(`guest-game:${gameId}:capturedPieces`, pieces);
      }
    }

    // Restore draw offer counts - both Redis and DB use same logic (remaining offers, starts at 3)
    await redis.set(
      `drawOffers:${gameId}:${restoredGameFromDb.player1GuestId}`,
      restoredGameFromDb.player1DrawOfferCount.toString()
    );
    await redis.set(
      `drawOffers:${gameId}:${restoredGameFromDb.player2GuestId}`,
      restoredGameFromDb.player2DrawOfferCount.toString()
    );

    return {
      whitePlayerId: whitePlayerId,
      blackPlayerId: blackPlayerId,
      whiteTimer: whiteTimer,
      blackTimer: blackTimer,
      capturedPieces: restoredGameFromDb.capturedPieces,
      fen: restoredGameFromDb.currentFen,
      moves: movesArray,
      moveCount: movesCount,
    };
  }

  private gameMessageHandler(socket: WebSocket, id: string) {
    socket.on('message', async (message: string) => {
      const msg = JSON.parse(message);
      const { type, payload } = msg;

      const validationError = validateGamePayload(type, payload);
      if (validationError) {
        socket.send(
          JSON.stringify({
            type: ErrorMessages.PAYLOAD_ERROR,
            payload: { message: validationError },
          })
        );
        return;
      }

      // Cancel Search - remove player from matchmaking queue
      if (type === GameMessages.CANCEL_SEARCH) {
        const removed = await removePlayerFromQueue(id);

        socket.send(
          JSON.stringify({
            type: GameMessages.SEARCH_CANCELLED,
            payload: {
              success: removed,
              message: removed ? 'Search cancelled' : 'You were not in queue',
            },
          })
        );
        return;
      }

      //New Game Block
      if (type === GameMessages.INIT_GAME) {
        // checkQueue
        const matchFound = await matchingPlayer(id);

        if (!matchFound) {
          const response = await insertPlayerInQueue(id);
          if (!response) {
            socket.send(
              JSON.stringify({
                type: GameMessages.ALREADY_IN_QUEUE,
                payload: {
                  searching: true,
                  message: 'You are already in queue',
                },
              })
            );
            return; // Early return - player already in queue
          }
          await this.checkQueueAndSendMessage();
          return;
        }

        const matchedPlayerId = matchFound.opponentId;

        //id is the player who came new to queue to play
        const isPlayerWhite = Math.random() > 0.5;
        const whitePlayerId = isPlayerWhite ? id : matchedPlayerId;
        const blackPlayerId = isPlayerWhite ? matchedPlayerId : id;
        const whitePlayerSocket = this.socketMap.get(whitePlayerId);
        const blackPlayerSocket = this.socketMap.get(blackPlayerId);
        const playerDisconnectedPayload = {
          type: GameMessages.DISCONNECTED,
          payload: {
            message: 'player left, Finding another Match`',
          },
        };
        if (!whitePlayerSocket) {
          await insertPlayerInQueue(blackPlayerId);
          if (blackPlayerSocket) {
            blackPlayerSocket.send(JSON.stringify(playerDisconnectedPayload));
          }
          return;
        }
        if (!blackPlayerSocket) {
          await insertPlayerInQueue(whitePlayerId);
          whitePlayerSocket.send(JSON.stringify(playerDisconnectedPayload));
          return;
        }

        // const newGameId = uuidv4();
        const chess = new Chess();

        //matchesPlayerId is player1Id becuase he was the one standing in the queue so
        // technically he is the player1 and other player who just came is player2
        const guestGameDB = await pc.guestGames.create({
          data: {
            currentFen: chess.fen(),
            player1GuestId: matchedPlayerId,
            player2GuestId: id,
            player1Color: 'w',
            player1TimeLeft: 30,
            player2TimeLeft: 600,
            player1DrawOfferCount: 3,
            player2DrawOfferCount: 3,
            status: 'ACTIVE',
          },
        });
        // Save game state in Redis
        await redis
          .multi()
          .hSet(`guest-game:${guestGameDB.id}`, {
            whitePlayerId: whitePlayerId,
            blackPlayerId: blackPlayerId,
            whitePlayerDrawOfferCount: 3,
            blackPlayerDrawOfferCount: 3,
            status: GameMessages.GAME_ACTIVE,
            fen: chess.fen(),
            whiteTimer: 30,
            blackTimer: 600,
          })
          .setEx(`user:${matchedPlayerId}:game`, 1800, String(guestGameDB.id))
          .setEx(`user:${id}:game`, 1800, String(guestGameDB.id))
          .exec();

        // Precompute valid moves
        const moves = provideValidMoves(chess.fen());

        console.log('New game started:', String(guestGameDB.id));

        // Notify (white) Player
        whitePlayerSocket.send(
          JSON.stringify({
            type: GameMessages.INIT_GAME,
            payload: {
              color: 'w',
              gameId: String(guestGameDB.id),
              fen: chess.fen(),
              opponentId: id,
              turn: chess.turn(),
              whiteTimer: 30,
              blackTimer: 600,
              validMoves: moves, // include valid moves if you want
            },
          })
        );

        // Notify  (black) Player

        blackPlayerSocket.send(
          JSON.stringify({
            type: GameMessages.INIT_GAME,
            payload: {
              color: 'b',
              gameId: String(guestGameDB.id),
              fen: chess.fen(),
              opponentId: whitePlayerId,
              turn: chess.turn(),
              whiteTimer: 30,
              blackTimer: 600,
              moveCount: '0',
            },
          })
        );

        // Add to active games for global timer handling
        await redis.sAdd('active-games', String(guestGameDB.id));
        await redis.incr('guest:games:total');

        await this.startTimer();
      }

      if (type === GameMessages.MOVE) {
        const gameId = await redis.get(`user:${id}:game`);
        if (!gameId) {
          const message = {
            type: ErrorMessages.SERVER_ERROR,
            payload: {
              message:
                'internal server error cannot find game and cannot make move',
            },
          };
          socket.send(JSON.stringify(message));
          return;
        }

        // Check if game exists in Redis, if not restore from DB
        const gameExists = await redis.exists(`guest-game:${gameId}`);
        if (!gameExists) {
          console.log(`Game ${gameId} not found in Redis, restoring from DB`);
          const restored = await this.restoreGuestGameFromDb(gameId, socket);
          if (!restored) return;
        }

        handleGuestGameMove(
          socket,
          { to: payload.to, from: payload.from },
          gameId,
          id,
          this.socketMap
        );
        // provideValidMoves(gameId,socket)
      }

      if (type === GameMessages.LEAVE_GAME) {
        const gameId = await redis.get(`user:${id}:game`);
        if (!gameId) {
          const message = {
            type: ErrorMessages.SERVER_ERROR,
            payload: {
              message:
                'internal server error cannot find game and cannot make move',
            },
          };
          socket.send(JSON.stringify(message));
          return;
        }

        // Check if game exists in Redis, if not restore from DB
        const gameExists = await redis.exists(`guest-game:${gameId}`);
        if (!gameExists) {
          console.log(`Game ${gameId} not found in Redis, restoring from DB`);
          const restored = await this.restoreGuestGameFromDb(gameId, socket);
          if (!restored) return;
        }

        console.log('Player Left Block');
        playerLeft(id, gameId, socket, this.socketMap);
      }

      if (type === GameMessages.RECONNECT) {
        const { id } = payload;
        const gameId = await redis.get(`user:${id}:game`);
        if (!gameId) {
          socket.send(
            JSON.stringify({
              type: GameMessages.GAME_NOT_FOUND,
              payload: {
                message: 'Game Not found',
              },
            })
          );
          return;
        }

        // Check if game exists in Redis, if not restore from DB
        const gameExists = await redis.exists(`guest-game:${gameId}`);
        if (!gameExists) {
          console.log(`Game ${gameId} not found in Redis, restoring from DB`);
          const restored = await this.restoreGuestGameFromDb(gameId, socket);
          if (!restored) return;
        }

        await reconnectPlayer(id, gameId, socket, this.socketMap);
        return;
      }

      if (type === GameMessages.OFFER_DRAW) {
        const gameId = await redis.get(`user:${id}:game`);
        if (!gameId) {
          socket.send(
            JSON.stringify({
              type: GameMessages.GAME_NOT_FOUND,
              payload: {
                message: 'Game Not found',
              },
            })
          );
          return;
        }

        // Check if game exists in Redis, if not restore from DB
        const gameExists = await redis.exists(`guest-game:${gameId}`);
        if (!gameExists) {
          console.log(`Game ${gameId} not found in Redis, restoring from DB`);
          const restored = await this.restoreGuestGameFromDb(gameId, socket);
          if (!restored) return;
        }
        const cooldown = await redis.exists(`draw-offer:${id}`);
        if (cooldown) {
          socket.send(
            JSON.stringify({
              type: GameMessages.DRAW_COOLDOWN,
              payload: {
                message:
                  'Draw offer can only be sent after few minutes! Spamming is not allowed',
              },
            })
          );
          return;
        }
        await offerDraw(id, gameId, socket, this.socketMap);
        return;
      }
      if (type === GameMessages.ACCEPT_DRAW) {
        const gameId = await redis.get(`user:${id}:game`);
        if (!gameId) {
          socket.send(
            JSON.stringify({
              type: GameMessages.GAME_NOT_FOUND,
              payload: {
                message: 'Game Not found',
              },
            })
          );
          return;
        }

        // Check if game exists in Redis, if not restore from DB
        const gameExists = await redis.exists(`guest-game:${gameId}`);
        if (!gameExists) {
          console.log(`Game ${gameId} not found in Redis, restoring from DB`);
          const restored = await this.restoreGuestGameFromDb(gameId, socket);
          if (!restored) return;
        }

        await acceptDraw(gameId, socket, this.socketMap);
        return;
      }

      if (type === GameMessages.REJECT_DRAW) {
        const gameId = await redis.get(`user:${id}:game`);
        if (!gameId) {
          socket.send(
            JSON.stringify({
              type: GameMessages.GAME_NOT_FOUND,
              payload: {
                message: 'Game Not found',
              },
            })
          );
          return;
        }

        // Check if game exists in Redis, if not restore from DB
        const gameExists = await redis.exists(`guest-game:${gameId}`);
        if (!gameExists) {
          console.log(`Game ${gameId} not found in Redis, restoring from DB`);
          const restored = await this.restoreGuestGameFromDb(gameId, socket);
          if (!restored) return;
        }

        await rejectDraw(id, gameId, socket, this.socketMap);
        return;
      }
    });
  }

  async handleDisconnection(playerId: string) {
    //this is the gameId:string which can be retrieved using the playerId
    const gameId = await redis.get(`user:${playerId}:game`);
    if (!gameId) {
      // await removePlayerFromQueue(playerId);
      // if(removed)
      return GameMessages.DISCONNECTED;
    }
    const existingGame = await getGameState(gameId);
    if (!existingGame) return GameMessages.GAME_NOT_FOUND;

    if (existingGame.gameEnded) {
      console.log(`Game ${gameId} already over, ignoring disconnection`);
      // Clean up socket but don't change game state
      this.socketMap.delete(playerId);
      return;
    }
    // if disconnected player is white then connected user is black and message
    // will be sent to that connected_user
    const connected_user =
      existingGame.whitePlayerId === playerId
        ? existingGame.blackPlayerId
        : existingGame.whitePlayerId;
    const user_socket = this.socketMap.get(connected_user);
    const message = JSON.stringify({
      type: GameMessages.DISCONNECTED,
      payload: {
        message: 'Opponent Left due to bad connectivty',
      },
    });

    await redis.hSet(`guest-game:${gameId}`, {
      status: GameMessages.DISCONNECTED,
      disconnectedBy: playerId,
      timestamp: Date.now().toString(),
    });
    user_socket?.send(message);

    setTimeout(async () => {
      const latestStatus = await redis.hGet(`guest-game:${gameId}`, 'status');
      if (latestStatus !== GameMessages.DISCONNECTED) return;

      const winner = connected_user;

      await redis.hSet(`guest-game:${gameId}`, {
        status: GameMessages.GAME_OVER,
        winner: winner,
      });
      const message = JSON.stringify({
        type: GameMessages.GAME_OVER,
        payload: {
          winner: winner,
          reason: GameMessages.DISCONNECTED,
        },
      });
      user_socket?.send(message);
    }, 60 * 1000);
  }
}

export const gameManager = new GameManager();
