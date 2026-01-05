interface Props {
  className?: string;
  type: string;
  placeholder: string;
  minLength?: number;
  maxLength?: number;
  required: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  value?: string;
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
  onChange,
}: Props) {
  return (
    <input
      className={`p-3 outline-none w-3/4 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-md rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 ${className}`}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      maxLength={maxLength}
      type={type}
      ref={inputRef}
      defaultValue={value}
      onChange={onChange}
    />
  );
}
