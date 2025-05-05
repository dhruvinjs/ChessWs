import {WebSocket} from 'ws'
import { Chess } from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE } from '../messages';
export class Games{
    public user1:WebSocket;
    public user2:WebSocket;
    private moves:string[];
    private startTime:Date;
    private board :Chess;
    private winner:string;

    //Note this will be called when we are starting a new game
    constructor(user1:WebSocket,user2:WebSocket){
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
        console.log("New Game started")
    }
    makeMove(socket:WebSocket,move:{
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
        } catch (error) {
            console.log(error)
            
            return;
        }

        //Game Over logic
        if(this.board.isGameOver()){
            // w:white b:black if next turn is white black was winner
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
        //socket which assigned to opp is current sokcet that sends message
        const opponent=socket === this.user1 ? this.user2 : this.user1
        opponent.send(JSON.stringify({
            type:"move",
            payload:move
        }))
    }

    
}