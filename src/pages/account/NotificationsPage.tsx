import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getNotifications, Notification } from '@/services/notificationsService';
import { useLang } from '@/context/LangContext';

const NotificationsPage = () => {
  const { t, lang } = useLang();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('notifications.title')}</h1>
        <Button variant="outline">Mark all as read</Button>
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">{t('notifications.noNotifications')}</h3>
          <p className="text-muted-foreground">
            You're all caught up!
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-6 ${!notification.read ? 'border-l-4 border-l-primary bg-muted/30' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {lang === 'ar' ? notification.titleAr : notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {lang === 'ar' ? notification.messageAr : notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <Button variant="ghost" size="sm">
                    {t('notifications.markAsRead')}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
