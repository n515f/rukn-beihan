import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/context/LangContext";
import { toast } from "sonner";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  Brand,
} from "@/services/brandsService";

const AdminbrandsPage = () => {
  const { t } = useLang();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<{
    name_en: string;
    name_ar: string;
    slug: string;
    active: boolean;
    sort_order: number;
  }>({
    name_en: "",
    name_ar: "",
    slug: "",
    active: true,
    sort_order: 0,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrands(false);
        setBrands(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error(t("common.error"));
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [t]);

  const openNewDialog = () => {
    setEditing(null);
    setForm({
      name_en: "",
      name_ar: "",
      slug: "",
      active: true,
      sort_order: 0,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (b: Brand) => {
    setEditing(b);
    setForm({
      name_en: b.name,
      name_ar: b.nameAr,
      slug: b.slug,
      active: b.active,
      sort_order: b.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name_en.trim() || !form.name_ar.trim() || !form.slug.trim()) {
      toast.error(t("admin.requiredFields"));
      return;
    }
    try {
      if (editing) {
        await updateBrand(editing.id, {
          name_en: form.name_en,
          name_ar: form.name_ar,
          slug: form.slug,
          active: form.active,
          sort_order: form.sort_order,
        });
        setBrands((prev) =>
          prev.map((b) =>
            b.id === editing.id
              ? {
                  ...b,
                  name: form.name_en,
                  nameAr: form.name_ar,
                  slug: form.slug,
                  active: form.active,
                  sortOrder: form.sort_order,
                }
              : b
          )
        );
        toast.success(t("common.success"));
      } else {
        const brandId = await createBrand({
          name_en: form.name_en,
          name_ar: form.name_ar,
          slug: form.slug,
          active: form.active,
          sort_order: form.sort_order,
        });
        setBrands((prev) => [
          {
            id: brandId,
            name: form.name_en,
            nameAr: form.name_ar,
            slug: form.slug,
            active: form.active,
            sortOrder: form.sort_order,
            productCount: 0,
          },
          ...prev,
        ]);
        toast.success(t("common.success"));
      }
      setDialogOpen(false);
      setEditing(null);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDelete = (b: Brand) => {
    setBrandToDelete(b);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    try {
      await deleteBrand(brandToDelete.id);
      setBrands((prev) => prev.filter((b) => b.id !== brandToDelete.id));
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t("products.brands")}
        breadcrumbs={[{ label: t("products.brands") }]}
        actions={
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 me-2" />
            {t("products.brands")}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">{t("common.loading")}</div>
          ) : brands.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {t("common.noData")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>{t("admin.productNameEn")}</TableHead>
                    <TableHead>{t("admin.productNameAr")}</TableHead>
                    <TableHead>{t("admin.slug")}</TableHead>
                    <TableHead>{t("admin.sortOrder")}</TableHead>
                    <TableHead>{t("admin.products")}</TableHead>
                    <TableHead>{t("admin.status")}</TableHead>
                    <TableHead className="text-end">{t("admin.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">#{b.id}</TableCell>
                      <TableCell>{b.name}</TableCell>
                      <TableCell dir="rtl">{b.nameAr}</TableCell>
                      <TableCell className="font-mono text-xs">{b.slug}</TableCell>
                      <TableCell>{b.sortOrder}</TableCell>
                      <TableCell>{b.productCount}</TableCell>
                      <TableCell>
                        <Badge variant={b.active ? "default" : "destructive"}>
                          {b.active ? t("admin.active") : t("admin.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(b)}
                            aria-label={t("common.edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(b)}
                            aria-label={t("common.delete")}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t("common.edit") : t("common.save")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("admin.productNameEn")}</Label>
                <Input
                  value={form.name_en}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label dir="rtl">{t("admin.productNameAr")}</Label>
                <Input
                  value={form.name_ar}
                  onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("admin.slug")}</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="acme-batteries"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("admin.active")}</Label>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.sortOrder")}</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: Number(e.target.value || 0) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit}>
              {editing ? t("common.edit") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.delete")} "{brandToDelete?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminbrandsPage;
