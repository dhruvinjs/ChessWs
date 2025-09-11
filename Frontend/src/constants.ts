export  enum GameMessages {
  INIT_GAME = 'init_game',
  MOVE = 'move',
  GAME_OVER = 'game_over',
  GAME_STARTED = 'game_started',
  GAME_ENDED = 'game_ended',
  DISCONNECTED = 'player_left',
  CHECK = 'check_move',
  WRONG_PLAYER_MOVE = 'wrong_player_move',
  STALEMATE = 'game_drawn',
  OPP_RECONNECTED = 'opp_reconnected',
  GAME_FOUND = 'existing_game_found',
  check_move= "check_move",
  TIME_EXCEEDED="time_exceeded",
  GAME_ACTIVE="ongoing_game",
  LEAVE_GAME="leave_game"

}

// Unicode chess pieces
export const PIECE_SYMBOLS: Record<string, string> = {
  'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
  'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
};
