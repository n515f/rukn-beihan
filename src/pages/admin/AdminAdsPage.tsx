import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useLang } from '@/context/LangContext';
import { getBanners, Banner, toggleBannerStatus } from '@/services/adsService';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { toast } from 'sonner';

const AdminAdsPage = () => {
  const { t, lang } = useLang();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      const data = await getBanners();
      setBanners(data);
      setLoading(false);
    };
    fetchBanners();
  }, []);

  const handleToggleStatus = async (bannerId: string) => {
    // TODO: Replace with actual API call to backend
    await toggleBannerStatus(bannerId);
    setBanners(banners.map(banner =>
      banner.id === bannerId ? { ...banner, active: !banner.active } : banner
    ));
    toast.success(t('admin.statusUpdated'));
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('admin.ads')}
        breadcrumbs={[{ label: t('admin.ads') }]}
      />

      {loading ? (
        <p>{t('common.loading')}</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.ads')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {banners.map((banner) => (
                <Card key={banner.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={banner.image}
                        alt={lang === 'ar' ? banner.titleAr : banner.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {lang === 'ar' ? banner.titleAr : banner.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {lang === 'ar' ? banner.descriptionAr : banner.description}
                        </p>
                        <Badge variant={banner.active ? 'default' : 'secondary'}>
                          {banner.active ? t('admin.active') : t('admin.inactive')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {t('admin.status')}
                        </span>
                        <Switch
                          checked={banner.active}
                          onCheckedChange={() => handleToggleStatus(banner.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default AdminAdsPage;
