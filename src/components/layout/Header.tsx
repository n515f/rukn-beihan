import { ShoppingCart, User, Bell, Search, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLang();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${searchQuery}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">R</span>
              </div>
              <span className="hidden text-xl font-bold text-primary sm:inline-block">
                {t('common.appName')}
              </span>
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl mx-8 md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
                <Input
                  type="search"
                  placeholder={t('common.search')}
                  className="pl-10 rtl:pl-4 rtl:pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle - hidden on mobile */}
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* Theme Toggle - hidden on mobile */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* Notifications */}
              {isAuthenticated && (
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/account/notifications">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                      3
                    </Badge>
                  </Link>
                </Button>
              )}

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                      {totalItems}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Account - hidden on mobile */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    {isAuthenticated ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/account">{t('common.account')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/account/orders">{t('account.orders')}</Link>
                        </DropdownMenuItem>
                        {user?.isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link to="/admin">{t('common.admin')}</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={logout}>
                          {t('common.logout')}
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/auth/login">{t('common.login')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/auth/register">{t('common.register')}</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Navigation - Desktop only */}
          <nav className="hidden md:flex h-12 items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className="transition-colors hover:text-primary"
            >
              {t('common.home')}
            </Link>
            <Link
              to="/catalog"
              className="transition-colors hover:text-primary"
            >
              {t('common.catalog')}
            </Link>
            <Link
              to="/offers"
              className="transition-colors hover:text-primary"
            >
              {t('common.offers')}
            </Link>
            <Link
              to="/support"
              className="transition-colors hover:text-primary"
            >
              {t('common.support')}
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default Header;
