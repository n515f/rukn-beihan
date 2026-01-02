import { useLang } from '@/context/LangContext';

// Images sourced from public/images/Brands
const brandImages = [
  '/images/Brands/ACDelco.png',
  '/images/Brands/AMARON.png',
  '/images/Brands/BOSCH.png',
  '/images/Brands/Hankook.png',
  '/images/Brands/Panasonic.svg',
  '/images/Brands/ROAD Power.png',
  '/images/Brands/ROYAL.png',
  '/images/Brands/SHUBA.png',
  '/images/Brands/SUPER GOLD.png',
  '/images/Brands/TIGER HEAD.png',
  '/images/Brands/TORO.png',
  '/images/Brands/VARTA.png',
  '/images/Brands/VISCA POWER.png',
  '/images/Brands/VOLTA.png',
];

const getAltFromPath = (path: string) => {
  const name = path.split('/').pop() || '';
  return name.replace(/\.[^.]+$/, ''); // remove extension
};

const BrandMarquee = () => {
  const { t, lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <section className="py-8 overflow-hidden" aria-label={t('features.trustedBrands')}>
      {/* Inline keyframes to keep changes scoped to this component */}
      <style>
        {`
          @keyframes brand-marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
        `}
      </style>

      <div className="container mx-auto px-4 mb-6">
        <h3 className="text-center text-lg font-semibold text-muted-foreground">
          {t('features.trustedBrands')}
        </h3>
      </div>

      <div className="relative">
        {/* Marquee container - no gap; spacing comes from item padding */}
        <div
          className="flex w-max flex-nowrap transform-gpu will-change-transform"
          style={{
            animation: 'brand-marquee 18s linear infinite',
            animationDirection: isAr ? 'normal' : 'reverse',
          }}
        >
          {/* First set of brand images */}
          {brandImages.map((src, index) => (
            <div
              key={`brand-img-1-${index}`}
              className="flex-none w-[160px] h-[80px] md:w-[180px] md:h-[90px] lg:w-[200px] lg:h-[100px] flex items-center justify-center px-6"
            >
              <img
                src={src}
                alt={getAltFromPath(src)}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ))}

          {/* Duplicate set for seamless loop */}
          {brandImages.map((src, index) => (
            <div
              key={`brand-img-2-${index}`}
              className="flex-none w-[160px] h-[80px] md:w-[180px] md:h-[90px] lg:w-[200px] lg:h-[100px] flex items-center justify-center px-6"
              aria-hidden="true"
            >
              <img
                src={src}
                alt={getAltFromPath(src)}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;