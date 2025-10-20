interface Props {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function Card({ className, children, title, subtitle }: Props) {
  return (
    <div
      className={`w-full max-w-md mx-auto rounded-2xl shadow-xl
        p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900
        border border-slate-200 dark:border-slate-700
        hover:shadow-2xl hover:scale-[1.02] transition-all duration-300
        ${className}`}
    >
      {title && (
        <h2 className="font-bold text-xl text-slate-900 dark:text-white mb-1">
          {title}
        </h2>
      )}

      {subtitle && (
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );
}
