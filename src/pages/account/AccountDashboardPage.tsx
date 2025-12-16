import { Link } from 'react-router-dom';
import { ShoppingBag, Bell, Settings, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';

const AccountDashboardPage = () => {
  const { user } = useAuth();
  const { t } = useLang();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('account.welcome')}, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Manage your account and view your orders
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 hover-lift">
          <Link to="/account/orders" className="block">
            <Package className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">{t('account.orders')}</h3>
            <p className="text-sm text-muted-foreground">
              View and track your orders
            </p>
          </Link>
        </Card>

        <Card className="p-6 hover-lift">
          <Link to="/account/notifications" className="block">
            <Bell className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">{t('account.notifications')}</h3>
            <p className="text-sm text-muted-foreground">
              Check your notifications
            </p>
          </Link>
        </Card>

        <Card className="p-6 hover-lift">
          <Link to="/cart" className="block">
            <ShoppingBag className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">{t('common.cart')}</h3>
            <p className="text-sm text-muted-foreground">
              View items in your cart
            </p>
          </Link>
        </Card>

        <Card className="p-6 hover-lift">
          <Link to="/account/settings" className="block">
            <Settings className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">{t('account.settings')}</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account settings
            </p>
          </Link>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <Button asChild variant="outline">
            <Link to="/account/orders">View All</Link>
          </Button>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          No recent orders
        </div>
      </Card>
    </div>
  );
};

export default AccountDashboardPage;
