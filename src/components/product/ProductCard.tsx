import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;

  name: string;
  nameAr?: string;

  brand: string;

  price: number;
  oldPrice?: number | null;

  image: string;

  rating: number;
  reviews: number;
  stock: number;

  bestSeller?: boolean;
  isNew?: boolean;

  // optional (لو تحب تعرض التصنيف على البطاقة لاحقاً)
  categoryName?: string;
  categoryNameAr?: string;
  // أضف دعم تمرير نمط خارجي
  className?: string;
  // جديد: تعطيل إضافة للسلة إذا المنتج غير نشط
  active?: boolean;
}

const ProductCard = ({
  id,
  name,
  nameAr,
  brand,
  price,
  oldPrice,
  image,
  rating,
  reviews,
  stock,
  bestSeller,
  isNew,
  className,
  active = true,
}: ProductCardProps) => {
  const { addItem, items } = useCart();
  const { t, lang } = useLang();
  const { formatPrice } = useCurrency();

  const displayName = lang === 'ar' ? (nameAr || name) : name;

  const existingQty = items.find((i) => i.id === id)?.quantity ?? 0;
  const outOfStock = !active || stock <= 0;
  const canAdd = !outOfStock && existingQty < stock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canAdd) {
      toast.error(
        lang === 'ar'
          ? 'لا يمكن إضافة كمية تتجاوز المخزون المتاح أو المنتج غير متاح'
          : 'Cannot add beyond available stock or product is inactive'
      );
      return;
    }
    addItem({
      id,
      name: displayName, // مهم: عشان سلة التسوق تستخدم نفس اللغة
      price,
      image,
      brand,
    });
    toast.success(t('messages.addedToCart'));
  };

  const discount =
    oldPrice && oldPrice > 0
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  return (
    <Card className={`group overflow-hidden hover-lift ${className ?? ''}`}>
      <Link to={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image || '/placeholder-battery.jpg'}
            alt={displayName}
            onError={(e) => {
              // fallback لو الصورة مفقودة
              (e.currentTarget as HTMLImageElement).src = '/placeholder-battery.jpg';
            }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {(bestSeller || isNew || discount > 0) && (
            <div className="absolute top-2 left-2 flex flex-col gap-2">
              {bestSeller && (
                <Badge className="bg-primary">{t('productDetail.bestSeller')}</Badge>
              )}
              {isNew && <Badge className="bg-accent">{t('productDetail.new')}</Badge>}
              {discount > 0 && <Badge className="bg-destructive">-{discount}%</Badge>}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-2 text-xs text-muted-foreground">{brand}</div>
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold">{displayName}</h3>

          <div className="mb-2 flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(price)}
            </span>
            {oldPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(oldPrice)}
              </span>
            ) : null}
          </div>

          <div className="mt-2 text-xs">
            {!outOfStock ? (
              <span className="text-green-600">{t('products.inStock')}</span>
            ) : (
              <span className="text-destructive">{t('products.outOfStock')}</span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={handleAddToCart} disabled={!canAdd}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {t('products.addToCart')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
