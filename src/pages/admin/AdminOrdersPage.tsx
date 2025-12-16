import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getAllOrders, Order, updateOrderStatus } from '@/services/ordersService';
import { toast } from 'sonner';

const AdminOrdersPage = () => {
  const { t } = useLang();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getAllOrders();
      setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    // TODO: Replace with actual API call to backend
    await updateOrderStatus(orderId, newStatus);
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast.success(t('admin.statusUpdated'));
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'shipped': return 'secondary';
      case 'confirmed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const columns = [
    { key: 'id', header: t('admin.orderId'), className: 'w-24' },
    { 
      key: 'customer', 
      header: t('admin.customer'),
      render: (order: Order) => (
        <div>
          <p className="font-medium">{order.deliveryAddress.name}</p>
          <p className="text-sm text-muted-foreground">{order.deliveryAddress.phone}</p>
        </div>
      ),
    },
    { 
      key: 'date', 
      header: t('admin.date'),
      render: (order: Order) => new Date(order.date).toLocaleDateString(),
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
      key: 'changeStatus', 
      header: t('admin.changeStatus'),
      render: (order: Order) => (
        <Select
          value={order.status}
          onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">{t('account.pending')}</SelectItem>
            <SelectItem value="confirmed">{t('account.confirmed')}</SelectItem>
            <SelectItem value="shipped">{t('account.shipped')}</SelectItem>
            <SelectItem value="delivered">{t('account.delivered')}</SelectItem>
            <SelectItem value="cancelled">{t('account.cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    { 
      key: 'actions', 
      header: '',
      render: (order: Order) => (
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/admin/orders/${order.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('admin.orders')}
        breadcrumbs={[{ label: t('admin.orders') }]}
      />

      <Card>
        <CardContent className="p-0">
          <AdminTable
            columns={columns}
            data={orders}
            loading={loading}
            emptyMessage={t('admin.noOrders')}
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
