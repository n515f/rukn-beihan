import { useEffect, useState, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import ChatMessage from '@/components/chat/ChatMessage';
import { askAssistant } from '@/services/assistantApi';
import { getThread, listMessages, Message as ApiMessage } from '@/services/messagesApi';

const SmartAssistant = () => {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Scroll container ref and helpers
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef<boolean>(false);
  const pageSizeRef = useRef<number>(30);

  const scrollToBottom = () => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const handleScroll = async () => {
    const el = messagesRef.current;
    if (!el || !conversationId || loadingMoreRef.current) return;
    if (el.scrollTop <= 10) {
      loadingMoreRef.current = true;
      try {
        const nextLimit = (messages.length || 0) + pageSizeRef.current;
        const list = await listMessages({ conversation_id: conversationId, limit: nextLimit, offset: 0 });
        if (Array.isArray(list) && list.length > (messages.length || 0)) {
          // Keep order ascending by time
          list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          const prevHeight = el.scrollHeight;
          setMessages(list);
          // Maintain approximate position after new content prepended
          setTimeout(() => {
            const newHeight = el.scrollHeight;
            el.scrollTop = newHeight - prevHeight;
          }, 0);
        }
      } catch {}
      finally {
        loadingMoreRef.current = false;
      }
    }
  };

  const getStorageKey = () => `assistant_cid_${user ? Number(user.id) : 'guest'}`;

  const appendLocalUserMessage = (text: string) => {
    const local: ApiMessage = {
      id: Date.now(),
      conversation_id: conversationId ?? 'pending',
      user_id: user ? Number(user.id) : null,
      admin_id: null,
      sender_type: 'user',
      channel: 'assistant',
      language: lang === 'ar' ? 'ar' : 'en',
      title: null,
      message_text: text,
      status: 'open',
      read_by_admin: false,
      read_by_user: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, local]);
    // Ensure the input area stays visible
    setTimeout(scrollToBottom, 0);
  };

  const handleSend = async () => {
    const q = message.trim();
    if (!q || loading) return;
    setLoading(true);
    setError('');
    if (!isOpen) setIsOpen(true);

    // Echo user message locally for immediate feedback
    appendLocalUserMessage(q);

    try {
      // Ask assistant; backend should persist both user and AI messages
      const res = await askAssistant({
        user_id: user ? Number(user.id) : undefined,
        language: lang === 'ar' ? 'ar' : 'en',
        question: q,
        conversation_id: conversationId ?? undefined,
      });

      const cid: string =
        res.conversation_id ??
        conversationId ??
        (res.message?.conversation_id ?? '');

      if (cid) {
        setConversationId(cid);
        const thread = await getThread(cid);
        const list: ApiMessage[] = thread.notifications ?? thread.messages ?? [];
        // Keep messages ordered by time ascending
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(list);
        setTimeout(scrollToBottom, 0);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      // Show an AI-side error bubble instead of generic fallback
      const aiMsg: ApiMessage = {
        id: Date.now() + 1,
        conversation_id: conversationId ?? 'pending',
        user_id: user ? Number(user.id) : null,
        admin_id: null,
        sender_type: 'ai',
        channel: 'assistant',
        language: lang === 'ar' ? 'ar' : 'en',
        title: null,
        message_text: lang === 'ar'
          ? `حدث خطأ أثناء التواصل مع المساعد: ${msg}`
          : `An error occurred contacting assistant: ${msg}`,
        status: 'open',
        read_by_admin: true,
        read_by_user: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setTimeout(scrollToBottom, 0);
    } finally {
      setMessage('');
      setLoading(false);
    }
  };

  // Hydrate assistant conversation from localStorage or server on mount/user change
  useEffect(() => {
    const key = getStorageKey();
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      if (stored) {
        setConversationId(stored);
        return;
      }
    } catch {}

    if (user && Number(user.id)) {
      listMessages({ user_id: Number(user.id), channel: 'assistant' })
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const latestCid = list[0]?.conversation_id;
            if (latestCid) {
              setConversationId(latestCid);
              try {
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem(key, latestCid);
                }
              } catch {}
            }
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (conversationId) {
      // Persist the assistant conversation id
      try {
        const key = getStorageKey();
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, conversationId);
        }
      } catch {}

      getThread(conversationId).then((thread) => {
        const list: ApiMessage[] = thread.notifications ?? thread.messages ?? [];
        setMessages(list);
        setTimeout(scrollToBottom, 0);
      }).catch((e) => {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      });
    }
  }, [conversationId]);

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t('ai.title')}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex min-h-0 flex-col p-0">
            <div ref={messagesRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto px-4 py-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg.message_text}
                  sender={msg.sender_type}
                  timestamp={msg.created_at}
                />
              ))}
              {error && (
                <p className="px-4 py-1 text-xs text-destructive">{error}</p>
              )}
            </div>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('ai.placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} size="icon" disabled={loading}>
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
