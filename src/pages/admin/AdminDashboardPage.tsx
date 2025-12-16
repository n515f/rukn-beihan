import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdminTable from '@/components/admin/AdminTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getProducts } from '@/services/productsService';
import { getAllOrders, Order } from '@/services/ordersService';

const AdminDashboardPage = () => {
  const { t } = useLang();
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [products, orders] = await Promise.all([
        getProducts(),
        getAllOrders(),
      ]);

      const pending = orders.filter(o => o.status === 'pending').length;
      const completed = orders.filter(o => o.status === 'delivered').length;
      const revenue = orders.reduce((sum, o) => sum + o.total, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: pending,
        completedOrders: completed,
        totalRevenue: revenue,
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, []);

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'shipped': return 'secondary';
      case 'confirmed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const orderColumns = [
    { key: 'id', header: t('admin.orderId') },
    { 
      key: 'customer', 
      header: t('admin.customer'),
      render: (order: Order) => order.deliveryAddress.name,
    },
    { 
      key: 'total', 
      header: t('cart.total'),
      render: (order: Order) => formatPrice(order.total),
    },
    { 
      key: 'status', 
      header: t('account.orderStatus'),
      render: (order: Order) => (
        <Badge variant={getStatusBadgeVariant(order.status)}>
          {t(`account.${order.status}`)}
        </Badge>
      ),
    },
    { 
      key: 'actions', 
      header: '',
      render: (order: Order) => (
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/admin/orders/${order.id}`}>{t('admin.viewDetails')}</Link>
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminPageHeader title={t('admin.dashboard')} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <AdminStatCard
          title={t('admin.totalProducts')}
          value={stats.totalProducts}
          icon={Package}
        />
        <AdminStatCard
          title={t('admin.totalOrders')}
          value={stats.totalOrders}
          icon={ShoppingCart}
        />
        <AdminStatCard
          title={t('admin.pendingOrders')}
          value={stats.pendingOrders}
          icon={Clock}
        />
        <AdminStatCard
          title={t('admin.completedOrders')}
          value={stats.completedOrders}
          icon={CheckCircle}
        />
        <AdminStatCard
          title={t('admin.totalRevenue')}
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('admin.recentOrders')}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/orders">{t('catalog.viewAll')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <AdminTable
            columns={orderColumns}
            data={recentOrders}
            loading={loading}
            emptyMessage={t('admin.noOrders')}
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
