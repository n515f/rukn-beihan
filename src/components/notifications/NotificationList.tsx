import { Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLang } from '@/context/LangContext';

interface Notification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  time: string;
  read: boolean;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
}

const NotificationList = ({ notifications, onMarkAsRead }: NotificationListProps) => {
  const { lang } = useLang();

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
          className={`cursor-pointer transition-colors hover:bg-accent ${
            !notification.read ? 'border-primary' : ''
          }`}
          onClick={() => onMarkAsRead?.(notification.id)}
        >
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">
                {lang === 'ar' ? notification.titleAr : notification.title}
              </h3>
              {!notification.read && (
                <Badge variant="default" className="ml-2">
                  {lang === 'ar' ? 'جديد' : 'New'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {lang === 'ar' ? notification.messageAr : notification.message}
            </p>
            <p className="text-xs text-muted-foreground">{notification.time}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationList;
