import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/context/LangContext';
import { getActiveBanners, Banner } from '@/services/adsService';
import BannerCarousel from './BannerCarousel';

const OffersSection = () => {
  const { t, lang } = useLang();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getActiveBanners();
        setBanners(data.slice(0, 3)); // Top 3 banners
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="h-[clamp(180px,40vw,420px)] bg-muted animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (banners.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('offers.title')}</h2>
            <p className="text-muted-foreground mt-1">{t('offers.subtitle')}</p>
          </div>
          <Button asChild variant="link" className="text-primary hover:text-primary/80">
            <Link to="/offers">
              {t('catalog.viewAll')}
              <ArrowRight className={`h-4 w-4 ${lang === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </Link>
          </Button>
        </div>

        {/* Full-width Banner Carousel */}
        <BannerCarousel banners={banners} lang={lang} />
      </div>
    </section>
  );
};

export default OffersSection;
