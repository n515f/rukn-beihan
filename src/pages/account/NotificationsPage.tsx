import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { getNotifications, markAsRead, Notification } from '@/services/notificationsService';
import { toast } from 'sonner';
import NotificationList from '@/components/notifications/NotificationList';
import { CheckCheck } from 'lucide-react';

const NotificationsPage = () => {
  const { t } = useLang();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const list = await getNotifications(String(user.id));
      setNotifications(list);
    } catch (err) {
      toast.error(t('notifications.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id, t]);

  useEffect(() => {
    const onUpdated = () => {
      fetchNotifications();
    };
    window.addEventListener('notifications-updated', onUpdated);
    return () => window.removeEventListener('notifications-updated', onUpdated);
  }, [user?.id]);

  const handleMarkAll = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((n) => markAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success(t('notifications.allMarkedRead'));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      toast.error(t('notifications.markAllError'));
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err) {
      toast.error(t('notifications.markError'));
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{t('notifications.title')}</h1>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('notifications.markAllAsRead')}
          disabled={notifications.every((n) => n.read)}
          onClick={handleMarkAll}
        >
          <CheckCheck className="h-5 w-5" />
        </Button>
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground">{t('common.loading')}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-muted-foreground">{t('notifications.noNotifications')}</div>
      ) : (
        <NotificationList notifications={notifications} onMarkAsRead={handleMarkOne} />
      )}
    </div>
  );
};

export default NotificationsPage;
