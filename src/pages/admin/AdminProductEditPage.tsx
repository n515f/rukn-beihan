import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import {
  adminCreateProduct,
  adminUpdateProduct,
  getAdminProductById,
} from "@/services/productsService";
import { Category, getCategories } from "@/services/categoriesService";
import { Brand, getBrands } from "@/services/brandsService";
import { useLang } from "@/context/LangContext";

type FormState = {
  nameEn: string;
  nameAr: string;
  brand: string;
  categoryId: number | null;
  price: string;
  stock: string;
  descriptionEn: string;
  descriptionAr: string;
  isActive: boolean;

  // image
  imageUrl: string; // للعرض
  imageFile: File | null; // للرفع
};

const AdminProductEditPage = () => {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = useMemo(() => !!id && id !== "new", [id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [form, setForm] = useState<FormState>({
    nameEn: "",
    nameAr: "",
    brand: "",
    categoryId: null,
    price: "",
    stock: "0",
    descriptionEn: "",
    descriptionAr: "",
    isActive: true,
    imageUrl: "/placeholder-battery.jpg",
    imageFile: null,
  });

  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        const cats = await getCategories(false);
        const brs = await getBrands(false);
        if (!mounted) return;
        setCategories(cats);
        setBrands(brs);

        if (isEditMode && id) {
          const p = await getAdminProductById(id);
          if (!mounted) return;

          if (p) {
            setForm({
              nameEn: p.name ?? "",
              nameAr: p.nameAr ?? p.name ?? "",
              brand: p.brand ?? "",
              categoryId: Number(p.categoryId) || null,
              price: String(p.price ?? ""),
              stock: String(p.stock ?? "0"),
              descriptionEn: p.description ?? "",
              descriptionAr: p.descriptionAr ?? "",
              isActive: Boolean(p.active ?? true),
              imageUrl: p.image ?? "/placeholder-battery.jpg",
              imageFile: null,
            });
            setImagePreview(p.image ?? "");
          }
        }
      } catch (e) {
        console.error(e);
        toast.error(t("common.error"));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [id, isEditMode, t]);

  const onPickImage = (file: File | null) => {
    setForm((prev) => ({ ...prev, imageFile: file }));
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async () => {
    if (!form.nameEn.trim() || !form.nameAr.trim() || !form.brand.trim()) {
      toast.error(t("common.error"));
      return;
    }
    if (!form.categoryId) {
      toast.error(lang === "ar" ? "اختر التصنيف" : "Select category");
      return;
    }

    const priceNum = Number(form.price);
    const stockNum = Number(form.stock);
    if (!Number.isFinite(priceNum)) {
      toast.error(lang === "ar" ? "السعر غير صحيح" : "Invalid price");
      return;
    }
    if (!Number.isFinite(stockNum)) {
      toast.error(lang === "ar" ? "المخزون غير صحيح" : "Invalid stock");
      return;
    }

    if (!isEditMode && !form.imageFile) {
      toast.error(lang === "ar" ? "الصورة مطلوبة عند الإضافة" : "Image is required for new product");
      return;
    }

    setSaving(true);
    try {
      if (isEditMode && id) {
        await adminUpdateProduct({
          id,
          name_en: form.nameEn,
          name_ar: form.nameAr,
          description_en: form.descriptionEn,
          description_ar: form.descriptionAr,
          brand: form.brand,
          category_id: form.categoryId,
          price: priceNum,
          stock: stockNum,
          active: form.isActive,
          imageFile: form.imageFile, // optional
        });
        toast.success(lang === "ar" ? "تم تحديث المنتج" : "Product updated");
      } else {
        const res = await adminCreateProduct({
          name_en: form.nameEn,
          name_ar: form.nameAr,
          description_en: form.descriptionEn,
          description_ar: form.descriptionAr,
          brand: form.brand,
          category_id: form.categoryId,
          price: priceNum,
          stock: stockNum,
          active: form.isActive,
          imageFile: form.imageFile!, // required
        });

        toast.success(lang === "ar" ? "تمت إضافة المنتج" : "Product created");
        navigate(`/admin/products/${res.productId}`);
      }
    } catch (e) {
      console.error(e);
      toast.error(lang === "ar" ? "فشل الحفظ" : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const categoryLabel = (c: Category) => (lang === "ar" ? c.nameAr : c.name);
  const brandLabel = (b: Brand) => (lang === "ar" ? b.nameAr : b.name);

  return (
    <AdminLayout>
      <AdminPageHeader
        title={isEditMode ? t("admin.editProduct") : t("admin.addProduct")}
        breadcrumbs={[
          { label: t("admin.products"), href: "/admin/products" },
          { label: isEditMode ? t("common.edit") : t("common.add") },
        ]}
      />

      {loading ? (
        <div className="p-6 text-center">{t("common.loading")}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? t("admin.editProduct") : t("admin.addProduct")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="product-image">{lang === "ar" ? "صورة المنتج" : "Product Image"}</Label>

              <div className="flex items-center gap-4">
                <img
                  src={imagePreview || form.imageUrl}
                  alt={form.nameEn || "product"}
                  className="h-20 w-20 rounded object-cover border"
                />

                <div className="space-y-2">
                  <Input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                  />
                  <div className="text-xs text-muted-foreground">
                    {lang === "ar"
                      ? "الصيغ المدعومة: jpg, png, webp, gif (حد أقصى 5MB)"
                      : "Allowed: jpg, png, webp, gif (max 5MB)"}
                  </div>
                </div>
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name-en">{lang === "ar" ? "الاسم (EN)" : "Name (EN)"}</Label>
                <Input
                  id="name-en"
                  value={form.nameEn}
                  onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-ar">{lang === "ar" ? "الاسم (AR)" : "Name (AR)"}</Label>
                <Input
                  id="name-ar"
                  value={form.nameAr}
                  onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
                />
              </div>
            </div>

            {/* Brand + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">{t("admin.brand")}</Label>
                <Select
                  value={form.brand}
                  onValueChange={(v) => setForm((p) => ({ ...p, brand: v }))}
                >
                  <SelectTrigger id="brand" aria-label={t("admin.selectBrand")}>
                    <SelectValue placeholder={t("admin.selectBrand")} />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.name}>
                        {brandLabel(b)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-trigger">{t("products.category")}</Label>
                <Select
                  value={form.categoryId ? String(form.categoryId) : ""}
                  onValueChange={(v) => setForm((p) => ({ ...p, categoryId: Number(v) }))}
                >
                  <SelectTrigger
                    id="category-trigger"
                    aria-label={lang === "ar" ? "اختر التصنيف" : "Select category"}
                  >
                    <SelectValue placeholder={lang === "ar" ? "اختر التصنيف" : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.idNumber)}>
                        {categoryLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t("admin.price")}</Label>
                <Input
                  id="price"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">{t("admin.stock")}</Label>
                <Input
                  id="stock"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desc-en">{lang === "ar" ? "الوصف (EN)" : "Description (EN)"}</Label>
                <Textarea
                  id="desc-en"
                  value={form.descriptionEn}
                  onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc-ar">{lang === "ar" ? "الوصف (AR)" : "Description (AR)"}</Label>
                <Textarea
                  id="desc-ar"
                  value={form.descriptionAr}
                  onChange={(e) => setForm((p) => ({ ...p, descriptionAr: e.target.value }))}
                />
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <div className="font-medium">{t("admin.status")}</div>
                <div className="text-sm text-muted-foreground">
                  {form.isActive ? t("admin.active") : t("admin.inactive")}
                </div>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                aria-label={t("admin.status")}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => navigate("/admin/products")}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? t("common.loading") : t("common.save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default AdminProductEditPage;
