import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Megaphone, 
  Users, 
  Star, 
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  LifeBuoy
} from 'lucide-react';
import { Tags, Tag } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/admin/categories', icon: Tags, label: t('admin.categories') },
    { path: '/admin/brands', icon: Tag, label: t('products.brands') },
    { path: '/admin/products', icon: Package, label: t('admin.products') },
    { path: '/admin/orders', icon: ShoppingCart, label: t('admin.orders') },
    { path: '/admin/banners', icon: Megaphone, label: t('admin.ads') },
    { path: '/admin/notifications', icon: Megaphone, label: t('admin.notifications') },
    // Added messages and support inbox entries
    { path: '/admin/messages', icon: MessageSquare, label: t('admin.messages') },
    { path: '/admin/support-inbox', icon: LifeBuoy, label: t('admin.supportInbox') },
    { path: '/admin/users', icon: Users, label: t('admin.users') },
    { path: '/admin/reviews', icon: Star, label: t('admin.reviews') },
    { path: '/admin/settings', icon: Settings, label: t('account.settings') },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'fixed top-0 h-screen bg-card border-e border-border transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64',
        lang === 'ar' ? 'right-0' : 'left-0'
      )}
    >
      {/* Logo / Brand */}
      <div className="h-16 flex items-center justify-center border-b border-border px-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} />
              <AvatarFallback>{user?.name?.slice(0,1) || '?'}</AvatarFallback>
            </Avatar>
            <div className="truncate">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{t('common.admin')}</p>
            </div>
          </div>
        ) : (
          <LayoutDashboard className="h-6 w-6 text-primary" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="absolute bottom-4 w-full px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center"
        >
          {lang === 'ar' ? (
            collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
