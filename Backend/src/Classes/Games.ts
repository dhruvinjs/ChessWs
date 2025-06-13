import {WebSocket} from 'ws'
import { Chess } from 'chess.js';
import { GAME_NOT_FOUND, GAME_OVER, INIT_GAME, MOVE } from '../messages';
import {redis} from '../redisClient'
import { raw } from '@prisma/client/runtime/library';
export class Games{
    public user1:WebSocket;
    public user2:WebSocket;
    private moves:string[];
    private startTime:Date;
    private board :Chess;
    private winner:string;
    private gameId:string;
    private user1Id:string;
    private user2Id:string
    // constructor()
    //Note this will be called when we are starting a new game
        constructor(user1:WebSocket,user2:WebSocket,gameId:string,user1Id:string
            ,user2Id:string
        ){

            this.user1=user1
            this.user2=user2
            this.board=new Chess(),
            this.moves=[],
            this.startTime=new Date()
            this.winner="",
            this.user1.send(JSON.stringify({
                type:INIT_GAME,
                color:"w"
            }))
            this.user2.send(JSON.stringify({
                type:INIT_GAME,
                color:"b"
            }))
            this.gameId =gameId
            this.user1Id=user1Id
            this.user2Id=user2Id
            console.log("New Game started")
        }

        
    async makeMove(socket:WebSocket,move:{
        from:string,
        to:string,
        promotion?:string
    }){
        // Validation logic in which other than 2 player cannot make a move 
     const isWhiteTurn=this.board.turn()==="w"
     if((isWhiteTurn && this.user1!==socket) || (!isWhiteTurn && this.user2!==socket)){
        console.log("Early return on turn");
        return;
     }


        try {
            this.board.move(
                {
                    from:move.from,
                    to:move.to,
                    promotion:move.promotion || "q"
                }
            )
            await redis.hGet(`game:${this.gameId}`,'moves').then(async(moves)=>{
                const movesArr=moves ? JSON.parse(moves) : []
                movesArr.push(move)
                await redis.hSet(`game:${this.gameId}`,'moves',JSON.stringify(movesArr))
            })
        } catch (error) {
            console.log(error)
            return;
        }

        //Game Over logic
        if(this.board.isGameOver()){
            //w:white b:black if next turn is white black was winner
            this.winner=this.board.turn() ==="w" ?"black" :"white"

            //Send the message to both users that game is over
            const message = JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.winner
                }
            });
        
            this.user1.send(message);
            this.user2.send(message);
            return;
        }
        //socket which assigned to opp is current socket that sends message
        const opponent=socket === this.user1 ? this.user2 : this.user1
        opponent.send(JSON.stringify({
            type:"move",
            payload:move
        }))
    }

    static async reconnectPlayer(playerId:string,socket:WebSocket,gameId:string){
        
        // if(id===this.user1Id){
        //     this.user1=socket
        // }
        // else{
        //  this.user2=socket       
        // }
        const gameData=await redis.hGetAll(`game:${gameId}`)
        if(!gameData){
            socket.send(JSON.stringify({
                type:GAME_NOT_FOUND,
                message:"Game Not found"
            }))
            return;
        }
        
        const color = playerId===gameData.user1 ? 'w' : 'b';

        
        const rawMoves=await redis.hGet(`game:${gameId}`,"moves")
        const moves=rawMoves ? JSON.parse(rawMoves) : []
        const board=new Chess()
        moves.forEach((m:any)=>board.move(m))
        
        
        socket.send(JSON.stringify({
            type: 'GAME_STATE',
            payload: {
                fen: board.fen(),
                moves: moves,
                turn: board.turn(),    
                yourColor: color
            }
            }));
    }

    // static async redisGameData(){

    // }

    
}