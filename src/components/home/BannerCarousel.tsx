import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Banner } from '@/services/adsService';

interface BannerCarouselProps {
  banners: Banner[];
  lang: string;
  className?: string;
}

const AUTOPLAY_MS = 5000;

export default function BannerCarousel({ banners, lang, className }: BannerCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(banners.length);
  const intervalRef = React.useRef<number | null>(null);
  const isHoveringRef = React.useRef(false);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    setSnapCount(api.scrollSnapList().length);
    onSelect();
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const startAutoplay = React.useCallback(() => {
    if (intervalRef.current != null) return;
    intervalRef.current = window.setInterval(() => {
      if (!api || isHoveringRef.current) return;
      api.scrollNext();
    }, AUTOPLAY_MS);
  }, [api]);

  const stopAutoplay = React.useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const onMouseEnter = () => {
    isHoveringRef.current = true;
  };
  const onMouseLeave = () => {
    isHoveringRef.current = false;
  };

  const goTo = (index: number) => {
    api?.scrollTo(index);
  };

  const scrollPrev = () => api?.scrollPrev();
  const scrollNext = () => api?.scrollNext();

  return (
    <div className={cn('w-full', className)}>
      <div
        className="relative w-full bg-background rounded-lg shadow-sm overflow-hidden"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Carousel
          opts={{ loop: true, dragFree: false, align: 'start' }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="">
            {banners.map((banner) => {
              const title = lang === 'ar' ? banner.titleAr : banner.title;
              const description = lang === 'ar' ? banner.descriptionAr : banner.description;
              return (
                <CarouselItem key={banner.id}>
                  <div className="flex flex-col">
                    {/* Image Area - full width, contain, centered */}
                    <Link to={banner.link} aria-label={title} className="block">
                      <div className="flex items-center justify-center w-full h-[clamp(180px,40vw,420px)] bg-muted/30">
                        <img
                          src={banner.image}
                          alt={title}
                          className="max-h-full max-w-full object-contain mx-auto"
                        />
                      </div>
                    </Link>

                    {/* Text Strip Below - blurred glass effect */}
                    <div className="px-4 py-3 backdrop-blur-md bg-background/70 border-t border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">{title}</h3>
                      {description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Custom Arrows */}
          <Button
            variant="outline"
            size="icon"
            aria-label={lang === 'ar' ? 'السابق' : 'Previous'}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 backdrop-blur-md border-border shadow-sm"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={lang === 'ar' ? 'التالي' : 'Next'}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/70 backdrop-blur-md border-border shadow-sm"
            onClick={scrollNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </Carousel>
      </div>

      {/* Dots / Pagination */}
      {snapCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: snapCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={(lang === 'ar' ? 'اذهب إلى السلايد' : 'Go to slide') + ` ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-colors',
                i === selectedIndex ? 'bg-primary' : 'bg-muted-foreground/40 hover:bg-muted-foreground/60',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}