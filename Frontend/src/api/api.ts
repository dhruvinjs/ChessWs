import { User } from "../types/user";
import { ChessLevel } from "../types/chess";
import { gamesApi, userApi } from "./axios";

export interface RegisterPayload {
  name: string;
  chessLevel: ChessLevel;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface ProfileStats {
  computer: {
    total: number;
    won: number;
    lost: number;
    drawn: number;
  };
  room: {
    total: number;
    won: number;
    lost: number;
    drawn: number;
  };
  guest: {
    total: number;
    won: number;
    lost: number;
    drawn: number;
  };
}

export interface ComputerGame {
  id: number;
  userId: number;
  winnerId: number | null;
  loserId: number | null;
  createdAt: string;
  updatedAt: string;
  computerDifficulty: string;
  playerColor: string;
  status: string;
  draw: boolean;
}

export interface RoomGame {
  id: string;
  createdAt: string;
  updatedAt: string;
  draw: boolean;
  winner?: { id: number; name: string; chessLevel?: string };
  loser?: { id: number; name: string; chessLevel?: string };
  opponentName?: string;
  opponentChessLevel?: string;
  isCreator?: boolean;
}

export interface GuestGame {
  id: number;
  player1GuestId: string;
  player2GuestId: string;
  player1UserId: number | null;
  player2UserId: number | null;
  player1Color: string;
  status: string;
  draw: boolean;
  winner: string | null;
  loser: string | null;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
}

export interface UserProfile {
  user: {
    id: number;
    name: string;
    email: string;
    chessLevel: string;
  };
  stats: ProfileStats;
  totalTimePlayed: string;
  recentGames: {
    computerGamesWon: ComputerGame[];
    computerGamesLost: ComputerGame[];
    computerGamesInProgress: ComputerGame[];
    roomGamesWon: RoomGame[];
    roomGamesLost: RoomGame[];
    roomGamesDrawn: RoomGame[];
    guestGamesWon: GuestGame[];
    guestGamesLost: GuestGame[];
    guestGamesDrawn: GuestGame[];
  };
}

export interface ProfileResponse extends UserProfile{
  success: boolean;
  isGuest: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  chessLevel?: string;
  password?: string;
}

export const authApis = {
  register: async (payload: RegisterPayload) => {
    const res = await userApi.post("/register", payload);
    return res.data;
  },

  login: async ({ email, password }: LoginPayload) => {
    const res = await userApi.post("/login", { email, password });
    return res.data;
  },

  logout: async () => {
    const res = await userApi.post("/logout");
    return res.data;
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const res = await userApi.get("/profile");
    return res.data;
  },
  updateProfile: async (payload: UpdateProfilePayload) => {
    const res = await userApi.post("/profile/update", payload);
    return res.data;
  },
  checkAuth: async () => {
    const res = await userApi.post("/checkAuth", {});
    return res.data;
  },
  getOrCreateGuest: async () => {
    const res = await userApi.get("/cookie", { withCredentials: true });
    return res.data;
  },
};

export interface RoomInfo {
  code: string;
  status: string;
  playerCount: number;
  isCreator: boolean;
  currentUserId: number;
  opponentId: number | null;
  opponentName: string | null;
  gameId: string | null;
  createdBy?: { id: number; name: string };
  joinedBy?: { id: number; name: string } | null;
}

export interface CreateRoomResponse {
  roomId: string;
  success: boolean;
  message?: string;
  room: RoomInfo;
}

export interface JoinRoomResponse {
  success: boolean;
  message: string;
  room: RoomInfo;
}

export const roomApis = {
  createRoom: async (): Promise<CreateRoomResponse> => {
    const res = await userApi.post("/room/create");
    // console.log("API: Create room response:", res.data); // Debug log
    return res.data;
  },

  joinRoom: async (roomId: string): Promise<JoinRoomResponse> => {
    const payload = { roomId };

    const res = await userApi.post("/room/join", payload);
    return res.data;
  },

  cancelRoom: async (roomId: string) => {
    const res = await userApi.patch(`/room/${roomId}/status`, { roomId });
    // console.log("API: Cancel room response:", res.data);
    return res.data;
  },
};

export const computerGameApi = {
  createComputerGame: async (difficulty: string, playerColor: string) => {
    const res = await gamesApi.post("/computer/create", {
      difficulty,
      playerColor,
    });
    // console.log("API: Create room response:", res.data); // Debug log
    return res.data;
  },
  cancelComputerGame: async (computerGameId: number) => {
    const res = await gamesApi.patch("/computer/finish", {
      computerGameId,
    });
    // console.log("API: Create room response:", res.data); // Debug log
    return res.data;
  },
};
