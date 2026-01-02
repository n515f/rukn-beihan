import { useLang } from '@/context/LangContext';

interface ChatMessageProps {
  message: string;
  sender: 'user' | 'support' | 'ai' | 'admin';
  timestamp?: string; // raw ISO string preferred
}

const ChatMessage = ({ message, sender, timestamp }: ChatMessageProps) => {
  const { lang } = useLang();
  const isUser = sender === 'user';
  const isAI = sender === 'ai';

  const locale = lang === 'ar' ? 'ar' : 'en';
  const dateObj = timestamp ? new Date(timestamp) : undefined;
  const isValidDate = dateObj ? !isNaN(dateObj.getTime()) : false;
  const isToday = isValidDate ? new Date().toDateString() === dateObj!.toDateString() : false;
  const formattedTime = isValidDate
    ? isToday
      ? dateObj!.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      : dateObj!.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
    : undefined;

  const bubbleClass = isUser
    ? 'bg-primary text-primary-foreground'
    : isAI
      ? 'bg-secondary text-secondary-foreground'
      : 'bg-muted text-foreground';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className={`rounded-lg px-4 py-2 ${bubbleClass}`}>
          <p className="text-sm break-words whitespace-pre-wrap">{message}</p>
        </div>
        {(formattedTime || (!isValidDate && timestamp)) && (
          <p className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formattedTime ?? timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
