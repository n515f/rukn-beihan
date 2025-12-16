import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLang } from '@/context/LangContext';
import { getOrderById, Order } from '@/services/ordersService';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const { t } = useLang();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (id) {
        const data = await getOrderById(id);
        setOrder(data);
      }
    };
    fetchOrder();
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold mb-2">{t('orderSuccess.title')}</h1>
        <p className="text-muted-foreground mb-6">{t('orderSuccess.thankYou')}</p>

        {/* Order Number */}
        {order && (
          <Card className="p-6 mb-6">
            <p className="text-sm text-muted-foreground mb-1">{t('orderSuccess.orderNumber')}</p>
            <p className="text-2xl font-bold text-primary">{order.id}</p>
          </Card>
        )}

        {/* Email Confirmation */}
        <p className="text-sm text-muted-foreground mb-8">
          {t('orderSuccess.emailSent')}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link to={`/account/orders/${id}`}>
              <Package className="h-5 w-5 mr-2" />
              {t('orderSuccess.trackOrder')}
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full" size="lg">
            <Link to="/catalog">
              {t('orderSuccess.continueShopping')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Rate Experience CTA */}
        <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-6 w-6 text-primary" />
            ))}
          </div>
          <p className="font-medium mb-2">{t('orderSuccess.rateExperience')}</p>
          <Button variant="ghost" size="sm">
            {t('reviews.writeReview')}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
