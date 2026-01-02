import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/context/LangContext";
import { getBanners, Banner, toggleBannerStatus } from "@/services/adsService";
import { toast } from "sonner";

const AdminAdsPage = () => {
  const { t, lang } = useLang();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
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
    fetchBanners();
  }, [t]);

  const handleToggleStatus = async (banner: Banner) => {
    const nextActive = !banner.active;

    try {
      // مهم: حسب خطأ TS عندك، الدالة تتطلب (id, active)
      await toggleBannerStatus(banner.id, nextActive);

      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, active: nextActive } : b))
      );

      toast.success(t("admin.statusUpdated"));
    } catch (e) {
      console.error(e);
      toast.error(t("admin.updateFailed"));
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader title={t("admin.ads")} breadcrumbs={[{ label: t("admin.ads") }]} />

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.ads")}</CardTitle>
          </CardHeader>

          <CardContent>
            {banners.length === 0 ? (
              <p className="text-muted-foreground">{t("admin.noAds")}</p>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <Card key={String(banner.id)}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={banner.image}
                          alt={lang === "ar" ? banner.titleAr : banner.title}
                          className="w-24 h-24 object-cover rounded"
                        />

                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">
                            {lang === "ar" ? banner.titleAr : banner.title}
                          </h3>

                          <p className="text-sm text-muted-foreground mb-2">
                            {lang === "ar" ? banner.descriptionAr : banner.description}
                          </p>

                          <Badge variant={banner.active ? "default" : "secondary"}>
                            {banner.active ? t("admin.active") : t("admin.inactive")}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{t("admin.status")}</span>
                          <Switch
                            checked={banner.active}
                            onCheckedChange={() => handleToggleStatus(banner)}
                            aria-label={t("admin.status")}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default AdminAdsPage;
