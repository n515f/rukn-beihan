import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLang } from '@/context/LangContext';
import { getActiveBanners, Banner } from '@/services/adsService';

const OffersSection = () => {
  const { t, lang } = useLang();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount 
        : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (banners.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('offers.title')}</h2>
            <p className="text-muted-foreground mt-1">{t('offers.subtitle')}</p>
          </div>
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="hover:bg-primary/10 hover:border-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="hover:bg-primary/10 hover:border-primary"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Offers Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {banners.map((banner) => (
            <Card
              key={banner.id}
              className="flex-shrink-0 w-[300px] md:w-[380px] overflow-hidden group hover:shadow-gold transition-all duration-300 snap-start"
            >
              <div className="relative h-40 md:h-48 overflow-hidden">
                <img
                  src={banner.image}
                  alt={lang === 'ar' ? banner.titleAr : banner.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-foreground">
                    {lang === 'ar' ? banner.titleAr : banner.title}
                  </h3>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {lang === 'ar' ? banner.descriptionAr : banner.description}
                </p>
                <Button asChild variant="outline" className="w-full group/btn hover:bg-primary hover:text-primary-foreground hover:border-primary">
                  <Link to={banner.link}>
                    {t('offers.viewOffer')}
                    <ArrowRight className={`h-4 w-4 transition-transform group-hover/btn:translate-x-1 ${lang === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Button asChild variant="link" className="text-primary hover:text-primary/80">
            <Link to="/offers">
              {t('catalog.viewAll')}
              <ArrowRight className={`h-4 w-4 ${lang === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
