interface Props {
    className?: string;
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
  }
  
  export function Card(props: Props) {
    return (
      <div
        className={`w-full max-w-md mx-auto rounded-xl shadow-md p-6 bg-white space-y-3 ${props.className}`}
      >
        {props.title && (
          <h2 className="font-semibold text-xl mb-2">{props.title}</h2>
        )}
        {props.subtitle && (
          <h2 className="text-gray-600 dark:text-wood-light text-sm mb-4">
            {props.subtitle}
          </h2>
        )}
        {props.children}
      </div>
    );
  }
  