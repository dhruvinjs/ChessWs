import { memo } from "react";

interface PieceProps {
  piece: string;
  className?: string; // allow custom styling
}

const PieceComponent = ({ piece, className = "" }: PieceProps) => {
  // The piece notation (e.g., 'wp', 'bK') is used to construct the SVG path.
  const svgPath = `/pieces/${piece}.svg`;
  // console.log(svgPath)
  return (
    <div
      className={`w-full h-full flex justify-center items-center p-1 ${className}`}
    >
      <img
        src={svgPath}
        alt={`Chess piece ${piece}`}
        className="w-full h-full object-contain pointer-events-none select-none"
      />
    </div>
  );
};

export const Piece = memo(PieceComponent);
