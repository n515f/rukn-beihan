import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { getOrdersByUser, Order } from '@/services/ordersService';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';

const OrdersPage = () => {
  const { user } = useAuth();
  const { t } = useLang();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const data = await getOrdersByUser(String(user.id))

        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'confirmed':
        return 'bg-primary';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('account.orders')}</h1>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">{t('account.noOrders')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('account.startShopping')}
          </p>
          <Button asChild>
            <Link to="/catalog">{t('products.viewDetails')}</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t('admin.orderId')}: {order.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {t(`account.${order.status}`)}
                </Badge>
              </div>

              <div className="mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {item.name} × {item.quantity}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <span className="text-muted-foreground me-2">{t('cart.total')}:</span>
                  <span className="font-bold text-primary text-lg">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <Button asChild variant="outline">
                  <Link to={`/account/orders/${order.id}`}>{t('admin.viewDetails')}</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
