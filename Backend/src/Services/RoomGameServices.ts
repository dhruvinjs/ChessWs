import { Chess } from 'chess.js';
import pc from '../clients/prismaClient';
import { redis } from '../clients/redisClient';
import { Move } from './GameServices';
import { roomManager } from '../Classes/RoomManager';
import { WebSocket } from 'ws';
import { ErrorMessages, GameMessages, RoomMessages } from '../utils/messages';
import provideValidMoves from '../utils/chessUtils';

export async function getRoomGameState(gameId: number) {
  const gameExists = (await redis.hGetAll(`room-game:${gameId}`)) as Record<
    string,
    string
  >;

  const movesRaw = await redis.lRange(`room-game:${gameId}:moves`, 0, -1);
  const moves = movesRaw.map((m) => JSON.parse(m));

  const chatRaw = await redis.lRange(`room-game:${gameId}:chat`, 0, -1);
  const chat = chatRaw.map((c) => JSON.parse(c));

  const capturedPieces = await redis.lRange(
    `room-game:${gameId}:capturedPieces`,
    0,
    -1
  );

  if (
    !gameExists ||
    Object.keys(gameExists).length === 0 ||
    gameExists.status === RoomMessages.ROOM_GAME_OVER
  ) {
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
    chat: chat,
    capturedPieces: capturedPieces,
    roomCode: gameExists.roomCode,
  };
}

