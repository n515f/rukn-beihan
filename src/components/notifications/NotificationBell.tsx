import { useEffect, useMemo, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { getNotifications, markAsRead, Notification } from '@/services/notificationsService';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (iso: string) => {
    try {
      const dt = new Date(iso);
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dt);
    } catch {
      return iso;
    }
  };

  const refresh = async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const list = await getNotifications(String(user.id));
      setNotifications(list);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // تحديث عند تغيير المستخدم (تسجيل دخول/خروج)
  }, [user?.id]);

  useEffect(() => {
    const onUpdated = () => {
      refresh();
    };
    window.addEventListener('notifications-updated', onUpdated);
    return () => window.removeEventListener('notifications-updated', onUpdated);
  }, [user?.id]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleMarkAll = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((n) => markAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch {
      // يمكن عرض toast في صفحة الإشعارات بدلًا من هنا
    }
  };

  const handleOpenAll = () => {
    navigate('/account/notifications');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t('notifications.title')}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover">
        <div className="p-2">
          <h3 className="font-semibold mb-2">{t('notifications.title')}</h3>
          {loading ? (
            <div className="py-4 text-center text-sm text-muted-foreground">{t('common.loading')}</div>
          ) : notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start justify-between gap-2 p-2 ${!notification.read ? 'bg-muted' : ''}`}
                  onClick={async () => {
                    navigate('/account/notifications');
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {lang === 'ar' ? notification.titleAr : notification.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {lang === 'ar' ? notification.messageAr : notification.message}
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {formatDate(notification.timestamp)}
                    </div>
                  </div>
                  {!notification.read && (
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={t('notifications.markAsRead')}
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await markAsRead(notification.id);
                          setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
                          window.dispatchEvent(new CustomEvent('notifications-updated'));
                        } catch {}
                      }}
                      className="shrink-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="justify-center text-primary" onClick={handleOpenAll}>
                {t('notifications.viewAll')}
              </DropdownMenuItem>
              {unreadCount > 0 && (
                <DropdownMenuItem className="justify-center" onClick={handleMarkAll}>
                  {t('notifications.markAllAsRead')}
                </DropdownMenuItem>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">{t('notifications.noNotifications')}</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
