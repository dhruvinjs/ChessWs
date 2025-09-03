import { TbLoader2 } from "react-icons/tb";
import { ReactNode } from "react";

type ButtonProps = {
  variant: "primary" | "secondary" | "outline";
  size: "md" | "sm" | "lg";
  onClick: () => void;
  text: string;
  className?: string;
  loading?: boolean;
  icon?: ReactNode;
};
const variantDef = {
  primary:
    "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold shadow-2xl transform hover:scale-105 transition-all duration-300",
  secondary:
    "bg-[#A1887F] text-white hover:bg-[#9c6b5c] disabled:bg-[#d7ccc8]",
  outline:
    "group border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-400 font-bold transition-all duration-300 hover:shadow-lg",
}


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
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </button>
  );
}
