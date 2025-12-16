import { Bell, Menu } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/layout/ThemeToggle';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const { t } = useLang();
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page Title - Desktop */}
      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold">{t('admin.dashboard')}</h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user ? getInitials(user.name) : 'AD'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">
                {user?.name || 'Admin'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/">{t('common.home')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/account">{t('common.account')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive">
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
