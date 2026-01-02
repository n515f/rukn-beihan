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
  getCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  Category,
} from "@/services/categoriesService";

const AdmincategoriesPage = () => {
  const { t, lang } = useLang();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
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
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(false);
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error(t("common.error"));
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
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

  const openEditDialog = (cat: Category) => {
    setEditing(cat);
    setForm({
      name_en: cat.name,
      name_ar: cat.nameAr,
      slug: cat.slug,
      active: cat.active,
      sort_order: cat.sortOrder,
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
        await adminUpdateCategory({
          id: editing.idNumber,
          name_en: form.name_en,
          name_ar: form.name_ar,
          slug: form.slug,
          active: form.active,
          sort_order: form.sort_order,
        });
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editing.id
              ? {
                  ...c,
                  name: form.name_en,
                  nameAr: form.name_ar,
                  slug: form.slug,
                  active: form.active,
                  sortOrder: form.sort_order,
                }
              : c
          )
        );
        toast.success(t("admin.categoryUpdated"));
      } else {
        const res = await adminCreateCategory({
          name_en: form.name_en,
          name_ar: form.name_ar,
          slug: form.slug,
          active: form.active,
          sort_order: form.sort_order,
        });
        setCategories((prev) => [
          {
            id: res.categoryId,
            idNumber: Number(res.categoryId),
            name: form.name_en,
            nameAr: form.name_ar,
            slug: form.slug,
            active: form.active,
            sortOrder: form.sort_order,
            count: 0,
          },
          ...prev,
        ]);
        toast.success(t("admin.categoryAdded"));
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (e) {
      console.error(e);
      toast.error(t("common.error"));
    }
  };

  const handleDelete = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await adminDeleteCategory(categoryToDelete.idNumber);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      toast.success(t("admin.categoryDeleted"));
    } catch (e) {
      console.error(e);
      toast.error(t("common.error"));
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t("admin.categories")}
        breadcrumbs={[{ label: t("admin.categories") }]}
        actions={
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 me-2" />
            {t("admin.addCategory")}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">{t("common.loading")}</div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {t("admin.noCategories")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>{t("admin.categoryNameEn")}</TableHead>
                    <TableHead>{t("admin.categoryNameAr")}</TableHead>
                    <TableHead>{t("admin.slug")}</TableHead>
                    <TableHead>{t("admin.sortOrder")}</TableHead>
                    <TableHead>{t("products.category")}</TableHead>
                    <TableHead>{t("admin.status")}</TableHead>
                    <TableHead className="text-end">{t("admin.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-mono text-xs">#{cat.id}</TableCell>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell dir="rtl">{cat.nameAr}</TableCell>
                      <TableCell className="font-mono text-xs">{cat.slug}</TableCell>
                      <TableCell>{cat.sortOrder}</TableCell>
                      <TableCell>{cat.count}</TableCell>
                      <TableCell>
                        <Badge variant={cat.active ? "default" : "destructive"}>
                          {cat.active ? t("admin.active") : t("admin.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(cat)}
                            aria-label={t("common.edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cat)}
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
              {editing ? t("admin.editCategory") : t("admin.addCategory")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("admin.categoryNameEn")}</Label>
                <Input
                  value={form.name_en}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label dir="rtl">{t("admin.categoryNameAr")}</Label>
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
                placeholder="battery-12v"
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
              {editing ? t("common.edit") : t("admin.addCategory")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.deleteCategory")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.deleteCategoryConfirm")} "{categoryToDelete?.name}"?
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

export default AdmincategoriesPage;
