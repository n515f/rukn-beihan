import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLang } from '@/context/LangContext';

const NotificationBell = () => {
  const { t, lang } = useLang();

  // Mock notifications
  const notifications = [
    {
      id: '1',
      title: lang === 'ar' ? 'تم شحن الطلب' : 'Order Shipped',
      message: lang === 'ar' ? 'تم شحن طلبك #ORD-2024-002' : 'Your order #ORD-2024-002 has been shipped',
      read: false,
    },
    {
      id: '2',
      title: lang === 'ar' ? 'عرض خاص' : 'Special Offer',
      message: lang === 'ar' ? 'خصم 20% على بطاريات AGM' : '20% off on AGM batteries',
      read: false,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-2 ${
                    !notification.read ? 'bg-muted' : ''
                  }`}
                >
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {notification.message}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="justify-center text-primary">
                View all notifications
              </DropdownMenuItem>
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {t('notifications.noNotifications')}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
