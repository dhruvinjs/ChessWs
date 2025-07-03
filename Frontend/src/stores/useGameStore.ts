import {create} from "zustand"
// import DISCONNECT from "../"

interface Move{
    from:string,
    to:string,
    promotion?:string
}

type game_status= "ended" | "waiting" | "started" | "reconnecting";
type color="w" | "b" | null
interface GameState{
    guestId:string,
    color:color,
    moves:Move[],
    winner:color,
    loser:color,
    gameId:string |null
    oppConnected:boolean,
    gameStatus:game_status,

    addMove:(move:Move)=>void,
    setGuestId:(guestId:string)=>void,
    initGame:(color:"w" | "b" | null,gameId:string)=>void
    setOppStatus:(status:boolean)=>void
    endGame:(winner:"w"|"b"|null,loser:"w"|"b"|null)=>void
    resetGame:()=>void

}


export const useGameStore=create<GameState>((set)=>({
    oppConnected:true,
    winner:null,
    loser:null,
    gameId:null,
    guestId:"",
    color:null,
    gameStatus:"waiting",
      moves: [],

    setGuestId:(id) => set({guestId:id}),
    initGame:(color,gameId)=>set({
        color:color,gameId:gameId,
        gameStatus:"started",moves:[]
    }),
    setOppStatus:(status)=>set({oppConnected:status}),
     addMove: (move) =>
    set((state) => ({
      moves: [...state.moves, move],
    })),
    
    endGame:(winner,loser)=>set({gameStatus:"ended",winner:winner,loser:loser}),
    resetGame:()=>set({
    winner:null,
    loser:null,
    gameId:null,
    guestId:"",
    color:null,
    gameStatus:"waiting",
    oppConnected:true,
    moves: [],
    })

}))