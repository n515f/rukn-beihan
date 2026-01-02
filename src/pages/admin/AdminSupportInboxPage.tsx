import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLang } from '@/context/LangContext';
import { Message as ApiMessage, listMessages, getThread, markRead, resolveConversation, replyAdmin } from '@/services/messagesApi';

const AdminSupportInboxPage = () => {
  const { t } = useLang();
  const [conversationId, setConversationId] = useState('');
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'all' | 'open' | 'resolved'>('all');

  const [threadMessages, setThreadMessages] = useState<ApiMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  const loadList = async () => {
    setLoading(true);
    setError('');
    try {
      const uid = Number(userId.trim());
      const list = await listMessages({
        user_id: Number.isFinite(uid) ? uid : undefined,
        channel: 'support',
        status: status !== 'all' ? status : undefined,
      });
      setMessages(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (cid: string) => {
    setConversationId(cid);
    setLoading(true);
    setError('');
    try {
      const thread = await getThread(cid);
      const list: ApiMessage[] = thread.notifications ?? thread.messages ?? [];
      setThreadMessages(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setThreadMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const onReply = async () => {
    if (!conversationId.trim() || !replyText.trim()) return;
    setLoading(true);
    setError('');
    try {
      await replyAdmin({
        conversation_id: conversationId.trim(),
        message_text: replyText.trim(),
        channel: 'support',
        status: 'answered',
      });
      setReplyText('');
      await loadThread(conversationId.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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
    return arr;
  }, [messages, conversationId, userId]);

  const columns = [
    { key: 'id', header: 'ID', className: 'w-20' },
    { key: 'conversation_id', header: t('admin.conversationId') },
    { key: 'sender_type', header: t('admin.sender') },
    { key: 'status', header: t('admin.status') },
    { key: 'user_id', header: t('admin.user') },
    { key: 'message_text', header: t('admin.message') },
    { key: 'created_at', header: t('admin.date') },
  ];

  const onMarkRead = async (conversation_id: string) => {
    setLoading(true);
    setError('');
    try {
      await markRead({ conversation_id, actor: 'admin' });
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const onResolve = async (conversation_id: string) => {
    setLoading(true);
    setError('');
    try {
      await resolveConversation(conversation_id);
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('admin.supportInbox')}
        breadcrumbs={[{ label: t('admin.supportInbox') }]}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.all')}</SelectItem>
                    <SelectItem value="open">{t('admin.open')}</SelectItem>
                    <SelectItem value="resolved">{t('admin.resolved')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex">
                <Button className="ms-auto" onClick={loadList} disabled={loading}>
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
                      <Button size="sm" onClick={() => loadThread(m.conversation_id)}>
                        {t('admin.preview')}
                      </Button>
                    </div>
                  ),
                }))}
                loading={loading}
                emptyMessage={t('admin.noMessages')}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.thread')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3 max-h-[420px] overflow-y-auto">
                {threadMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-4 py-2 ${m.sender_type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="text-sm">{m.message_text}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {threadMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('admin.noMessages')}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={t('admin.typeReply')}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onReply()}
                  disabled={!conversationId}
                />
                <Button onClick={onReply} disabled={loading || !conversationId.trim()}>
                  {t('admin.send')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSupportInboxPage;
