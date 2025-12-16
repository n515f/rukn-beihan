import { useEffect, useState } from 'react';
import { Truck, Shield, CheckCircle } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import OffersSection from '@/components/home/OffersSection';
import ProductCarousel from '@/components/home/ProductCarousel';
import BrandMarquee from '@/components/home/BrandMarquee';
import { getBestSellers, getNewProducts, Product } from '@/services/productsService';
import { useLang } from '@/context/LangContext';

const HomePage = () => {
  const { t } = useLang();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bestSellersData, newProductsData] = await Promise.all([
          getBestSellers(),
          getNewProducts(),
        ]);
        setBestSellers(bestSellersData);
        setNewProducts(newProductsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Premium Hero Section */}
      <HeroSection />

      {/* Brand Marquee */}
      <BrandMarquee />

      {/* Special Offers Section */}
      <OffersSection />

      {/* Best Sellers Carousel */}
      {!loading && bestSellers.length > 0 && (
        <ProductCarousel
          title={t('products.bestSellers')}
          subtitle={t('catalog.mostPopular')}
          products={bestSellers}
        />
      )}

      {/* Limited Time Offers / New Products */}
      {!loading && newProducts.length > 0 && (
        <div className="bg-muted/30">
          <ProductCarousel
            title={t('products.limitedOffers')}
            products={newProducts}
          />
        </div>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.quality')}</h3>
              <p className="text-muted-foreground">
                {t('features.qualityDesc')}
              </p>
            </div>

            <div className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.delivery')}</h3>
              <p className="text-muted-foreground">
                {t('features.deliveryDesc')}
              </p>
            </div>

            <div className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('features.warranty')}</h3>
              <p className="text-muted-foreground">
                {t('features.warrantyDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
