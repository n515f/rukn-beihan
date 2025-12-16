import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLang } from '@/context/LangContext';
import ChatMessage from '@/components/chat/ChatMessage';

const SmartAssistant = () => {
  const { t, lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      message: lang === 'ar' 
        ? 'مرحباً! كيف يمكنني مساعدتك اليوم؟' 
        : 'Hello! How can I help you today?',
      sender: 'ai' as const,
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      message: lang === 'ar'
        ? 'أحتاج بطارية لسيارتي'
        : 'I need a battery for my car',
      sender: 'user' as const,
      timestamp: '10:31 AM'
    },
    {
      id: '3',
      message: lang === 'ar'
        ? 'بالتأكيد! يمكنك اختيار نوع السيارة من الخيارات أدناه، أو تصفح أفضل المنتجات لدينا.'
        : 'Sure! Please select your car model from the options below, or browse our best-selling products.',
      sender: 'ai' as const,
      timestamp: '10:31 AM'
    }
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, {
        id: Date.now().toString(),
        message,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          message: lang === 'ar' 
            ? 'شكراً لرسالتك. دعني أساعدك في العثور على البطارية المناسبة.'
            : 'Thank you for your message. Let me help you find the right battery.',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1000);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">{t('ai.title')}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg.message}
                  sender={msg.sender}
                  timestamp={msg.timestamp}
                />
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('ai.placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default SmartAssistant;
