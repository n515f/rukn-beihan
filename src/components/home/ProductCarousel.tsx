import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/services/productsService';
import { useLang } from '@/context/LangContext';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductCarousel = ({ title, subtitle, products, viewAllLink = '/catalog' }: ProductCarouselProps) => {
  const { t, lang } = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount 
        : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
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
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link to={viewAllLink}>
                {t('catalog.viewAll')}
                <ArrowRight className={`h-4 w-4 ${lang === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Products Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[240px] md:w-[280px] snap-start">
              <ProductCard
                id={product.id}
                name={product.name}
                brand={product.brand}
                price={product.price}
                oldPrice={product.oldPrice}
                image={product.image}
                rating={product.rating}
                reviews={product.reviews}
                stock={product.stock}
                bestSeller={product.bestSeller}
                isNew={product.isNew}
              />
            </div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="text-center mt-6 sm:hidden">
          <Button asChild variant="outline">
            <Link to={viewAllLink}>
              {t('catalog.viewAll')}
              <ArrowRight className={`h-4 w-4 ${lang === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
