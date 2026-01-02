import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

import { useLang } from "@/context/LangContext";
import { toast } from "sonner";

import {
  Banner,
  getBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  toggleBannerStatus,
} from "@/services/adsService";

type FormState = {
  id?: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  link: string;
  active: boolean;

  // للعرض الحالي
  currentImageUrl?: string;

  // رفع صورة جديدة
  imageFile?: File | null;
};

const emptyForm: FormState = {
  title_en: "",
  title_ar: "",
  description_en: "",
  description_ar: "",
  link: "",
  active: true,
  currentImageUrl: "",
  imageFile: null,
};

export default function AdminBannersPage() {
  const { t, lang } = useLang();

  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Dialog (Add/Edit)
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState<FormState>({ ...emptyForm });

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Image preview (from File)
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error(t("common.error"));
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openAdd = () => {
    setIsEditMode(false);
    setForm({ ...emptyForm });
    setPreviewUrl("");
    setFormOpen(true);
  };

  const openEdit = (b: Banner) => {
    setIsEditMode(true);
    setForm({
      id: b.id,
      title_en: b.title ?? "",
      title_ar: b.titleAr ?? "",
      description_en: b.description ?? "",
      description_ar: b.descriptionAr ?? "",
      link: b.link ?? "",
      active: !!b.active,
      currentImageUrl: b.image ?? "",
      imageFile: null,
    });
    setPreviewUrl("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSaving(false);
    setIsEditMode(false);
    setForm({ ...emptyForm });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
  };

  const onPickFile = (file: File | null) => {
    // revoke old
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (!file) {
      setForm((p) => ({ ...p, imageFile: null }));
      setPreviewUrl("");
      return;
    }

    setForm((p) => ({ ...p, imageFile: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const canSubmit = useMemo(() => {
    if (!form.title_en.trim()) return false;
    if (!form.title_ar.trim()) return false;

    // في الإضافة لازم صورة
    if (!isEditMode && !form.imageFile) return false;

    return true;
  }, [form.title_en, form.title_ar, form.imageFile, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    try {
      if (!isEditMode) {
        // CREATE (image required)
        await adminCreateBanner({
          title_en: form.title_en.trim(),
          title_ar: form.title_ar.trim(),
          description_en: form.description_en ?? "",
          description_ar: form.description_ar ?? "",
          link: form.link ?? "",
          active: form.active,
          imageFile: form.imageFile!, // guaranteed by canSubmit
        });

        toast.success(t("admin.bannerAdded") ?? "Banner added");
      } else {
        // UPDATE (image optional)
        if (!form.id) throw new Error("Missing banner id");

        await adminUpdateBanner({
          id: form.id,
          title_en: form.title_en.trim(),
          title_ar: form.title_ar.trim(),
          description_en: form.description_en ?? "",
          description_ar: form.description_ar ?? "",
          link: form.link ?? "",
          active: form.active,
          imageFile: form.imageFile ?? null,
        });

        toast.success(t("admin.bannerUpdated") ?? "Banner updated");
      }

      await fetchAll();
      closeForm();
    } catch (e) {
      console.error(e);
      toast.error(t("admin.saveFailed") ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (b: Banner) => {
    const next = !b.active;
    try {
      await toggleBannerStatus(b.id, next);

      setBanners((prev) =>
        prev.map((x) => (x.id === b.id ? { ...x, active: next } : x))
      );

      toast.success(t("admin.statusUpdated"));
    } catch (e) {
      console.error(e);
      toast.error(t("admin.updateFailed") ?? "Update failed");
    }
  };

  const askDelete = (b: Banner) => {
    setBannerToDelete(b);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    setDeleting(true);
    try {
      await adminDeleteBanner(bannerToDelete.id);
      toast.success(t("admin.deleted") ?? "Deleted");
      setBanners((prev) => prev.filter((x) => x.id !== bannerToDelete.id));
      setDeleteOpen(false);
      setBannerToDelete(null);
    } catch (e) {
      console.error(e);
      toast.error(t("admin.deleteFailed") ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const titleLabel = t("admin.banners") ?? "Banners";
  const addLabel = t("admin.addBanner") ?? "Add Banner";

  return (
    <AdminLayout>
      <AdminPageHeader
        title={titleLabel}
        breadcrumbs={[{ label: titleLabel }]}
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 me-2" />
            {addLabel}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{titleLabel}</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : banners.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              {t("admin.noBanners") ?? "No banners"}
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((b) => (
                <Card key={String(b.id)}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={b.image}
                        alt={lang === "ar" ? b.titleAr : b.title}
                        className="h-20 w-28 object-cover rounded-md border"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {lang === "ar" ? b.titleAr : b.title}
                          </h3>
                          <Badge variant={b.active ? "default" : "secondary"}>
                            {b.active
                              ? t("admin.active") ?? "Active"
                              : t("admin.inactive") ?? "Inactive"}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                          {lang === "ar" ? b.descriptionAr : b.description}
                        </p>

                        {b.link && b.link !== "#" && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Link: {b.link}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {t("admin.status") ?? "Status"}
                          </span>
                          <Switch
                            checked={b.active}
                            onCheckedChange={() => handleToggleActive(b)}
                            aria-label={t("admin.status") ?? "Status"}
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEdit(b)}
                          aria-label={t("common.edit") ?? "Edit"}
                          title={t("common.edit") ?? "Edit"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => askDelete(b)}
                          aria-label={t("common.delete") ?? "Delete"}
                          title={t("common.delete") ?? "Delete"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(v) => (!v ? closeForm() : setFormOpen(true))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? t("admin.editBanner") ?? "Edit Banner"
                : t("admin.addBanner") ?? "Add Banner"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title_en">{t("admin.titleEn") ?? "Title (EN)"}</Label>
                <Input
                  id="title_en"
                  value={form.title_en}
                  onChange={(e) => setForm((p) => ({ ...p, title_en: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_ar">{t("admin.titleAr") ?? "Title (AR)"}</Label>
                <Input
                  id="title_ar"
                  dir="rtl"
                  value={form.title_ar}
                  onChange={(e) => setForm((p) => ({ ...p, title_ar: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="desc_en">
                  {t("admin.descriptionEn") ?? "Description (EN)"}
                </Label>
                <Textarea
                  id="desc_en"
                  rows={3}
                  value={form.description_en}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description_en: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc_ar">
                  {t("admin.descriptionAr") ?? "Description (AR)"}
                </Label>
                <Textarea
                  id="desc_ar"
                  dir="rtl"
                  rows={3}
                  value={form.description_ar}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description_ar: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="link">{t("admin.link") ?? "Link"}</Label>
                <Input
                  id="link"
                  placeholder="https://example.com"
                  value={form.link}
                  onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border rounded-md px-3 py-2">
                <div>
                  <div className="text-sm font-medium">
                    {t("admin.active") ?? "Active"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("admin.status") ?? "Status"}
                  </div>
                </div>
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, active: !!v }))}
                  aria-label={t("admin.status") ?? "Status"}
                />
              </div>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label htmlFor="image">
                {t("admin.image") ?? "Image"}
                {!isEditMode && <span className="text-destructive"> *</span>}
              </Label>

              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />

              <div className="flex gap-4 items-center">
                <div className="h-20 w-28 rounded-md border overflow-hidden bg-muted">
                  <img
                    src={previewUrl || form.currentImageUrl || "/placeholder.svg"}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  {isEditMode
                    ? (t("admin.imageOptionalOnEdit") ??
                        "On edit: you can leave image empty to keep current image.")
                    : (t("admin.imageRequiredOnCreate") ??
                        "On create: image is required.")}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
                {t("common.cancel") ?? "Cancel"}
              </Button>
              <Button type="submit" disabled={!canSubmit || saving}>
                {saving ? (t("common.loading") ?? "Saving...") : (t("common.save") ?? "Save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.deleteBanner") ?? "Delete banner"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(t("admin.deleteBannerConfirm") ?? "Are you sure you want to delete")}{" "}
              "{lang === "ar" ? bannerToDelete?.titleAr : bannerToDelete?.title}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("common.cancel") ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground"
            >
              {deleting ? (t("common.loading") ?? "Deleting...") : (t("common.delete") ?? "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
