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
    type: 'custom',
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

    try {
      // Create order
      const order = await createOrder({
        userId: user?.id || 'guest',
        status: 'pending',
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: totalPrice,
        tax: taxAmount,
        shipping,
        total,
        deliveryAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        },
        location: (location.mapLink || location.address) ? location : undefined,
        paymentMethod,
      });

      // Clear cart
      clearCart();

      // Show success message
      toast.success(t('checkout.orderSuccess'));

      // Navigate to success page
      navigate(`/order-success/${order.id}`);
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
              onLocationChange={setLocation}
            />

            {/* Delivery Address */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">{t('checkout.deliveryAddress')}</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">{t('checkout.address')}</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">{t('checkout.city')}</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">{t('checkout.zipCode')}</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">{t('checkout.paymentMethod')}</h2>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
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
