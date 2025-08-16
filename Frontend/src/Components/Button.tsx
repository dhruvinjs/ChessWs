import { TbLoader2 } from "react-icons/tb";
import { ReactElement } from "react";

type ButtonProps = {
  variant: "primary" | "secondary" | "outline";
  size: "md" | "sm" | "lg";
  onClick: () => void;
  text: string;
  className?: string;
  loading?: boolean;
  icon?: ReactElement;
};

const variantDef = {
  primary: "bg-[#7a574a] text-white hover:bg-[#5d4037] disabled:bg-[#a1887f]",
  secondary: "bg-[#A1887F] text-white hover:bg-[#9c6b5c] disabled:bg-[#d7ccc8]",
  outline:
    "border border-[#7a574a] text-[#7a574a] bg-transparent hover:bg-[#f0d9b5] hover:text-[#5d4037] disabled:border-gray-300 disabled:text-gray-400",
};

const defaultStyles =
  "rounded-md cursor-pointer transition disabled:cursor-not-allowed";
const sizeDef = {
  sm: "px-2 py-1 text-sm rounded-sm",
  md: "px-4 py-2 text-base rounded-md",
  lg: "px-6 py-3 text-lg rounded-lg",
};

export function Button(props: ButtonProps) {
  const { variant, size, onClick, text, className, loading, icon } = props;
  const padding = sizeDef[size];
  const layout = "flex justify-center items-center gap-2";

  return (
    <button
      className={`
        ${variantDef[variant]} 
        ${className || ""} 
        ${defaultStyles} 
        ${padding} 
        ${layout}
      `}
      onClick={onClick}
      disabled={loading}
    >
      {loading && <TbLoader2 className="animate-spin h-4 w-4" />}
      {icon}
      {text}
    </button>
  );
}
