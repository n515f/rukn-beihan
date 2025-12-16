import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLang } from '@/context/LangContext';
import { getBanners, Banner, toggleBannerStatus } from '@/services/adsService';
import { toast } from 'sonner';

// Local state for banner CRUD
let localBanners: Banner[] = [];

const AdminBannersPage = () => {
  const { t, lang } = useLang();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    image: '/placeholder.svg',
    link: '/catalog',
    active: true,
  });

  useEffect(() => {
    const fetchBanners = async () => {
      if (localBanners.length === 0) {
        const data = await getBanners();
        localBanners = [...data];
      }
      setBanners([...localBanners]);
      setLoading(false);
    };
    fetchBanners();
  }, []);

  const handleToggleStatus = async (banner: Banner) => {
    // TODO: Replace with actual API call to backend
    await toggleBannerStatus(banner.id);
    localBanners = localBanners.map(b =>
      b.id === banner.id ? { ...b, active: !b.active } : b
    );
    setBanners([...localBanners]);
    toast.success(t('admin.statusUpdated'));
  };

  const openAddDialog = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      image: '/placeholder.svg',
      link: '/catalog',
      active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      titleAr: banner.titleAr,
      description: banner.description,
      descriptionAr: banner.descriptionAr,
      image: banner.image,
      link: banner.link,
      active: banner.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    // TODO: Replace with actual API call to backend
    if (editingBanner) {
      localBanners = localBanners.map(b =>
        b.id === editingBanner.id ? { ...b, ...formData } : b
      );
      toast.success(t('admin.bannerUpdated'));
    } else {
      const newBanner: Banner = {
        id: Date.now().toString(),
        ...formData,
      };
      localBanners.push(newBanner);
      toast.success(t('admin.bannerAdded'));
    }
    setBanners([...localBanners]);
    setDialogOpen(false);
  };

  const handleDelete = (banner: Banner) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bannerToDelete) {
      // TODO: Replace with actual API call to backend
      localBanners = localBanners.filter(b => b.id !== bannerToDelete.id);
      setBanners([...localBanners]);
      toast.success(t('admin.bannerDeleted'));
    }
    setDeleteDialogOpen(false);
    setBannerToDelete(null);
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('admin.ads')}
        breadcrumbs={[{ label: t('admin.ads') }]}
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 me-2" />
            {t('admin.addBanner')}
          </Button>
        }
      />

      {loading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="aspect-[16/9] relative">
                <img
                  src={banner.image}
                  alt={lang === 'ar' ? banner.titleAr : banner.title}
                  className="w-full h-full object-cover"
                />
                <Badge
                  className="absolute top-2 end-2"
                  variant={banner.active ? 'default' : 'secondary'}
                >
                  {banner.active ? t('admin.active') : t('admin.inactive')}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {lang === 'ar' ? banner.titleAr : banner.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {lang === 'ar' ? banner.descriptionAr : banner.description}
                    </p>
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 mt-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {banner.link}
                    </a>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Switch
                      checked={banner.active}
                      onCheckedChange={() => handleToggleStatus(banner)}
                    />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(banner)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(banner)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? t('admin.editBanner') : t('admin.addBanner')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.titleEn')}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.titleAr')}</Label>
                <Input
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.descriptionEn')}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.descriptionAr')}</Label>
                <Input
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.imageUrl')}</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.linkUrl')}</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t('admin.active')}</Label>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit}>
              {editingBanner ? t('common.save') : t('admin.addBanner')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.deleteBanner')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.deleteBannerConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminBannersPage;
