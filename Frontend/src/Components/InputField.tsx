interface Props {
  className?: string;
  type: string;
  placeholder: string;
  minLength: number;
  maxLength: number;
  required: boolean;
 inputRef?: React.RefObject<HTMLInputElement | null> ;
}

export function Input({
  className,
  type,
  placeholder,
  minLength,
  maxLength,
  required,
  inputRef
}: Props) {
  return (
    <input
      className={`p-3 outline-none w-3/4 text-white shadow-md rounded-xl ${className}`}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      maxLength={maxLength}
      type={type}
      ref={inputRef}
    />
  );
}
