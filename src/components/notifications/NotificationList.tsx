import { Bell, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLang } from '@/context/LangContext';
import React from 'react';
import type { Notification } from '@/services/notificationsService';
import { Button } from '@/components/ui/button';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
}

const NotificationList = ({ notifications, onMarkAsRead }: NotificationListProps) => {
  const { lang } = useLang();

  const formatDate = (iso: string) => {
    try {
      const dt = new Date(iso);
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dt);
    } catch {
      return iso;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`transition-colors rounded-lg border shadow-sm hover:shadow-md ${
            !notification.read ? 'border-primary bg-muted/30' : 'bg-background'
          }`}
        >
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">
                    {lang === 'ar' ? notification.titleAr : notification.title}
                  </h3>
                  {!notification.read && (
                    <Badge variant="default" className="ml-1 shrink-0">
                      {lang === 'ar' ? 'جديد' : 'New'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {lang === 'ar' ? notification.messageAr : notification.message}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(notification.timestamp)}
                </p>
              </div>

              {!notification.read && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={lang === 'ar' ? 'وضع علامة كمقروء' : 'Mark as read'}
                  onClick={() => onMarkAsRead?.(notification.id)}
                  className="shrink-0"
                >
                  <Check className="h-5 w-5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationList;
