import { useEffect, useState, useMemo } from 'react';
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

// Recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Helpers
const dayKey = (isoDate: string) => {
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const rangeDays = (n: number) => {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(dayKey(d.toISOString()));
  }
  return days;
};

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

  // Chart state
  const [orders, setOrders] = useState<Order[]>([]);

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
      setOrders(orders);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Derived chart data
  const lastDays = 14;
  const days = useMemo(() => rangeDays(lastDays), [lastDays]);

  const revenueData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      const key = dayKey(o.date);
      map[key] = (map[key] ?? 0) + o.total;
    }
    return days.map(d => ({ date: d, revenue: map[d] ?? 0 }));
  }, [orders, days]);

  const ordersBarData = useMemo(() => {
    const map: Record<string, { pending: number; delivered: number }> = {};
    for (const o of orders) {
      const key = dayKey(o.date);
      const row = (map[key] ?? { pending: 0, delivered: 0 });
      if (o.status === 'pending') row.pending += 1;
      if (o.status === 'delivered') row.delivered += 1;
      map[key] = row;
    }
    return days.map(d => ({ date: d, pending: map[d]?.pending ?? 0, delivered: map[d]?.delivered ?? 0 }));
  }, [orders, days]);

  const statusPieData = useMemo(() => {
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
    const counts: Record<string, number> = {};
    for (const s of statuses) counts[s] = 0;
    for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return statuses.map(s => ({ name: t(`account.${s}`), value: counts[s] ?? 0 }));
  }, [orders, t]);

  const pieColors = ['#f59e0b', '#6366f1', '#3b82f6', '#10b981', '#ef4444'];

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'shipped': return 'secondary';
      case 'confirmed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.totalRevenue')}</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" name={t('admin.totalRevenue')} stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders per Day (Pending vs Delivered) */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.ordersPerDay')}</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersBarData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" name={t('account.pending')} fill="#f59e0b" />
                <Bar dataKey="delivered" name={t('account.delivered')} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status (Pie) */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.orderStatusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie data={statusPieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
            columns={[
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
            ]}
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