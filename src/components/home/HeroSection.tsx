import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Truck, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/context/LangContext';

const HeroSection = () => {
  const { t, lang } = useLang();

  const handleWhatsAppClick = () => {
    // TODO: Replace with real WhatsApp number
    window.open('https://wa.me/966534523425', '_blank');
  };

  return (
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
              <p className="text-sm text-muted-foreground">
                📞 {t('common.phone')} | 🕐 {t('common.hours')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                📍 {t('common.serviceAreas')}
              </p>
            </div>
          </div>

          {/* Visual side */}
          <div className={`relative ${lang === 'ar' ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="relative animate-slide-up">
              {/* Main decorative element */}
              <div className="aspect-square max-w-md mx-auto relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5 rounded-full blur-3xl scale-110" />
                
                {/* Circular background */}
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-transparent border-2 border-primary/30 flex items-center justify-center">
                  {/* Inner circle with battery icon representation */}
                  <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-br from-card to-muted border border-border flex items-center justify-center shadow-xl">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-32 md:w-32 md:h-40 mx-auto relative">
                        {/* Battery shape */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary to-primary/80 shadow-gold">
                          {/* Battery terminal */}
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-primary rounded-t-md" />
                          {/* Battery levels */}
                          <div className="absolute inset-2 space-y-1.5 flex flex-col justify-end pb-2">
                            <div className="h-1/5 bg-primary-foreground/90 rounded" />
                            <div className="h-1/5 bg-primary-foreground/90 rounded" />
                            <div className="h-1/5 bg-primary-foreground/90 rounded" />
                          </div>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-foreground">{t('features.quality')}</p>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 md:top-4 md:right-4 bg-card rounded-lg p-3 shadow-lg border border-border animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-xs font-medium">{t('features.daysDelivery')}</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 md:bottom-4 md:left-4 bg-card rounded-lg p-3 shadow-lg border border-border animate-float" style={{ animationDelay: '0.5s' }}>
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
  );
};

export default HeroSection;
