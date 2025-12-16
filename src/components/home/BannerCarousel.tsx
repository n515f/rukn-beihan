import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/context/LangContext';
import { getActiveBanners, Banner } from '@/services/adsService';

const BannerCarousel = () => {
  const { t, lang } = useLang();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // TODO: Replace with real API call
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

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="relative h-[400px] md:h-[500px] bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${currentBanner.image})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />

      {/* Content */}
      <div className="container mx-auto px-4 h-full relative z-20">
        <div className="flex items-center h-full">
          <div className="max-w-xl space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold">
              {lang === 'ar' ? currentBanner.titleAr : currentBanner.title}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              {lang === 'ar' ? currentBanner.descriptionAr : currentBanner.description}
            </p>
            <Button asChild size="lg" className="gold-gradient">
              <Link to={currentBanner.link}>
                {t('hero.cta')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-background/50 hover:bg-background/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
