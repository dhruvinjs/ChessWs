import { memo, useState, useRef, useEffect } from "react";
// Assuming Button and Input components are imported from relevant paths
// import { Button } from "./Button";
// import { Input } from "./Input";

// ----------------------------------------------------------------
// ⚠️ NOTE: Placeholders for your imported components
// (Replace with actual imports in your file structure)
// ----------------------------------------------------------------
import { Send, Loader2 } from "lucide-react";
import { ReactElement, RefObject } from "react";

// Placeholder for your custom Input component (as used in previous response)
interface InputProps {
    className?: string;
    type: string;
    placeholder: string;
    minLength?: number;
    maxLength?: number;
    required: boolean;
    inputRef?: RefObject<HTMLInputElement | null>;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export function Input({ className, type, placeholder, required, value, onChange }: InputProps) {
    const chatStyles = "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    return (
        <input
            className={`p-3 outline-none w-3/4 shadow-md rounded-xl transition-all duration-150 ${chatStyles} ${className}`}
            placeholder={placeholder}
            required={required}
            type={type}
            value={value}
            onChange={onChange}
        />
    );
}

// Your Button Component (for context and usage)
type ButtonProps = {
    variant: "primary" | "secondary" | "outline";
    size: "md" | "sm" | "lg";
    onClick?: () => void;
    text?: string;
    className?: string;
    loading?: boolean;
    icon?: ReactElement;
    disabled?: boolean;
};

const variantDef = { /* ... omitted for brevity ... */
    primary: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105",
    secondary: "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg transform hover:scale-105",
    outline: "border-2 border-amber-600 text-amber-700 bg-transparent hover:bg-amber-50 hover:border-amber-700 hover:text-amber-800 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-900/20 dark:hover:border-amber-300 dark:hover:text-amber-300 shadow-sm hover:shadow-md transform hover:scale-105",
};
const defaultStyles = "rounded-xl cursor-pointer transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none font-semibold";
const sizeDef = { sm: "px-3 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" };

export function Button(props: ButtonProps) {
    const { variant, size, onClick, text, className, loading, icon, disabled } = props;
    const padding = sizeDef[size];
    const layout = "flex justify-center items-center gap-2";

    return (
        <button
            className={`${variantDef[variant]} ${className || ""} ${defaultStyles} ${padding} ${layout}`}
            onClick={onClick}
            disabled={loading || disabled}
        >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            {icon}
            {text}
        </button>
    );
}

// ----------------------------------------------------------------

// Dummy chat data and MessageRow (unchanged, omitted for brevity)
interface ChatMessage { id: number; sender: 'user' | 'opponent' | 'system'; content: string; }
const dummyMessages: ChatMessage[] = [
    { id: 1, sender: 'system', content: 'Welcome!' },
    { id: 2, sender: 'opponent', content: 'Hello!' },
];
const MessageRow = memo(({ message }: { message: ChatMessage }) => { 
    /* ... unchanged implementation ... */ 
    const isSystem = message.sender === 'system';
    return <div className={`flex mb-2 ${isSystem ? 'justify-center' : message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>{message.content}</div>;
});
MessageRow.displayName = "MessageRow";


// Main Chat Component
export const ChatInterfaceComponent = () => {
  const [messages] = useState<ChatMessage[]>(dummyMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false); // State to simulate loading/sending
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    // 1. Start loading state
    setIsSending(true); 
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500)); 

    // 2. Log/Send message
    console.log("Sending message:", inputMessage); 
    
    // 3. Reset state
    setInputMessage("");
    setIsSending(false);
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 md:p-5 rounded-2xl shadow-xl flex flex-col w-full h-full">
      
      {/* Header (omitted for brevity) */}
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <span className="inline-block w-1.5 h-5 bg-indigo-500 rounded"></span>
        Chat
      </h3>

      <div className="flex-grow overflow-y-auto pr-1 custom-scroll-hide w-full flex flex-col">
          <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area with custom Input and Button */}
      <form onSubmit={handleSend} className="mt-4 flex items-center gap-2">
        <Input
          className="flex-grow w-full" 
          type="text"
          placeholder="Send a message..."
          required={false}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        
        <Button
          variant="primary" 
          size="sm"
          disabled={inputMessage.trim() === "" || isSending}
          loading={isSending}
          icon={<Send size={20} />}
          className="!bg-indigo-600 !hover:bg-indigo-700 !from-indigo-600 !to-indigo-600 !hover:from-indigo-700 !hover:to-indigo-700 !shadow-none !hover:scale-100 !px-4 !py-3"
        />
      </form>
    </div>
  );
};

export const ChatInterface = memo(ChatInterfaceComponent);
ChatInterface.displayName = "ChatInterface";