import { Move, PieceColor } from "./chess";
import { GameMessages } from "../constants";

// Combined payload for INIT_GAME and GAME_FOUND
export interface GamePayload {
  color: PieceColor;
  gameId: string;
  fen: string;
  opponentId: string;
  turn: PieceColor;
  whiteTimer: number;
  blackTimer: number;
}

interface MovePayload {
  move: Move & { gameId: string };
  fen: string;
}

interface CheckPayload {
  move: Move;
}

interface GameOverPayload {
  winner: PieceColor;
}

interface TimeExceededPayload {
  fen: string;
}

// New payload type for timer updates
interface TimerUpdatePayload {
  whiteTimer: number;
  blackTimer: number;
}

export type ServerMessage =
  | { type: typeof GameMessages.INIT_GAME | typeof GameMessages.GAME_FOUND; payload: GamePayload }
  | { type: typeof GameMessages.MOVE; payload: MovePayload }
  | { type: typeof GameMessages.CHECK; payload: CheckPayload }
  | { type: typeof GameMessages.GAME_OVER; payload: GameOverPayload }
  | { type: typeof GameMessages.TIME_EXCEEDED; payload: TimeExceededPayload }
  | { type: typeof GameMessages.TIMER_UPDATE; payload: TimerUpdatePayload }; // <-- added
