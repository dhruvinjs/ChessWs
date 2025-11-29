//this file will contain the helper function for chess games

import { Chess } from "chess.js";

export default function provideValidMoves(fen:string){
    const chess=new Chess(fen)
    const moves=chess.moves({verbose:true})

    const validMoves=moves.map(m=> ({
        from:m.from,
        to:m.to,
        promotion:m.promotion ?? null
    }))

    return validMoves

}

export function delay(ms:number){
  return new Promise((resolve)=>{
    setTimeout(resolve,ms)
  })
}