export async function handleRoomMove(
  userId: Number,
  userSocket: WebSocket,
  move: Move,
  gameId: number,
  socketManager: Map<number, WebSocket>
) {
  const existingGame = await getRoomGameState(gameId);
  if (!existingGame) {
    userSocket.send(
      JSON.stringify({
        type: RoomMessages.ROOM_GAME_NOT_FOUND,
        payload: { message: 'Game Message Not Found' },
      })
    );
    return;
  }
  const chess = new Chess(existingGame.fen);
  const turn = existingGame.fen.split(' ')[1];
  const movingPlayerColor = turn === 'w' ? 'w' : 'b';
  const opponentId =
    userId === existingGame.user1 ? existingGame.user2 : existingGame.user1;
  if (!opponentId) {
    console.log('Opponent Id Error');
    return null;
  }

  if (
    (turn === 'w' && existingGame.user1 !== userId) ||
    (turn === 'b' && existingGame.user2 !== userId)
  ) {
    const message = JSON.stringify({
      type: GameMessages.WRONG_PLAYER_MOVE,
      payload: {
        message: 'Not your turn',
      },
    });
    userSocket.send(message);
    return null;
  }

  let capturedPiece = null;
  try {
    const boardMove = chess.move({
      to: move.to,
      from: move.from,
    });

    await redis.rPush(`room-game:${gameId}:moves`, JSON.stringify(move));
    await redis.hSet(`room-game:${gameId}`, 'fen', chess.fen());

    if (boardMove.captured) {
      const capturedColor = boardMove.color === 'b' ? 'w' : 'b';
      const pieceCaptured = boardMove.captured.toUpperCase(); // p => P, k=> K
      const capturedCode = `${capturedColor}${pieceCaptured}`; //bK=> for frontend display of piece
      capturedPiece = capturedCode;

      await redis.rPush(`room-game:${gameId}:capturedPieces`, capturedPiece);
      console.log('Room Captured Piece:', capturedPiece);
    }
    const updatedMoveCnt = await redis.hIncrBy(
      `room-game:${gameId}`,
      'moveCount',
      1
    );
    if (updatedMoveCnt % roomManager.MOVES_BEFORE_SAVE === 0) {
      const updatedGameData = (await redis.hGetAll(
        `room-game:${gameId}`
      )) as Record<string, string>;

      await saveGameProgress(
        gameId,
        updatedGameData,
        updatedGameData.currentFen,
        movingPlayerColor
      );
    }
  } catch (error) {
    console.error('Error processing Room-move:', error);
    userSocket.send(
      JSON.stringify({
        type: RoomMessages.ILLEGAL_ROOM_MOVE,
        payload: {
          message:
            'Server error while processing move or illegal move attempted',
        },
      })
    );
    return;
  }
  const opponentSocket = socketManager.get(opponentId);

  if (chess.isStalemate()) {
    await handleRoomDraw(
      userSocket,
      opponentSocket,
      gameId,
      'Draw by stalemate'
    );
    return;
  } else if (chess.isInsufficientMaterial()) {
    await handleRoomDraw(
      userSocket,
      opponentSocket,
      gameId,
      'Draw due to insufficient material'
    );
    return;
  } else if (chess.isThreefoldRepetition()) {
    await handleRoomDraw(
      userSocket,
      opponentSocket,
      gameId,
      'Draw by threefold repetition'
    );
    return;
  } else if (chess.isDraw()) {
    await handleRoomDraw(
      userSocket,
      opponentSocket,
      gameId,
      'Draw by 50-move rule'
    );
    return;
  }
  // Game Over logic
  if (chess.isGameOver()) {
    const winnerColor = chess.turn() === 'w' ? 'b' : 'w';
    const loserColor = winnerColor === 'b' ? 'w' : 'b';
    const winnerId =
      winnerColor === 'w' ? existingGame.user1 : existingGame.user2;
    const loserId =
      winnerColor === 'b' ? existingGame.user2 : existingGame.user1;

    const finalGameData = (await redis.hGetAll(
      `room-game:${gameId}`
    )) as Record<string, string>;
    await saveGameProgress(
      gameId,
      finalGameData,
      chess.fen(),
      movingPlayerColor
    );

    const winnerSocket = socketManager.get(winnerId);
    const loserSocket = socketManager.get(loserId);
    await redis.hSet(`room-game:${gameId}`, {
      status: RoomMessages.ROOM_GAME_OVER,
      winner: winnerColor,
    });
    await redis.expire(`room-game:${gameId}`, 86400);
    await redis.sRem(`room-active-games`, gameId.toString());

    // Get final game data including captured pieces
    const finalMovesRaw = await redis.lRange(
      `room-game:${gameId}:moves`,
      0,
      -1
    );
    const finalMoves = finalMovesRaw.map((m) => JSON.parse(m));
    const finalChatRaw = await redis.lRange(`room-game:${gameId}:chat`, 0, -1);
    const finalChat = finalChatRaw.map((c) => JSON.parse(c));
    const finalCapturedPieces = await redis.lRange(
      `room-game:${gameId}:capturedPieces`,
      0,
      -1
    );

    await pc.$transaction([
      pc.game.update({
        where: { id: gameId },
        data: {
          winnerId,
          loserId,
          draw: false,
          endedAt: new Date(Date.now()),
          moves: finalMoves,
          chat: finalChat,
          capturedPieces: finalCapturedPieces,
          currentFen: chess.fen(),
          status: 'FINISHED',
        },
      }),
      pc.room.update({
        where: { code: existingGame.roomCode },
        data: {
          status: 'FINISHED',
        },
      }),
    ]);

    const winnerMessage = JSON.stringify({
      type: RoomMessages.ROOM_GAME_OVER,
      payload: {
        result: 'win',
        message: "🏆 Congratulations! You've won the game.",
        winner: winnerColor,
        loser: loserColor,
        roomStatus: 'FINISHED',
        gameStatus: 'GAME_OVER',
      },
    });

    const loserMessage = JSON.stringify({
      type: RoomMessages.ROOM_GAME_OVER,
      payload: {
        result: 'lose',
        message: "💔 Game over. You've been checkmated.",
        winner: winnerColor,
        loser: loserColor,
        roomStatus: 'FINISHED',
        gameStatus: 'GAME_OVER',
      },
    });

    winnerSocket?.send(winnerMessage);
    loserSocket?.send(loserMessage);

    return;
  }

  const validMoves = provideValidMoves(chess.fen());

  const oppPayload = {
    type: RoomMessages.ROOM_MOVE,
    payload: {
      move,
      turn: chess.turn(),
      fen: chess.fen(),
      validMoves,
      capturedPiece,
    },
  };
  const currentPlayerPayload = {
    type: RoomMessages.ROOM_MOVE,
    payload: {
      move,
      turn: chess.turn(),
      fen: chess.fen(),
      validMoves: [],
      capturedPiece,
    },
  };

  userSocket.send(JSON.stringify(currentPlayerPayload));
  opponentSocket?.send(JSON.stringify(oppPayload));

  if (chess.isCheck()) {
    const attackerCheckMessage = {
      type: GameMessages.CHECK,
      payload: {
        message:
          "Check! You\'ve put the opposing King under fire. The pressure is on them now!",
      },
    };

    const defenderCheckMessage = {
      type: GameMessages.CHECK,
      payload: {
        message: 'You are in Check! Defend your King immediately. Your move.',
      },
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
    const message = JSON.stringify({
      type: RoomMessages.ROOM_DRAW,
      payload: {
        reason,
        roomStatus: 'FINISHED',
        gameStatus: 'GAME_OVER',
      },
    });

    userSocket.send(message);
    opponentSocket?.send(message);

    await redis.hSet(`room-game:${gameId}`, {
      status: RoomMessages.ROOM_GAME_OVER,
      winner: 'draw',
      drawReason: reason,
    });
    await redis.sRem(`room-active-games`, gameId.toString());
    await redis.expire(`room-game:${gameId}`, 86400);

    // Get roomCode from Redis for DB update
    const gameData = (await redis.hGetAll(`room-game:${gameId}`)) as Record<
      string,
      string
    >;
    const roomCode = gameData.roomCode as string;

    await pc.$transaction([
      pc.game.update({
        where: { id: gameId },
        data: {
          draw: true,
          status: 'FINISHED',
        },
      }),
      pc.room.update({
        where: { code: roomCode },
        data: {
          status: 'FINISHED',
          updatedAt: new Date(),
        },
      }),
    ]);
    console.log(`GameDraw ${gameId}: ${reason}`);
  } catch (error) {
    console.error(`Error handling draw for game ${gameId}:`, error);
  }
}

export async function handleRoomReconnection(
  userId: number,
  userSocket: WebSocket,
  gameId: number,
  roomSocketManager: Map<number, WebSocket>
) {
  const existingGame = await getRoomGameState(gameId);

  if (!existingGame) {
    userSocket.send(
      JSON.stringify({
        type: RoomMessages.ROOM_GAME_OVER,
        payload: { message: 'The Game You are looking for is over' },
      })
    );
    return;
  }

  const opponentId =
    userId === existingGame.user1 ? existingGame.user2 : existingGame.user1;
  const userColor = userId === existingGame.user1 ? 'w' : 'b';
  const chatArr = existingGame.chat ? existingGame.chat : [];
  await redis.sAdd('room-active-games', gameId.toString());

  // Get room info using roomCode from existingGame
  const room = await pc.room.findUnique({
    where: { code: existingGame.roomCode },
    include: {
      createdBy: { select: { id: true, name: true } },
      joinedBy: { select: { id: true, name: true } },
    },
  });

  const isCreator = room?.createdById === userId;
  const opponentInfo = isCreator ? room?.joinedBy : room?.createdBy;

  // Get valid moves for current position
  const chess = new Chess(existingGame.fen);
  const validMoves = chess.moves({ verbose: true });

  // Send reconnection data to the user with room context
  userSocket.send(
    JSON.stringify({
      type: RoomMessages.ROOM_RECONNECT,
      payload: {
        color: userColor,
        gameId: gameId,
        fen: existingGame.fen,
        whiteTimer: Number(existingGame.whiteTimer),
        blackTimer: Number(existingGame.blackTimer),
        validMoves: validMoves,
        moves: existingGame.moves,
        count: existingGame.moveCount,
        chat: chatArr,
        capturedPieces: existingGame.capturedPieces || [],
        roomCode: existingGame.roomCode,
        isCreator: isCreator,
        opponentId: opponentId,
        opponentName: opponentInfo?.name || null,
        roomGameId: gameId,
      },
    })
  );

  console.log(
    `User ${userId} reconnected to room-game:${gameId}, restarting timers...`
  );
  roomManager.startRoomTimer();
}

export async function handleRoomChat(
  userId: number,
  userSocket: WebSocket,
  gameId: number,
  message: string,
  roomSocketManager: Map<number, WebSocket>
) {
  try {
    const existingGame = await getRoomGameState(gameId);

    if (!existingGame) {
      userSocket.send(
        JSON.stringify({
          type: RoomMessages.ROOM_GAME_OVER,
          payload: { message: 'The Game You are looking for is over' },
        })
      );
      return;
    }
    const opponentId =
      userId === existingGame.user1 ? existingGame.user2 : existingGame.user1;
    const opponentSocket = roomSocketManager.get(opponentId);
    await redis.rPush(
      `room-game:${gameId}:chat`,
      JSON.stringify({
        sender: userId,
        message,
        timestamp: Date.now(),
      })
    );
    const timestamp = Date.now();
    const chatPayload = {
      type: RoomMessages.ROOM_CHAT,
      payload: {
        message: message,
        sender: userId,
        timestamp: timestamp,
      },
    };
    userSocket.send(JSON.stringify(chatPayload));
    // Send to opponent only - sender will see their own message from frontend
    opponentSocket?.send(JSON.stringify(chatPayload));
  } catch (error) {
    console.log('Error in handleRoomChat: ', error);
    userSocket.send(
      JSON.stringify({
        type: ErrorMessages.SERVER_ERROR,
        payload: {
          message: 'Server Error, Please send the message again!',
        },
      })
    );
  }
}

export function validatePayload(type: string, payload: any): string | null {
  if (!payload) {
    return 'Missing Payload Object';
  }
  switch (type) {
    case RoomMessages.INIT_ROOM_GAME:
      if (!payload.roomCode) return 'Missing roomCode';
      break;
    case RoomMessages.ROOM_RECONNECT:
      if (!payload.roomGameId) return 'Missing GameId';
      break;
    case RoomMessages.ROOM_MOVE:
      if (!payload.to || !payload.from || !payload.roomGameId)
        return 'Missing Move or GameId';
      break;
    case RoomMessages.ROOM_CHAT:
      if (!payload.message) return 'Missing message';
      if (!payload.roomGameId && !payload.roomId)
        return 'Missing roomGameId or roomId';
      break;
    case RoomMessages.ROOM_LEAVE_GAME:
      if (!payload.roomGameId) return 'Missing field: gameId';
      break;
    case RoomMessages.LEAVE_ROOM:
      if (!payload.roomId) return 'Missing Room Code';
      break;
    default:
      return null;
  }
  return null;
}

export async function handleRoomGameLeave(
  userId: number,
  userSocket: WebSocket,
  gameId: number,
  socketManager: Map<number, WebSocket>
) {
  try {
    // --- Fetch room and game details (exclude finished/cancelled rooms) ---
    const room = await pc.room.findFirst({
      where: {
        game: { id: gameId },
        status: { notIn: ['FINISHED', 'CANCELLED'] },
      },
      include: { game: true },
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

    if (room.status !== 'ACTIVE') {
      // Not an active game, ignore this handler
      userSocket.send(
        JSON.stringify({
          type: ErrorMessages.SERVER_ERROR,
          payload: { message: 'No active game to leave' },
        })
      );
      return;
    }

    // --- Determine roles ---
    const isCreator = room.createdById === userId;
    const isJoiner = room.joinedById === userId;
    const winnerId = isCreator ? room.joinedById : room.createdById;

    // --- Fetch final Redis data (if exists) ---
    const finalGameData = (await redis.hGetAll(
      `room-game:${gameId}`
    )) as Record<string, string>;

    if (finalGameData && Object.keys(finalGameData).length > 0) {
      const movesRaw = await redis.lRange(`room-game:${gameId}:moves`, 0, -1);
      const chatRaw = await redis.lRange(`room-game:${gameId}:chat`, 0, -1);

      const moves = movesRaw.map((m) => JSON.parse(m));
      const chat = chatRaw.map((c) => JSON.parse(c));

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
      data: { status: 'FINISHED' },
    });

    // --- Notify sockets ---
    const oppSocket = socketManager.get(winnerId!);

    // Send game over message to winner with confetti
    oppSocket?.send(
      JSON.stringify({
        type: RoomMessages.ROOM_GAME_OVER,
        payload: {
          message: '🎉 You won! Your opponent resigned.',
          winner: winnerId,
          loser: userId,
          reason: 'resignation',
          roomStatus: 'FINISHED',
          gameStatus: 'GAME_OVER',
        },
      })
    );

    // Send resignation confirmation to the user who left
    userSocket.send(
      JSON.stringify({
        type: RoomMessages.ROOM_LEFT,
        payload: {
          message: 'You have resigned from the game',
          roomStatus: 'FINISHED',
          gameStatus: 'GAME_OVER',
        },
      })
    );

    // --- Redis cleanup ---
    await redis.sRem('room-active-games', gameId.toString());
    await redis.del(`room-game:${gameId}`);
    await redis.del(`room-game:${gameId}:moves`);
    await redis.del(`room-game:${gameId}:chat`);
  } catch (error) {
    console.error('Error in handleRoomGameLeave:', error);
  }
}

export async function handleRoomLeave(
  userId: number,
  roomCode: string,
  userSocket: WebSocket,
  roomSocketManager: Map<number, WebSocket>
) {
  try {
    const room = await pc.room.findFirst({
      where: {
        code: roomCode,
        status: { notIn: ['FINISHED', 'CANCELLED'] },
      },
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
    if (room.status === 'WAITING') {
      if (userId !== room.createdById) {
        userSocket.send(
          JSON.stringify({
            type: ErrorMessages.SERVER_ERROR,
            payload: { message: 'You Did not created this room' },
          })
        );
        return;
      }
      await pc.room.update({
        where: {
          id: room.id,
        },
        data: {
          status: 'CANCELLED',
        },
      });
      userSocket.send(
        JSON.stringify({
          type: RoomMessages.ROOM_LEFT,
          payload: {
            message: 'Room Left Successfully',
          },
        })
      );
      return;
    }
    const isCreator = room.createdById === userId;
    const isJoiner = room.joinedById === userId;
    const opponentId = isCreator ? room.joinedById : room.createdById;

    if (room.status === 'FULL' && isCreator) {
      await pc.room.update({
        where: { id: room.id },
        data: {
          joinedById: null,
          status: 'CANCELLED',
        },
      });

      if (opponentId) {
        const oppSocket = roomSocketManager.get(opponentId);
        oppSocket?.send(
          JSON.stringify({
            type: RoomMessages.ROOM_OPPONENT_LEFT,
            payload: { message: 'Room creator left. Room cancelled.' },
          })
        );
      }

      userSocket.send(
        JSON.stringify({
          type: RoomMessages.ROOM_GAME_OVER,
          payload: { message: 'You left before game start.' },
        })
      );
    } else if (room.status === 'FULL' && isJoiner) {
      await pc.room.update({
        where: { id: room.id },
        data: {
          joinedById: null,
          status: 'WAITING',
        },
      });
      const creatorSocket = roomSocketManager.get(room.createdById);
      creatorSocket?.send(
        JSON.stringify({
          type: RoomMessages.ROOM_OPPONENT_LEFT,
          payload: { message: 'Opponent left. Waiting for new player...' },
        })
      );

      userSocket.send(
        JSON.stringify({
          type: RoomMessages.ROOM_GAME_OVER,
          payload: { message: 'You left before game start.' },
        })
      );
    }
  } catch (error) {
    console.log('error in room game leave method: ', error);
    return null;
  }
}

async function saveGameProgress(
  gameId: number,
  game: Record<string, string>,
  currentFen: string,
  lastMoveBy: 'w' | 'b'
) {
  try {
    const movesRaw = await redis.lRange(`room-game:${gameId}:moves`, 0, -1);
    const moves = movesRaw.map((m) => JSON.parse(m));
    const chatRaw = await redis.lRange(`room-game:${gameId}:chat`, 0, -1);
    const chat = chatRaw.map((c) => JSON.parse(c));
    const capturedPiecesRaw = await redis.lRange(
      `room-game:${gameId}:capturedPieces`,
      0,
      -1
    );
    await pc.$transaction([
      pc.game.update({
        where: { id: gameId },
        data: {
          moves: moves,
          lastMoveBy: lastMoveBy,
          lastMoveAt: new Date(),
          whiteTimeLeft: Number(game.whiteTimer),
          blackTimeLeft: Number(game.blackTimer),
          chat: chat,
          currentFen: currentFen,
          capturedPieces: capturedPiecesRaw,
        },
      }),
    ]);
    console.log(
      `Game ${gameId}: Progress saved to DB at move count ${moves.length}`
    );
  } catch (error) {
    console.log(`Game: ${gameId} Progress Error: `, error);
    return null;
  }
}

export async function resetCancelledRoom(
  roomCode: string,
  newCreatorId: number
) {
  try {
    const room = await pc.room.findUnique({
      where: { code: roomCode },
    });

    if (!room || room.status !== 'CANCELLED') {
      return null;
    }

    // Reset room for reuse
    await pc.room.update({
      where: { code: roomCode },
      data: {
        status: 'WAITING',
        createdById: newCreatorId,
        joinedById: null,
      },
    });

    return room;
  } catch (error) {
    console.error('Error resetting cancelled room:', error);
    return null;
  }
}

export async function handleRoomDrawOffer(
  userId: number,
  userSocket: WebSocket,
  gameId: number,
  socketManager: Map<number, WebSocket>
) {
  try {
    const existingGame = await getRoomGameState(gameId);
    if (!existingGame) {
      userSocket.send(
        JSON.stringify({
          type: RoomMessages.ROOM_GAME_NOT_FOUND,
          payload: { message: 'Game Message Not Found' },
        })
      );
      return;
    }
    const opponentId =
      userId === existingGame.user1 ? existingGame.user2 : existingGame.user1;

    socketManager.get(opponentId)?.send(
      JSON.stringify({
        type: GameMessages.DRAW_OFFERED,
        payload: { message: 'Opponent has offered a draw.' },
      })
    );
  } catch (error) {
    console.error('Error handling room draw offer:', error);
  }
}

export async function handleRoomDrawRejection(
  userId: number,
  userSocket: WebSocket,
  gameId: number,
  socketManager: Map<number, WebSocket>
) {
  try {
    const existingGame = await getRoomGameState(gameId);
    if (!existingGame) {
      userSocket.send(
        JSON.stringify({
          type: RoomMessages.ROOM_GAME_NOT_FOUND,
          payload: { message: 'Game Message Not Found' },
        })
      );
      return;
    }
    const opponentId =
      userId === existingGame.user1 ? existingGame.user2 : existingGame.user1;
    socketManager.get(opponentId)?.send(
      JSON.stringify({
        type: GameMessages.DRAW_REJECTED,
        payload: { message: 'Opponent has rejected your draw offer.' },
      })
    );
  } catch (error) {
    console.error('Error handling room draw rejection:', error);
  }
}

export async function handleRoomDrawAcceptance(
  userId: number,
  userSocket: WebSocket,
  gameId: number,
  socketManager: Map<number, WebSocket>
) {
  try {
    const existingGame = await getRoomGameState(gameId);
    if (!existingGame) {
      userSocket.send(
        JSON.stringify({
          type: RoomMessages.ROOM_GAME_NOT_FOUND,
          payload: { message: 'Game Message Not Found' },
        })
      );
      return;
    }
    const opponentId =
      userId === existingGame.user1 ? existingGame.user2 : existingGame.user1;
    const opponentSocket = socketManager.get(opponentId);

    await handleRoomDraw(
      userSocket,
      opponentSocket,
      gameId,
      'Draw agreed by both players'
    );
  } catch (error) {
    console.error('Error handling room draw acceptance:', error);
  }
}
