import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getOrderById, Order } from '@/services/ordersService';

const OrderTrackingPage = () => {
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('admin.orderNotFound')}</h3>
          <Button asChild className="mt-4">
            <Link to="/account/orders">{t('account.backToOrders')}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const statusSteps = [
    {
      key: 'pending',
      icon: Clock,
      label: t('account.pending'),
      description: 'Order received and being processed',
      descriptionAr: 'تم استلام الطلب وجاري المعالجة',
    },
    {
      key: 'confirmed',
      icon: CheckCircle,
      label: t('account.confirmed'),
      description: 'Order confirmed and preparing for shipment',
      descriptionAr: 'تم تأكيد الطلب وجاري التحضير للشحن',
    },
    {
      key: 'shipped',
      icon: Truck,
      label: t('account.shipped'),
      description: 'Order is on the way to your location',
      descriptionAr: 'الطلب في الطريق إلى موقعك',
    },
    {
      key: 'delivered',
      icon: Package,
      label: t('account.delivered'),
      description: 'Order has been delivered successfully',
      descriptionAr: 'تم توصيل الطلب بنجاح',
    },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-success text-success-foreground';
      case 'shipped':
        return 'bg-primary text-primary-foreground';
      case 'confirmed':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 page-enter">
      <Button
        variant="ghost"
        onClick={() => navigate('/account/orders')}
        className="mb-6 hover:bg-muted"
      >
        <ArrowLeft className="me-2 h-4 w-4" />
        {t('account.backToOrders')}
      </Button>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {t('account.orderDetails')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.orderId')}: <span className="font-mono">{order.id}</span>
          </p>
        </div>
        <Badge className={`${getStatusColor(order.status)} px-4 py-2 text-sm`}>
          {isCancelled ? t('account.cancelled') : statusSteps[currentStepIndex]?.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                {t('account.orderStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCancelled ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-lg font-semibold text-destructive">
                    {t('admin.orderCancelled')}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical Timeline */}
                  <div className="space-y-8">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <div key={step.key} className="relative flex gap-4">
                          {/* Connector Line */}
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`absolute ${lang === 'ar' ? 'right-5' : 'left-5'} top-12 w-0.5 h-full -translate-x-1/2 ${
                                isActive && index < currentStepIndex
                                  ? 'bg-primary'
                                  : 'bg-border'
                              }`}
                            />
                          )}

                          {/* Icon */}
                          <div
                            className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-gold'
                                : 'bg-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-4 ring-primary/30 scale-110' : ''}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 pt-1">
                            <h4
                              className={`font-semibold ${
                                isActive ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {step.label}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {lang === 'ar' ? step.descriptionAr : step.description}
                            </p>
                            {isCurrent && (
                              <Badge
                                variant="outline"
                                className="mt-2 border-primary text-primary"
                              >
                                Current Status
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {t('admin.orderItems')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.productId}
                    className={`flex items-center justify-between py-4 ${
                      index < order.items.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('cart.quantity')}: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle>{t('cart.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('admin.date')}</p>
                  <p className="font-medium">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('checkout.paymentMethod')}
                  </p>
                  <p className="font-medium">{t(order.paymentMethod === 'cod' ? 'checkout.cashOnDelivery' : 'checkout.onlinePayment')}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.shipping')}</span>
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

          {/* Delivery Address */}
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t('checkout.deliveryAddress')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{order.deliveryAddress.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {order.deliveryAddress.phone}
              </div>
              <p className="text-sm text-muted-foreground">
                {order.deliveryAddress.address}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.deliveryAddress.city}, {order.deliveryAddress.zipCode}
              </p>
              
              {order.deliveryAddress.locationUrl && (
                <div className="mt-2">
                  {/* Try to embed map if possible */}
                  {(() => {
                    const url = order.deliveryAddress.locationUrl;
                    const patterns = [
                      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
                      /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
                      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
                      /center=(-?\d+\.\d+),(-?\d+\.\d+)/,
                      /query=(-?\d+\.\d+),(-?\d+\.\d+)/,
                    ];
                    const match = patterns.map((re) => url.match(re)).find((m) => !!m);
                    
                    if (match) {
                      const embedUrl = `https://maps.google.com/maps?q=${match[1]},${match[2]}&z=15&output=embed`;
                      return (
                        <div className="relative h-48 bg-muted rounded-lg overflow-hidden border mb-2">
                          <iframe 
                            src={embedUrl}
                            className="w-full h-full border-0"
                            loading="lazy"
                            title={t('location.mapPreview') || "Map preview"}
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={order.deliveryAddress.locationUrl} target="_blank" rel="noopener noreferrer">
                      <MapPin className="h-4 w-4 me-2" />
                      {t('location.viewOnMap') || "View on Map"}
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="premium-card bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">{t('common.support')}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Need help with your order?
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/support">{t('footer.contactUs')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
