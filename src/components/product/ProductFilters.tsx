import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useLang } from '@/context/LangContext';
import { getCategories, Category } from '@/services/categoriesService';
import { getProducts } from '@/services/productsService';

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  brands: string[];
  categories: number[]; // category_id
  priceRange: [number, number];
}

const ProductFilters = ({ onFilterChange }: ProductFiltersProps) => {
  const { t, lang } = useLang();

  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  useEffect(() => {
    const load = async () => {
      try {
        const [products, cats] = await Promise.all([
          getProducts(),
          getCategories(true),
        ]);

        setBrands(Array.from(new Set(products.map(p => p.brand))));
        setCategories(cats);

        // Sync initial state to parent
        onFilterChange({ brands: [], categories: [], priceRange: [0, 500] });
      } catch (e) {
        console.error('Failed to load filters:', e);
        setBrands([]);
        setCategories([]);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];

    setSelectedBrands(newBrands);
    onFilterChange({ brands: newBrands, categories: selectedCategories, priceRange });
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(c => c !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    onFilterChange({ brands: selectedBrands, categories: newCategories, priceRange });
  };

  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    onFilterChange({ brands: selectedBrands, categories: selectedCategories, priceRange: newRange });
  };

  const categoryLabel = useMemo(() => {
    return (c: Category) => (lang === 'ar' ? c.nameAr : c.name);
  }, [lang]);

  return (
    <div className="space-y-6">
      {/* Brands */}
      <div>
        <Label className="text-base font-semibold mb-3 block">{t('products.brands')}</Label>
        <div className="space-y-2">
          {brands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => handleBrandToggle(brand)}
              />
              <label htmlFor={brand} className="text-sm cursor-pointer">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label className="text-base font-semibold mb-3 block">{t('products.category')}</Label>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.idNumber)}
                onCheckedChange={() => handleCategoryToggle(category.idNumber)}
              />
              <label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer">
                {categoryLabel(category)} ({category.count})
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-base font-semibold mb-3 block">{t('products.priceRange')}</Label>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            min={0}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
