import { User } from "../types/user";
import { ChessLevel } from "../types/chess";
import { gamesApi, userApi } from "./axios";

export interface RegisterPayload {
  name: string;
  chessLevel:ChessLevel
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
export interface LoginResponse{
    success:boolean,
    message:string,
    user:User
}



export const authApis = {
  register: async (payload: RegisterPayload) => {
    const res = await userApi.post("/register", payload);
    return res.data;
  },

  login: async ({ email, password }: LoginPayload)=> {
    const res = await userApi.post("/login", { email, password });
    return res.data;
  },

  logout: async () => {
    const res = await userApi.post("/logout");
    return res.data;
  },

  getProfile: async () => {
    const res = await userApi.get("/getProfile");
    return res.data.user;
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
    console.log('API: Creating new room...'); // Debug log
    const res = await userApi.post('/room/create');
    console.log('API: Create room response:', res.data); // Debug log
    return res.data;
  },
  
  joinRoom: async (roomId: string): Promise<JoinRoomResponse> => {
    // console.log('API: Joining room with ID:', roomId); // Debug log
    const payload = { roomId };

    const res = await userApi.post('/room/join', payload);
    // console.log('API: Response:', res.data); // Debug log
    return res.data;
  },

  cancelRoom: async (roomId: string) => {
    console.log('API: Cancelling room with ID:', roomId);
    const res = await userApi.patch(`/room/${roomId}/status`, { roomId });
    console.log('API: Cancel room response:', res.data);
    return res.data;
  },
}

export const computerGameApi={
  createComputerGame:async(difficulty:string,playerColor:string)=>{
     const res = await gamesApi.post('/computer/create',{
       difficulty,
       playerColor
     });
    console.log('API: Create room response:', res.data); // Debug log
    return res.data;
  },
  cancelComputerGame:async(computerGameId:number)=>{
    const res = await gamesApi.patch('/computer/finish',{
      computerGameId       
     });
    console.log('API: Create room response:', res.data); // Debug log
    return res.data;
  }
}