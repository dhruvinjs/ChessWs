import { Chessboard } from "react-chessboard";
import { useMediaQuery } from "react-responsive";
import { Button } from "../Components";
import { useGameStore } from "../stores/useGameStore";
import { useSocketHandlers } from "../hooks/useSocketHandlers";
import { useChess } from "../hooks/useChess";

export function ChessGame() {
  const { moves, color, gamestarted } = useGameStore();
  const { fen, handleSquareClick, selectedSquare, reset } = useChess();

  // Register socket listeners
  useSocketHandlers();

  // Board sizing
  const isMobile = useMediaQuery({ maxWidth: 320 });
  const isSmall = useMediaQuery({ maxWidth: 640 });
  const isTablet = useMediaQuery({ maxWidth: 768 });

  const boardWidth = isMobile ? 300 : isSmall ? 400 : isTablet ? 456 : 700;

  // Highlight selected square
  const getCustomSquareStyles = () => {
    if (!selectedSquare) return {};
    return {
      [selectedSquare]: { background: "rgba(255, 255, 0, 0.5)" },
    };
  };

  return (
    <div className="w-full min-h-screen bg-[#EFEBE9] text-[#5D4037] flex flex-col sm:flex-row md:space-x-12 items-center justify-center">
      <div className="flex justify-center">
        <Chessboard
          position={fen}
          onSquareClick={handleSquareClick}
          boardOrientation={color === "w" ? "white" : "black"}
          boardWidth={boardWidth}
          customSquareStyles={getCustomSquareStyles()}
        />
      </div>

      <div className="bg-[#A1887F] flex flex-col items-center justify-start p-8 w-[350px] h-[1000px] space-y-6 mt-10 rounded-xl">
        <h2 className="text-2xl font-semibold text-white">Controls</h2>
        {!gamestarted && (
          <Button
            onClick={reset}
            size="md"
            text="Play"
            className="w-full"
            variant="primary"
          />
        )}

        <h2 className="text-2xl font-semibold text-white">Moves</h2>
        <div className="relative overflow-x-auto shadow-md sm:rounded-md w-full">
          <table className="w-full text-sm text-center text-white border">
            <thead className="border">
              <tr>
                <th className="px-6 py-3 text-white bg-[#7a574a]">Move</th>
                <th className="px-6 py-3 bg-white text-black">Color</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((move, index) => (
                <tr key={index}>
                  <td className="px-4 py-4 text-white bg-[#7a574a]">
                    {move.from} → {move.to}
                  </td>
                  <td className="px-4 py-4 bg-white text-black font-semibold">
                    {index % 2 === 0 ? "white" : "black"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
