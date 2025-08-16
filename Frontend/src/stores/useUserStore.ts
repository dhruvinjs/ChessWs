import { create } from "zustand"
import { userApi } from "../api/axios"

export type ChessLevel = "BEGINNER" | "INTERMEDIATE" | "PRO"

interface User {
  id?:string,//only for guest
  name: string
  chessLevel: ChessLevel
}

interface UserStore {
  user: User | null
  isGuest: boolean
  loading: boolean
  error: string | null
  success: boolean,
  message?:string
  

  login: (username: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, chessLevel: ChessLevel) => Promise<void>
  logout: () => void
  setGuest: () => void
}

export const useUserStore = create<UserStore>(
  (set,get) => ({
  user: null,
  loading: false,
  isGuest: true,
  error: null,
  success: false,

  login: async (username, password) => {
    set({ loading: true })
    try {
      const response = await userApi.post('/login', { username, password })

      set({
        user: {
          chessLevel: response.data.chessLevel,
          name: response.data.name,
        },
        success: response.data.success,
        isGuest: false,
        loading: false,
        error: null,
        message:response.data.message
      })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Login failed", loading: false })
    }
  },

  register: async (name, email, password, chessLevel) => {
    set({ loading: true })
    try {
      const response = await userApi.post("/register", {
        name,
        email,
        password,
        chessLevel
      })

      set({
        success: response.data.success,
        error: null,
        loading: false,
        message:response.data.message
      })
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Registration failed", loading: false })
    }
  },

  logout: () => {
    set({
      user: null,
      isGuest: true,
      success: false,
      error: null,
    })
  },

  setGuest:async() => {
    set({loading:true})
    const currentUser=get().user
    if (currentUser?.id){
        return;
    }
    try {
        const response= await userApi.get("/cookie")
        set({
            isGuest:true,
            loading:false,
            user:{
                id:response.data.guestId,
                chessLevel:"BEGINNER",
                name:"Guest"
            }
        })
    } catch (error:any) {
        set({ loading: false, error: "Guest Cookie failed" });  
    }
  }
 
}))



