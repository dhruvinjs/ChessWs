interface Props {
  className?: string;
  type: string;
  placeholder: string;
  minLength?: number;
  maxLength?: number;
  required: boolean;
 inputRef?: React.RefObject<HTMLInputElement | null> ;
 value?:string;
 onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input({
  className,
  type,
  placeholder,
  minLength,
  maxLength,
  required,
  inputRef,
  value,
  onChange
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
      value={value}
      onChange={onChange}
    />
  );
}
