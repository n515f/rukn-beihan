import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Truck, Shield, Star, Target, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/context/LangContext';
import { useEffect, useState } from 'react';

const HeroSection = () => {
  const { t, lang } = useLang();
  const [employeesCount, setEmployeesCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'values' | 'vision'>('values');
  const heroImages = ['/images/Hero/Branches1.png', '/images/Hero/Branches2.png', '/images/Hero/Branches3.png',];
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/966552226407', '_blank');
  };

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1500; // ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setEmployeesCount(Math.floor(progress * 3));
      setCustomersCount(Math.floor(progress * 200));
      if (progress < 1) requestAnimationFrame(animate);
    };

    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Existing Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted">
          {/* Abstract pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-primary/50 blur-3xl" />
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className={`space-y-8 animate-fade-in ${lang === 'ar' ? 'lg:order-2 text-right' : 'lg:order-1'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-sm font-medium text-primary">{t('features.trustedBrands')}</span>
              </div>

              {/* Main headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-foreground">{t('common.appNameFull')}</span>
                </h1>
                <p className="text-xl md:text-2xl text-primary font-semibold">
                  {t('hero.title')}
                </p>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                {t('hero.subtitle')}
              </p>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{t('features.freeDelivery')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{t('features.warranty')}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="gold-gradient hover:shadow-gold transition-all duration-300 hover:scale-105">
                  <Link to="/catalog">
                    {t('hero.cta')}
                    <ArrowRight className={`h-5 w-5 ${lang === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWhatsAppClick}
                  className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                >
                  <MessageCircle className={`h-5 w-5 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('hero.whatsapp')}
                </Button>
              </div>

              {/* Contact info */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {/* Phone icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.77.65 2.6a2 2 0 0 1-.45 2.11L8.04 9.7a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.83.31 1.7.53 2.6.65A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{t('common.phone')}</span>
                  <span className="mx-2">•</span>
                  {/* Clock icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{t('common.hours')}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  {/* Map pin icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M21 10c0 5-9 12-9 12S3 15 3 10a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{t('common.serviceAreas')}</span>
                </p>
              </div>
            </div>

            {/* Visual side */}
            <div className={`relative ${lang === 'ar' ? 'lg:order-1' : 'lg:order-2'}`}>
              <div className="relative animate-slide-up">
                {/* Main decorative element */}
                <div className="aspect-square max-w-md mx-auto relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5 rounded-lg blur-3xl scale-110" />
                  
                  {/* Circular background */}
                  <div className="relative w-full h-full rounded-lg bg-gradient-to-br from-primary/20 to-transparent border-2 border-primary/30 flex items-center justify-center">
                    {/* Inner circle with hero images crossfade */}
                    <div className="w-full h-full rounded-lg bg-card border border-border flex items-center justify-center shadow-xl overflow-hidden">
                      <div className="relative w-full h-full">
                        {heroImages.map((src, idx) => (
                          <img
                            key={src}
                            src={src}
                            alt={`Hero ${idx + 1}`}
                            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${heroIndex === idx ? 'opacity-100' : 'opacity-0'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Optional caption */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                      <p className="text-sm md:text-base font-semibold text-foreground">{t('features.quality')}</p>
                    </div>
                  </div>

                  {/* Floating badges */}
                  {/* Floating badges distributed on image */}
                  <div className="absolute top-4 right-4 bg-card rounded-lg p-3 shadow-lg border border-border animate-float">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-xs font-medium">{t('features.daysDelivery')}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-card rounded-lg p-3 shadow-lg border border-border animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium">{t('features.safePayment')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us + Counters Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-start ${lang === 'ar' ? 'text-right' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold">{t('about.title')}</h2>
              <p className="text-muted-foreground">{t('about.desc1')}</p>
              <p className="text-muted-foreground">{t('about.desc2')}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-border bg-card text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-primary">{employeesCount}+ </div>
                <div className="mt-2 text-sm text-muted-foreground">{t('about.employees')}</div>
                <div className="text-xs text-muted-foreground">{t('about.inCompany')}</div>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-primary">{customersCount}+ </div>
                <div className="mt-2 text-sm text-muted-foreground">{t('about.customers')}</div>
                <div className="text-xs text-muted-foreground">{t('about.forCompany')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values vs Vision/Mission Interactive Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          <div className={`flex items-center justify-center gap-4 mb-8 ${lang === 'ar' ? 'flex-row-reverse' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <button
              onClick={() => setActiveTab('values')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors duration-300 ${
                activeTab === 'values' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground bg-card'
              }`}
            >
              <Heart className={`h-4 w-4 ${activeTab === 'values' ? 'text-primary' : 'text-muted-foreground'}`} />
              {t('vision.tabValues')}
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors duration-300 ${
                activeTab === 'vision' ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground bg-card'
              }`}
            >
              <Target className={`h-4 w-4 ${activeTab === 'vision' ? 'text-primary' : 'text-muted-foreground'}`} />
              {t('vision.tabVisionMission')}
            </button>
          </div>

          {/* Timeline layout with center vertical line and dots */}
          {(() => {
            const valuesItems = [
              t('vision.valuesContent1'),
              t('vision.valuesContent2'),
              t('vision.valuesContent3'),
              t('vision.valuesContent4'),
            ].filter((s) => !!s);
            const visionItems = [
              t('vision.visionContent1'),
              t('vision.visionContent2'),
              t('vision.visionContent3'),
              t('vision.visionContent4'),
            ].filter((s) => !!s);
            const items = activeTab === 'values' ? valuesItems : visionItems;
            const title = activeTab === 'values' ? t('vision.valuesTitle') : t('vision.visionTitle');
            const subtitle = activeTab === 'vision' ? t('vision.visionSubtitle') : '';

            return (
              <div className="relative py-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="text-center mb-6">
                  <h3 className="text-lg md:text-2xl font-bold text-foreground">{title}</h3>
                  {subtitle && <p className="mt-1 text-xs md:text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {items.map((text, i) => {
                    const placeRight = i % 2 === 0; // 1st & 3rd right, 2nd & 4th left
                    return (
                      <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        {placeRight ? (
                          <>
                            <div className={`col-start-3 ${lang === 'ar' ? 'text-right' : ''}`}>
                              <div className="p-3 rounded-lg bg-card border border-border text-sm md:text-base">{text}</div>
                            </div>
                            <div className="relative col-start-2 h-full">
                              <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border border-background" />
                            </div>
                            <div className="col-start-1" />
                          </>
                        ) : (
                          <>
                            <div className="col-start-1">
                              <div className="p-3 rounded-lg bg-card border border-border text-sm md:text-base">{text}</div>
                            </div>
                            <div className="relative col-start-2 h-full">
                              <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border border-background" />
                            </div>
                            <div className="col-start-3" />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </section>
    </>
  );
};

export default HeroSection;
