import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { useGameStore } from "../../stores/useGameStore";
import { SocketManager } from "../../lib/socketManager";
import { GameMessages } from "../../types/chess";
import { useUserQuery } from "../../hooks/useUserQuery";
import { Button } from "../Button";

// ----------------------------------------------------------------

// Chat message interface
interface ChatMessage { 
  sender: number;
  message: string;
  timestamp: number;
}

// Memoized Input Component to prevent unnecessary re-renders
const ChatInput = memo(({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) => (
  <input
    className="flex-grow w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none shadow-md rounded-xl"
    type="text"
    placeholder="Send a message..."
    value={value}
    onChange={onChange}
    disabled={disabled}
  />
));
ChatInput.displayName = "ChatInput";

// Memoized Send Button Component
const SendButton = memo(({ 
  disabled, 
  loading 
}: { 
  disabled: boolean; 
  loading: boolean;
}) => (
  <Button
    variant="primary" 
    size="sm"
    disabled={disabled}
    loading={loading}
    icon={<Send size={20} />}
    className="!bg-indigo-600 !hover:bg-indigo-700 !from-indigo-600 !to-indigo-600 !hover:from-indigo-700 !hover:to-indigo-700 !shadow-none !hover:scale-100 !px-4 !py-3"
  />
));
SendButton.displayName = "SendButton";

const MessageRow = memo(({ message, currentUserId }: { message: ChatMessage; currentUserId: number }) => { 
  const isUser = message.sender === currentUserId;
  const isSystem = message.sender === 0; // Assuming 0 for system messages
  
  const senderLabel = isSystem ? "System" : isUser ? "You" : "Opponent";
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex mb-3 ${isSystem ? 'justify-center' : isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isSystem ? 'text-center' : ''}`}>
        <div className={`
          rounded-2xl px-4 py-2 shadow-sm
          ${isSystem 
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm' 
            : isUser 
              ? 'bg-indigo-600 text-white' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
          }
        `}>
          {!isSystem && (
            <div className={`text-xs font-semibold mb-1 ${isUser ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-400'}`}>
              {senderLabel}
            </div>
          )}
          <div className="break-words">{message.message}</div>
        </div>
        <div className={`text-xs text-slate-400 dark:text-slate-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {time}
        </div>
      </div>
    </div>
  );
});
MessageRow.displayName = "MessageRow";


// Main Chat Component
const ChatInterfaceComponent = () => {
  // Separate selectors to only subscribe to what we need
  const messages = useGameStore((state) => state.chatMsg);
  const roomId = useGameStore((state) => state.roomId);
  const roomGameId = useGameStore((state) => state.roomGameId);
  
  const { data: user } = useUserQuery();
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  }, []);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "" || !user?.id || !roomId) {
      return;
    }

    setIsSending(true); 
    
    try {
      // Send chat message via WebSocket
      // Use roomGameId if game is active, otherwise use roomId for lobby chat
      const payload: any = {
        message: inputMessage.trim()
      };
      
      if (roomGameId) {
        payload.roomGameId = roomGameId; // Game is active - send with roomGameId
      } else {
        payload.roomId = roomId; // In lobby - send with roomId
      }

      SocketManager.getInstance().send({
        type: GameMessages.ROOM_CHAT,
        payload,
      });
      
      // Clear input
      setInputMessage("");
    } catch (error) {
      console.error("❌ Failed to send chat message:", error);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, user?.id, roomId, roomGameId]);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 md:p-5 rounded-2xl shadow-xl flex flex-col w-full h-full">
      
      {/* Header (omitted for brevity) */}
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <span className="inline-block w-1.5 h-5 bg-indigo-500 rounded"></span>
        Chat
      </h3>

      <div className="flex-grow overflow-y-auto pr-1 custom-scroll-hide w-full flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-slate-400 dark:text-slate-500 text-sm">No messages yet. Start chatting!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageRow key={index} message={msg} currentUserId={user?.id || 0} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <form onSubmit={handleSend} className="mt-4 flex items-center gap-2">
        <ChatInput
          value={inputMessage}
          onChange={handleInputChange}
          disabled={isSending || !roomId}
        />
        
        <SendButton
          disabled={inputMessage.trim() === "" || isSending || !roomId}
          loading={isSending}
        />
      </form>
    </div>
  );
};

export const ChatInterface = memo(ChatInterfaceComponent);
ChatInterface.displayName = "ChatInterface";