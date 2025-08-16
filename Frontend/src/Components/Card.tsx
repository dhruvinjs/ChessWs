interface Props {
    className?: string;
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
  }
  
  export function Card(props: Props) {
    return (
      <div
        className={`w-full max-w-md mx-auto rounded-xl shadow-md p-6 	bg-[#BCAAA4] space-y-3 ${props.className}`}
      >
        {props.title && (
          <h2 className="font-bold text-xl mb-2">{props.title}</h2>
        )}
        {props.subtitle && (
          <h2 className="text-shadow-amber-900 font-semibold dark:text-wood-light text-sm mb-4">
            {props.subtitle}
          </h2>
        )}
        {props.children}
      </div>
    );
  }
  