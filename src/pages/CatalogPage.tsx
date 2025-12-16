import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductGrid from '@/components/product/ProductGrid';
import { getProducts, Product } from '@/services/productsService';
import { getCategories, Category } from '@/services/categoriesService';
import { useLang } from '@/context/LangContext';

const CatalogPage = () => {
  const { t, lang } = useLang();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('bestSelling');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(true),
        ]);
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategoriesState(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    const search = searchParams.get('search');
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(s) ||
        (p.nameAr ?? '').toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s)
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    // Category filter (NOW uses categoryId)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.categoryId));
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'bestSelling':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'priceLowHigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighLow':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedBrands, selectedCategories, priceRange, sortBy, searchParams]);

  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand))), [products]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('products.allProducts')}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('products.filterBy')}
              </h3>

              {/* Brands */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">{t('products.brands')}</h4>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedBrands([...selectedBrands, brand]);
                          else setSelectedBrands(selectedBrands.filter(b => b !== brand));
                        }}
                      />
                      <Label htmlFor={brand} className="text-sm cursor-pointer">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">{t('products.category')}</h4>
                <div className="space-y-2">
                  {categories.map(category => {
                    const label = lang === 'ar' ? category.nameAr : category.name;
                    return (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${category.id}`}
                          checked={selectedCategories.includes(category.idNumber)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedCategories([...selectedCategories, category.idNumber]);
                            else setSelectedCategories(selectedCategories.filter(c => c !== category.idNumber));
                          }}
                        />
                        <Label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer">
                          {label} ({category.count})
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">{t('products.priceRange')}</h4>
                <Slider
                  min={0}
                  max={500}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedBrands([]);
                  setSelectedCategories([]);
                  setPriceRange([0, 500]);
                }}
              >
                {t('catalog.clearFilters')}
              </Button>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {/* Sort & Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              {t('catalog.showing')} {filteredProducts.length} {t('catalog.productsCount')}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bestSelling">{t('products.sortBestSelling')}</SelectItem>
                <SelectItem value="newest">{t('products.sortNewest')}</SelectItem>
                <SelectItem value="priceLowHigh">{t('products.sortPriceLowHigh')}</SelectItem>
                <SelectItem value="priceHighLow">{t('products.sortPriceHighLow')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-muted-foreground">{t('common.loading')}</div>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
