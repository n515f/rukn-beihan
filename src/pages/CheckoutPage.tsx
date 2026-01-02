import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import LocationSelector from '@/components/checkout/LocationSelector';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTax } from '@/context/TaxContext';
import { createOrder } from '@/services/ordersService';
import { createAddress } from '@/services/addressesService';
import { createNotification } from '@/services/notificationsService';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLang();
  const { formatPrice } = useCurrency();
  const { isVatEnabled, vatPercentage } = useTax();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [location, setLocation] = useState<{
    type: 'map' | 'custom';
    mapLink?: string;
    address?: string;
    city?: string;
    zipCode?: string;
  }>({
    type: 'map',
    address: '',
    city: '',
    zipCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cashOnDelivery' | 'onlinePayment'>(
    'cashOnDelivery'
  );

  const shipping = 15.00;
  const taxAmount = isVatEnabled ? totalPrice * (vatPercentage / 100) : 0;
  const total = totalPrice + shipping + taxAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // منع إتمام الطلب قبل تسجيل الدخول
    if (!user) {
      toast.error(t('auth.loginRequired'));
      navigate('/auth/register?redirect=/checkout');
      setLoading(false);
      return;
    }

    try {
      // Validate required fields: address, city, and map link
      const hasAddress = (formData.address || '').trim().length > 0;
      const hasCity = (formData.city || '').trim().length > 0;
      const hasMapLink = (location.mapLink || '').trim().length > 0;
      if (!hasAddress || !hasCity) {
        toast.error(t('checkout.addressRequired') || 'Please enter full address (street and city)');
        setLoading(false);
        return;
      }
      if (!hasMapLink) {
        toast.error(t('location.mapLinkRequired') || 'Please paste a Google Maps link to your location');
        setLoading(false);
        return;
      }

      // 1. Create Address
      const street = (location.address || formData.address || 'Pinned Location');
      const cityToSend = (location.city || formData.city);

      const addressId = await createAddress({
        userId: user!.id,
        fullName: formData.name,
        phone: formData.phone,
        city: cityToSend,
        street,
        locationUrl: location.mapLink,
      });

      // 2. Create Order
      const order = await createOrder({
        user_id: user!.id,
        address_id: addressId,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: total,
        vat_amount: taxAmount,
        currency: 'SAR',
        payment_method: paymentMethod === 'cashOnDelivery' ? 'cod' : 'online',
      });

      await createNotification({
        userId: user!.id,
        titleEn: "New Order Created",
        titleAr: "تم إنشاء طلب جديد",
        messageEn: `Your order #${order.orderId} has been placed successfully.`,
        messageAr: `تم إنشاء طلبك رقم #${order.orderId} بنجاح.`,
        type: "order",
      });

      // Clear cart
      clearCart();

      // Show success message
      toast.success(t('checkout.orderSuccess'));

      // Navigate to success page
      navigate(`/order-success/${order.orderId}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(t('checkout.orderError'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">{t('checkout.customerInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('checkout.name')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t('checkout.phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">{t('checkout.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Delivery Location */}
            <LocationSelector
              onLocationChange={(loc) => {
                setLocation(loc);
                setFormData(prev => ({
                  ...prev,
                  address: loc.address || prev.address,
                  city: loc.city || prev.city,
                  zipCode: loc.zipCode || prev.zipCode
                }));
              }}
            />

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">{t('checkout.paymentMethod')}</h2>
              <RadioGroup value={paymentMethod} onValueChange={(value: 'cashOnDelivery' | 'onlinePayment') => setPaymentMethod(value)}>
                <div className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="cashOnDelivery" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{t('checkout.cashOnDelivery')}</div>
                      <div className="text-sm text-muted-foreground">{t('checkout.cashOnDeliveryDesc')}</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="onlinePayment" id="online" />
                  <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{t('checkout.onlinePayment')}</div>
                      <div className="text-sm text-muted-foreground">{t('checkout.onlinePaymentDesc')}</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">{t('checkout.orderSummary')}</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.shipping')}</span>
                  <span className="font-medium">{formatPrice(shipping)}</span>
                </div>

                {isVatEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('tax.vat')} ({vatPercentage}%)</span>
                    <span className="font-medium">{formatPrice(taxAmount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t('common.loading') : t('checkout.placeOrder')}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
