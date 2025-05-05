export  function Piece({piece}:{piece:string}){
    const pieceMap: Record<string, string> = {
        P: "♙",
        N: "♘",
        B: "♗",
        R: "♖",
        Q: "♕",
        K: "♔",
        p: "♟︎",
        n: "♞",
        b: "♝",
        r: "♜",
        q: "♛",
        k: "♚",
      };
    return(
        <>
        <span className="text-3xl">
            {pieceMap[piece] || ""}
        </span>
        </>
    )
} 