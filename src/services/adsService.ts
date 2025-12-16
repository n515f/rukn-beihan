// src/services/adsService.ts
// Service layer for banners / ads
// Uses shared apiRequest from src/services/api.ts

import { apiRequest, ApiOkResponse } from "./api";

/**
 * Backend banner shape (PHP API)
 * banners/list.php returns:
 * { success: true, banners: [{ id, title_en, title_ar, description_en, description_ar, image_url, link, active }] }
 */
type ApiBanner = {
  id: number;
  title_en: string;
  title_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  image_url?: string | null;
  link?: string | null;
  active: boolean;
};

type ApiBannersListResponse = {
  success: boolean;
  banners: ApiBanner[];
};

type ApiCreateBannerResponse = {
  success: boolean;
  banner_id: number;
};

export interface Banner {
  id: string;

  title: string;
  titleAr: string;

  description: string;
  descriptionAr: string;

  image: string;
  link: string;

  active: boolean;
}

/**
 * Map API banner -> UI banner
 */
function mapApiBanner(b: ApiBanner): Banner {
  return {
    id: String(b.id),
    title: b.title_en,
    titleAr: b.title_ar,
    description: b.description_en ?? "",
    descriptionAr: b.description_ar ?? "",
    image:
      b.image_url && b.image_url.trim().length > 0
        ? b.image_url
        : "/placeholder-banner.jpg",
    link: b.link ?? "#",
    active: Boolean(b.active),
  };
}

// =======================
// PUBLIC (Home / Offers)
// =======================

export const getBanners = async (): Promise<Banner[]> => {
  const data = await apiRequest<ApiBannersListResponse>("/banners/list.php");
  return (data.banners ?? []).map(mapApiBanner);
};

export const getActiveBanners = async (): Promise<Banner[]> => {
  const banners = await getBanners();
  return banners.filter((b) => b.active);
};

// =======================
// ADMIN CRUD
// =======================

export const adminCreateBanner = async (payload: {
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  image_url?: string;
  link?: string;
  active?: boolean;
}): Promise<{ bannerId: string }> => {
  const res = await apiRequest<ApiCreateBannerResponse>("/banners/create.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return { bannerId: String(res.banner_id) };
};

export const adminUpdateBanner = async (payload: {
  id: number | string;
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  image_url?: string;
  link?: string;
  active?: boolean;
}): Promise<void> => {
  await apiRequest<ApiOkResponse>("/banners/update.php", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      id: Number(payload.id),
    }),
  });
};

export const adminDeleteBanner = async (id: number | string): Promise<void> => {
  await apiRequest<ApiOkResponse>("/banners/delete.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(id) }),
  });
};

/**
 * Toggle banner active status (Admin).
 * IMPORTANT: We pass the desired active state to backend.
 */
export const toggleBannerStatus = async (
  bannerId: string | number,
  active: boolean
): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/banners/update.php", {
    method: "POST",
    body: JSON.stringify({
      id: Number(bannerId),
      active,
    }),
  });

  return true;
};
