import { useEffect, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { getProductById } from '@/services/productsService';
import { toast } from 'sonner';
import { useLang } from '@/context/LangContext';

interface CartItemProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

const CartItem = ({ id, name, brand, price, image, quantity }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();
  const [maxQty, setMaxQty] = useState<number>(Infinity);
  const { lang } = useLang();
  const [notifiedLimit, setNotifiedLimit] = useState(false);
  const canDecrease = quantity > 1;
  const canIncrease = quantity < maxQty;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getProductById(id);
        if (mounted) setMaxQty(Number(p?.stock ?? Infinity));
      } catch {
        if (mounted) setMaxQty(Infinity);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (Number.isFinite(maxQty) && quantity >= maxQty && !notifiedLimit) {
      toast.error(
        lang === 'ar'
          ? `الكمية المتاحة فقط ${maxQty}`
          : `Only ${maxQty} available in stock`
      );
      setNotifiedLimit(true);
    }
  }, [quantity, maxQty, notifiedLimit, lang]);

  return (
    <div className="flex gap-4 border-b py-4 last:border-b-0">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">{brand}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => removeItem(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(id, Math.max(quantity - 1, 1))}
              disabled={!canDecrease}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(id, Math.min(quantity + 1, maxQty))}
              disabled={!canIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-right">
            <div className="font-bold text-primary">${(price * quantity).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">${price} each</div>
            {Number.isFinite(maxQty) && (
              <span className="text-xs text-muted-foreground">
                {canIncrease ? `المتوفر: ${maxQty}` : 'لا يمكن زيادة الكمية أكثر من المخزون'}
              </span>
            )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default CartItem;
