import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLang } from '@/context/LangContext';
import { Message as ApiMessage, getThread, listMessages, markRead, resolveConversation } from '@/services/messagesApi';

const AdminMessagePage = () => {
  const { t } = useLang();
  const [conversationId, setConversationId] = useState('');
  const [userId, setUserId] = useState('');
  const [channel, setChannel] = useState<'all' | 'support' | 'assistant'>('all');
  const [sender, setSender] = useState<'all' | 'user' | 'admin' | 'ai'>('all');
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoad = async () => {
    setLoading(true);
    setError('');
    try {
      if (conversationId.trim()) {
        const thread = await getThread(conversationId.trim());
        const list: ApiMessage[] = thread.notifications ?? thread.messages ?? [];
        setMessages(list);
      } else {
        const uid = Number(userId.trim());
        const list = await listMessages({
          user_id: Number.isFinite(uid) ? uid : undefined,
          channel: channel !== 'all' ? channel : undefined,
          sender_type: sender !== 'all' ? sender : undefined,
        });
        setMessages(list);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // تحميل تلقائي عند فتح الصفحة وتغيير عوامل التصفية الأساسية
    handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, sender]);

  const filtered = useMemo(() => {
    let arr = [...messages];
    arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (conversationId.trim()) {
      arr = arr.filter(m => m.conversation_id === conversationId.trim());
    }
    if (userId.trim()) {
      const uid = Number(userId.trim());
      if (Number.isFinite(uid)) {
        arr = arr.filter(m => m.user_id === uid);
      }
    }
    if (channel !== 'all') {
      arr = arr.filter(m => m.channel === channel);
    }
    if (sender !== 'all') {
      arr = arr.filter(m => m.sender_type === sender);
    }
    return arr;
  }, [messages, conversationId, userId, channel, sender]);

  const onMarkRead = async (cid: string) => {
    setLoading(true);
    setError('');
    try {
      await markRead({ conversation_id: cid, actor: 'admin' });
      await handleLoad();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const onResolve = async (cid: string) => {
    setLoading(true);
    setError('');
    try {
      await resolveConversation(cid);
      await handleLoad();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', className: 'w-20' },
    { key: 'conversation_id', header: t('admin.conversationId') },
    { key: 'channel', header: t('admin.channel') },
    { key: 'sender_type', header: t('admin.sender') },
    { key: 'status', header: t('admin.status') },
    { key: 'user_id', header: t('admin.user') },
    { key: 'admin_id', header: t('admin.admin') },
    { key: 'message_text', header: t('admin.message') },
    { key: 'created_at', header: t('admin.date') },
  ];

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('admin.messages')}
        breadcrumbs={[{ label: t('admin.messages') }]}
      />
      <Card className="mb-4">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Input
              placeholder={t('admin.conversationId')}
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder={t('admin.user')}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div>
            <Select value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.channel')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.channelAll')}</SelectItem>
                <SelectItem value="support">{t('admin.channelSupport')}</SelectItem>
                <SelectItem value="assistant">{t('admin.channelAssistant')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={sender} onValueChange={(v) => setSender(v as typeof sender)}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.sender')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.channelAll')}</SelectItem>
                <SelectItem value="user">{t('admin.user')}</SelectItem>
                <SelectItem value="admin">{t('admin.admin')}</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex">
            <Button className="ms-auto" onClick={handleLoad} disabled={loading}>
              {t('admin.load')}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <AdminTable
            columns={[
              { key: 'actions', header: t('admin.actions') },
              ...columns,
            ]}
            data={filtered.map((m) => ({
              ...m,
              id: String(m.id),
              actions: (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onMarkRead(m.conversation_id)}>
                    {t('admin.markAsRead')}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onResolve(m.conversation_id)}>
                    {t('admin.resolveConversation')}
                  </Button>
                </div>
              ),
            }))}
            loading={loading}
            emptyMessage={t('admin.noMessages')}
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminMessagePage;
