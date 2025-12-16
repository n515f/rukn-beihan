import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Tag, MessageCircle, User, LogIn, LogOut, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { t, lang } = useLang();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('common.home'), icon: Home },
    { to: '/catalog', label: t('common.catalog'), icon: Grid3X3 },
    { to: '/offers', label: t('common.offers'), icon: Tag },
    { to: '/support', label: t('common.support'), icon: MessageCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side={lang === 'ar' ? 'right' : 'left'} 
        className="w-80 p-0"
      >
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-start">
            <span className="text-xl font-bold text-primary">{t('common.appName')}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-5rem)]">
          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(link.to)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Separator className="my-4" />

            {/* Account Section */}
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/account"
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname.startsWith('/account')
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="font-medium">{t('common.account')}</span>
                    <span className="text-xs opacity-75">{user?.name}</span>
                  </div>
                </Link>

                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-all duration-200"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">{t('common.admin')}</span>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-4 py-3 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">{t('common.logout')}</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/auth/login"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-all duration-200"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="font-medium">{t('common.login')}</span>
                </Link>
                <Link
                  to="/auth/register"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">{t('common.register')}</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Footer with toggles */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('common.settings')}</span>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
