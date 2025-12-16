import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTax } from '@/context/TaxContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const CartSummary = () => {
  const { totalPrice, totalItems } = useCart();
  const { t } = useLang();
  const { formatPrice } = useCurrency();
  const { isVatEnabled, vatPercentage } = useTax();
  const navigate = useNavigate();
  
  const shipping = 10.00;
  const taxAmount = isVatEnabled ? totalPrice * (vatPercentage / 100) : 0;
  const total = totalPrice + shipping + taxAmount;

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">{t('cart.orderSummary')}</h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('cart.subtotal')}</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('cart.shipping')}</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          {isVatEnabled && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('tax.vat')} ({vatPercentage}%)</span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
          )}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-semibold text-lg mb-6">
          <span>{t('cart.total')}</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => navigate('/checkout')}
          disabled={totalItems === 0}
        >
          {t('cart.checkout')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CartSummary;
