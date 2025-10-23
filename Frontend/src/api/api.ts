import { User } from "../types/user";
import { ChessLevel } from "../types/chess";
import { userApi } from "./axios";

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

export const roomApis={
  createRoom:async()=>{
    const res=await userApi.get('/create')
    return res.data
  },
  joinRoom:async(roomId:string):Promise<boolean>=>{
    const res=await userApi.post('/join',{roomId},)
    return res.data.success
  }
}