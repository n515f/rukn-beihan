import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getOrderById, Order } from '@/services/ordersService';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (id) {
        const data = await getOrderById(id);
        setOrder(data);
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>{t('common.error')}</p>
      </div>
    );
  }

  const statusSteps = [
    { key: 'pending', icon: Clock, label: t('account.pending') },
    { key: 'confirmed', icon: CheckCircle, label: t('account.confirmed') },
    { key: 'shipped', icon: Truck, label: t('account.shipped') },
    { key: 'delivered', icon: Package, label: t('account.delivered') }
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/account/orders')}
        className="mb-6"
      >
        <ArrowLeft className="me-2 h-4 w-4" />
        {t('account.backToOrders')}
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>{t('account.orderStatus')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div
                        className={`rounded-full p-3 mb-2 ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs text-center ${isActive ? 'font-semibold' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.orderItems')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('cart.quantity')}: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              {order.status === 'delivered' && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-3">{t('reviews.writeReview')}</h4>
                  <div className="grid gap-2">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                        <Button asChild size="sm">
                          <a href={`/product/${item.productId}#reviews`}>{t('reviews.writeReview')}</a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('cart.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.orderId')}</p>
                <p className="font-semibold">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.date')}</p>
                <p className="font-semibold">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('cart.subtotal')}</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('cart.shipping')}</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>{t('cart.total')}</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('checkout.deliveryAddress')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{order.deliveryAddress.name}</p>
              <p className="text-sm text-muted-foreground">{order.deliveryAddress.phone}</p>
              <p className="text-sm text-muted-foreground">{order.deliveryAddress.address}</p>
              <p className="text-sm text-muted-foreground">
                {order.deliveryAddress.city}{order.deliveryAddress.zipCode ? `, ${order.deliveryAddress.zipCode}` : ''}
              </p>

              {order.deliveryAddress.locationUrl && (
                <div className="mt-4">
                  {(() => {
                    const url = order.deliveryAddress.locationUrl!;
                    const patterns = [/@(-?\d+\.\d+),(-?\d+\.\d+)/, /q=(-?\d+\.\d+),(-?\d+\.\d+)/, /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, /center=(-?\d+\.\d+),(-?\d+\.\d+)/, /query=(-?\d+\.\d+),(-?\d+\.\d+)/];
                    const match = patterns.map((re) => url.match(re)).find((m) => !!m);
                    if (match) {
                      const embedUrl = `https://maps.google.com/maps?q=${match[1]},${match[2]}&z=15&output=embed`;
                      return (
                        <div className="relative h-40 bg-muted rounded-lg overflow-hidden border mb-2">
                          <iframe
                            src={embedUrl}
                            className="w-full h-full border-0"
                            loading="lazy"
                            title={t('location.mapPreview') || 'Map preview'}
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={order.deliveryAddress.locationUrl} target="_blank" rel="noopener noreferrer">
                      {t('location.viewOnMap') || 'View on Map'}
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
