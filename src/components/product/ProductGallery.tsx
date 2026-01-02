import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  // اختياري: لعرض وسم نفاد المخزون
  stock?: number;
  active?: boolean;
}

const ProductGallery = ({ images, productName, stock, active }: ProductGalleryProps) => {
  const safeImages = useMemo(() => {
    const list = (images ?? []).filter(Boolean);
    return list.length > 0 ? list : ['/placeholder-battery.jpg'];
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // إذا تغيّرت الصور (منتج جديد) رجّع المؤشر للصفر
    setCurrentIndex(0);
  }, [safeImages.join('|')]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const outOfStock = (active === false) || (typeof stock === 'number' && stock <= 0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={safeImages[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder-battery.jpg';
          }}
          className="h-full w-full object-cover"
        />

        {outOfStock && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded bg-destructive text-destructive-foreground text-xs">
            غير متوفر
          </div>
        )}

        {safeImages.length > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {safeImages.map((img, index) => (
            <button
              type="button"
              key={`${img}-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`aspect-square overflow-hidden rounded-md border-2 ${
                index === currentIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${index + 1}`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/placeholder-battery.jpg';
                }}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
