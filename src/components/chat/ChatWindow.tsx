import { useEffect, useRef, useState } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import ChatMessage from '@/components/chat/ChatMessage';
import {
  listMessages,
  getThread,
  createSupportMessage,
  resolveConversation,
  type Message as ApiMessage,
} from '@/services/messagesApi';

const ChatWindow = () => {
  const { t, lang } = useLang();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef<boolean>(false);
  const pageSizeRef = useRef<number>(30);

  const storageKey = `support_cid_${user ? Number(user.id) : 'guest'}`;

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const handleScroll = async () => {
    const el = scrollRef.current;
    if (!el || !conversationId || loadingMoreRef.current) return;
    if (el.scrollTop <= 10) {
      loadingMoreRef.current = true;
      try {
        const nextLimit = (messages.length || 0) + pageSizeRef.current;
        const list = await listMessages({ conversation_id: conversationId, channel: 'support', limit: nextLimit, offset: 0 });
        if (Array.isArray(list) && list.length > (messages.length || 0)) {
          list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          const prevHeight = el.scrollHeight;
          setMessages(list);
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

  const appendLocalUserMessage = (text: string) => {
    const local: ApiMessage = {
      id: Date.now(),
      conversation_id: conversationId ?? 'pending',
      user_id: user ? Number(user.id) : null,
      admin_id: null,
      sender_type: 'user',
      channel: 'support',
      language: lang === 'ar' ? 'ar' : 'en',
      title: null,
      message_text: text,
      status: 'open',
      read_by_admin: false,
      read_by_user: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, local]);
    setTimeout(scrollToBottom, 0);
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || loading) return;
    setLoading(true);
    setError('');

    appendLocalUserMessage(text);

    try {
      const created = await createSupportMessage({
        user_id: user ? Number(user.id) : undefined,
        language: lang === 'ar' ? 'ar' : 'en',
        message_text: text,
        conversation_id: conversationId ?? undefined,
      });

      const persistedCid = created.conversation_id;
      const cid = persistedCid ?? conversationId ?? '';
      if (cid) {
        setConversationId(cid);
        // Persist
        try { if (typeof window !== 'undefined') localStorage.setItem(storageKey, cid); } catch {}
        const thread = await getThread(cid);
        const list: ApiMessage[] = thread.messages ?? thread.notifications ?? [];
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(list);
        setTimeout(scrollToBottom, 0);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setInputValue('');
      setLoading(false);
    }
  };

  const startNewConversation = async () => {
    if (!conversationId) return;
    const confirmed = window.confirm(lang === 'ar' ? t('ai.newConversationConfirm') : t('ai.newConversationConfirm'));
    if (!confirmed) return;
    try {
      await resolveConversation(conversationId);
      setConversationId(null);
      setMessages([]);
      try { if (typeof window !== 'undefined') localStorage.removeItem(storageKey); } catch {}
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    }
  };

  useEffect(() => {
    // hydrate from localStorage
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (stored) {
        setConversationId(stored);
        return;
      }
    } catch {}

    // find latest support conversation for user
    if (user && Number(user.id)) {
      listMessages({ user_id: Number(user.id), channel: 'support' })
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const latestCid = list[0]?.conversation_id;
            if (latestCid) {
              setConversationId(latestCid);
              try { if (typeof window !== 'undefined') localStorage.setItem(storageKey, latestCid); } catch {}
            }
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!conversationId) return;
    getThread(conversationId)
      .then((thread) => {
        const list: ApiMessage[] = thread.messages ?? thread.notifications ?? [];
        list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(list);
        setTimeout(scrollToBottom, 0);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [conversationId]);

  return (
    <Card className="flex h-[600px] flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{t('common.support')}</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={startNewConversation}>
          <RefreshCw className="h-4 w-4 me-2" />
          {t('ai.newConversation')}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex min-h-0 flex-col p-0">
        {/* Messages */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              message={m.message_text}
              sender={m.sender_type}
              timestamp={m.created_at}
            />
          ))}
          {error && <p className="px-4 py-1 text-xs text-destructive">{error}</p>}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder={t('ai.placeholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
