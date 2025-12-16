interface ChatMessageProps {
  message: string;
  sender: 'user' | 'support' | 'ai';
  timestamp?: string;
}

const ChatMessage = ({ message, sender, timestamp }: ChatMessageProps) => {
  const isUser = sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm">{message}</p>
        </div>
        {timestamp && (
          <p className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
