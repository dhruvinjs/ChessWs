import { Loader2 } from "lucide-react";
import { ReactElement } from "react";

type ButtonProps = {
  variant: "primary" | "secondary" | "outline";
  size: "md" | "sm" | "lg";
  onClick?: () => void;
  text?: string;
  className?: string;
  loading?: boolean;
  icon?: ReactElement;
};

const variantDef = {
  primary: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105",
  secondary: "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg transform hover:scale-105",
  outline: "border-2 border-amber-600 text-amber-700 bg-transparent hover:bg-amber-50 hover:border-amber-700 hover:text-amber-800 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-900/20 dark:hover:border-amber-300 dark:hover:text-amber-300 shadow-sm hover:shadow-md transform hover:scale-105",
};

const defaultStyles = "rounded-xl cursor-pointer transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none font-semibold";

const sizeDef = {
  sm: "px-3 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
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
      {loading && <Loader2 className="animate-spin h-4 w-4" />}
      {icon}
      {text}
    </button>
  );
}