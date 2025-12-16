import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, ExternalLink, Package } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTax } from '@/context/TaxContext';
import { getOrderById, Order, updateOrderStatus } from '@/services/ordersService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered'];

const AdminOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const { formatPrice } = useCurrency();
  const { isVatEnabled, vatPercentage, calculateTax } = useTax();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (id) {
        const data = await getOrderById(id);
        setOrder(data);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (order) {
      // TODO: Replace with actual API call to backend
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      toast.success(t('admin.statusUpdated'));
    }
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

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.status === 'cancelled') return -1;
    return statusSteps.indexOf(order.status);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>{t('common.loading')}</p>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>{t('admin.orderNotFound')}</p>
        </div>
      </AdminLayout>
    );
  }

  const currentStep = getCurrentStepIndex();
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return (
    <AdminLayout>
      <AdminPageHeader
        title={`${t('account.orderDetails')} #${order.id}`}
        breadcrumbs={[
          { label: t('admin.orders'), href: '/admin/orders' },
          { label: `#${order.id}` },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 me-2" />
            {t('admin.backToOrders')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('account.orderStatus')}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {t(`account.${order.status}`)}
                </Badge>
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(value as Order['status'])}
                >
                  <SelectTrigger className="w-[140px]">
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
              </div>
            </CardHeader>
            <CardContent>
              {order.status !== 'cancelled' ? (
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                          index <= currentStep
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs mt-2 text-center">{t(`account.${step}`)}</span>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={cn(
                            'absolute h-0.5 w-full',
                            index < currentStep ? 'bg-primary' : 'bg-muted'
                          )}
                          style={{ left: '50%', top: '16px', width: 'calc(100% - 32px)', marginLeft: '16px' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-destructive">{t('admin.orderCancelled')}</p>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.orderItems')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 py-2 border-b last:border-0">
                    <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('cart.quantity')}: {item.quantity}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('checkout.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {isVatEnabled && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tax.vat')} ({vatPercentage}%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t font-semibold">
                <span>{t('cart.total')}</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.customerInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{order.deliveryAddress.name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{order.deliveryAddress.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle>{t('checkout.deliveryAddress')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p>{order.deliveryAddress.address}</p>
                  <p className="text-muted-foreground">
                    {order.deliveryAddress.city}, {order.deliveryAddress.zipCode}
                  </p>
                </div>
              </div>
              {order.location?.mapLink && (
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <a href={order.location.mapLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 me-2" />
                    {t('location.useMap')}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Order Meta */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.orderInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('admin.orderId')}</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('admin.date')}</span>
                <span>{new Date(order.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('checkout.paymentMethod')}</span>
                <span>{t(`checkout.${order.paymentMethod}`)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetailsPage;
