import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLang } from '@/context/LangContext';
import { toast } from 'sonner';

import {
  getProductById,
  adminCreateProduct,
  adminUpdateProduct,
  Product,
} from '@/services/productsService';

import { getCategories, Category } from '@/services/categoriesService';

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

type FormState = {
  nameEn: string;
  nameAr: string;
  brand: string;
  categoryId: number | null;
  price: string;
  stock: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  bestSeller: boolean; // مؤقت (ليست في DB الآن)
  isNew: boolean; // مؤقت (ليست في DB الآن)
  isActive: boolean;
};

const AdminProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();

  const isEditMode = Boolean(id && id !== 'new');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormState>({
    nameEn: '',
    nameAr: '',
    brand: '',
    categoryId: null,
    price: '',
    stock: '',
    descriptionEn: '',
    descriptionAr: '',
    image: '/placeholder.svg',
    bestSeller: false,
    isNew: false,
    isActive: true,
  });

  const categoryLabel = useMemo(() => {
    return (c: Category) => (lang === 'ar' ? c.nameAr : c.name);
  }, [lang]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const cats = await getCategories(false); // جلب الكل (active وغير active) للأدمن
        if (!mounted) return;
        setCategories(cats);

        if (isEditMode && id) {
          const product = await getProductById(id);
          if (!mounted) return;

          if (product) {
            // ملاحظة: عندك في Product داخل productsService لازم يكون فيه categoryId number
            setFormData({
              nameEn: product.name ?? '',
              nameAr: product.nameAr ?? product.name ?? '',
              brand: product.brand ?? '',
              categoryId: product.categoryId ?? null,
              price: String(product.price ?? ''),
              stock: String(product.stock ?? ''),
              descriptionEn: product.description ?? '',
              descriptionAr: product.descriptionAr ?? product.description ?? '',
              image: product.image ?? '/placeholder.svg',
              bestSeller: Boolean(product.bestSeller),
              isNew: Boolean(product.isNew),
              isActive: Boolean(product.active ?? true),
            });
          }
        }
      } catch (error) {
        console.error(error);
        toast.error(t('common.error'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id, isEditMode, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brand) {
      toast.error(t('admin.selectBrand'));
      return;
    }
    if (!formData.categoryId) {
      toast.error(t('admin.selectCategory'));
      return;
    }

    const priceNum = Number(formData.price);
    const stockNum = Number(formData.stock);

    if (!Number.isFinite(priceNum)) {
      toast.error(t('admin.invalidPrice'));
      return;
    }
    if (!Number.isFinite(stockNum)) {
      toast.error(t('admin.invalidStock'));
      return;
    }

    try {
      if (isEditMode && id) {
        await adminUpdateProduct({
          id: Number(id),
          name_en: formData.nameEn,
          name_ar: formData.nameAr,
          description_en: formData.descriptionEn,
          description_ar: formData.descriptionAr,
          brand: formData.brand,
          category_id: formData.categoryId,
          price: priceNum,
          stock: stockNum,
          image_url: formData.image,
          active: formData.isActive,
        });

        toast.success(t('admin.productUpdated'));
      } else {
        await adminCreateProduct({
          name_en: formData.nameEn,
          name_ar: formData.nameAr,
          description_en: formData.descriptionEn,
          description_ar: formData.descriptionAr,
          brand: formData.brand,
          category_id: formData.categoryId,
          price: priceNum,
          stock: stockNum,
          image_url: formData.image,
          active: formData.isActive,
        });

        toast.success(t('admin.productAdded'));
      }

      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error(t('common.error'));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>{t('common.loading')}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminPageHeader
        title={isEditMode ? t('admin.editProduct') : t('admin.addProduct')}
        breadcrumbs={[
          { label: t('admin.products'), href: '/admin/products' },
          { label: isEditMode ? t('admin.editProduct') : t('admin.addProduct') },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="h-4 w-4 me-2" />
            {t('admin.backToProducts')}
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.basicInfo')}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">{t('admin.productNameEn')}</Label>
                    <Input
                      id="nameEn"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nameAr">{t('admin.productNameAr')}</Label>
                    <Input
                      id="nameAr"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      dir="rtl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">{t('admin.brand')}</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value) => setFormData({ ...formData, brand: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.selectBrand')} />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">{t('products.category')}</Label>
                    <Select
                      value={formData.categoryId ? String(formData.categoryId) : ''}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoryId: Number(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {categoryLabel(cat)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">{t('products.price')}</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">{t('products.stock')}</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">{t('admin.descriptionEn')}</Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">{t('admin.descriptionAr')}</Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">{t('admin.active')}</Label>
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                  />
                </div>

                {/* هذه حقول UI مؤقتة (ليست في DB حالياً) */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="bestSeller">{t('productDetail.bestSeller')}</Label>
                  <Switch
                    id="bestSeller"
                    checked={formData.bestSeller}
                    onCheckedChange={(v) => setFormData({ ...formData, bestSeller: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isNew">{t('productDetail.new')}</Label>
                  <Switch
                    id="isNew"
                    checked={formData.isNew}
                    onCheckedChange={(v) => setFormData({ ...formData, isNew: v })}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full">
              {t('admin.save')}
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductEditPage;
