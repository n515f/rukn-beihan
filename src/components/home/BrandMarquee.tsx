import { useLang } from '@/context/LangContext';

const brands = [
  'BOSCH',
  'Electron',
  'Royal',
  'Toro',
  'AC Delco',
  'Panasonic',
  'Red Power',
  'Amaron',
  'VARTA Germany',
  'VARTA Spain',
];

const BrandMarquee = () => {
  const { t } = useLang();

  return (
    <section className="py-8 overflow-hidden border-y-2 border-primary/30 bg-muted/30">
      <div className="container mx-auto px-4 mb-6">
        <h3 className="text-center text-lg font-semibold text-muted-foreground">
          {t('features.trustedBrands')}
        </h3>
      </div>
      <div className="relative">
        {/* Gradient overlays for seamless effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        
        {/* Marquee container */}
        <div className="flex animate-marquee">
          {/* First set of brands */}
          {brands.map((brand, index) => (
            <div
              key={`brand-1-${index}`}
              className="flex-shrink-0 mx-8 px-6 py-3 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-gold transition-all duration-300"
            >
              <span className="text-lg font-bold whitespace-nowrap text-foreground">
                {brand}
              </span>
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {brands.map((brand, index) => (
            <div
              key={`brand-2-${index}`}
              className="flex-shrink-0 mx-8 px-6 py-3 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-gold transition-all duration-300"
            >
              <span className="text-lg font-bold whitespace-nowrap text-foreground">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;
