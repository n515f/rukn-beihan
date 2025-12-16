import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActiveBanners, Banner } from '@/services/adsService';
import { useLang } from '@/context/LangContext';

const OffersPage = () => {
  const { t, lang } = useLang();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getActiveBanners();
        setBanners(data);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('common.offers')}</h1>
        <p className="text-muted-foreground">
          Check out our latest promotions and special deals
        </p>
      </div>

      {banners.length === 0 ? (
        <Card className="p-12 text-center">
          <Tag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No active offers</h3>
          <p className="text-muted-foreground mb-6">
            Check back soon for new deals and promotions!
          </p>
          <Button asChild>
            <Link to="/catalog">Browse Products</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden hover-lift">
              <div className="aspect-video bg-muted">
                <img
                  src={banner.image}
                  alt={lang === 'ar' ? banner.titleAr : banner.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">
                  {lang === 'ar' ? banner.titleAr : banner.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {lang === 'ar' ? banner.descriptionAr : banner.description}
                </p>
                <Button asChild className="w-full">
                  <Link to={banner.link}>View Offer</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersPage;
