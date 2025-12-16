import ProductCard from './ProductCard';
import { Product } from '@/services/productsService';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No products found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
  key={product.id}
  id={product.id}
  name={product.name}
  nameAr={product.nameAr}   // ✅ جديد
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

      ))}
    </div>
  );
};

export default ProductGrid;
