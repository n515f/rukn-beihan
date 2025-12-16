import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CartItem from '@/components/cart/CartItem';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';

const CartPage = () => {
  const { items, totalPrice, totalItems } = useCart();
  const { t } = useLang();
  const { formatPrice } = useCurrency();

  const shipping = 15.00;
  const total = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">{t('cart.empty')}</h1>
          <p className="text-muted-foreground mb-8">
            Add some products to your cart to see them here
          </p>
          <Button asChild>
            <Link to="/catalog">{t('cart.continueShopping')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.myCart')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {items.map((item) => (
              <CartItem key={item.id} {...item} />
            ))}
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('cart.shipping')}</span>
                <span className="font-medium">{formatPrice(shipping)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>{t('cart.total')}</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <Button asChild className="w-full" size="lg">
              <Link to="/checkout">{t('cart.checkout')}</Link>
            </Button>

            <Button asChild variant="outline" className="w-full mt-4">
              <Link to="/catalog">{t('cart.continueShopping')}</Link>
            </Button>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Items: {totalItems}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
