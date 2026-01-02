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
    image: b.image_url && b.image_url.trim().length > 0 ? b.image_url : "/placeholder-banner.jpg",
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
// ADMIN CRUD (multipart/form-data)
// =======================

export const adminCreateBanner = async (payload: {
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  link?: string;
  active?: boolean;
  imageFile: File; // required
}): Promise<{ bannerId: string }> => {
  const fd = new FormData();
  fd.append("title_en", payload.title_en);
  fd.append("title_ar", payload.title_ar);
  fd.append("description_en", payload.description_en ?? "");
  fd.append("description_ar", payload.description_ar ?? "");
  fd.append("link", payload.link ?? "");
  fd.append("active", payload.active === false ? "0" : "1");
  fd.append("image", payload.imageFile);

  const res = await apiRequest<ApiCreateBannerResponse>("/banners/create.php", {
    method: "POST",
    body: fd,
  });

  return { bannerId: String(res.banner_id) };
};

export const adminUpdateBanner = async (payload: {
  id: number | string;
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  link?: string;
  active?: boolean;
  imageFile?: File | null; // optional
}): Promise<void> => {
  const fd = new FormData();
  fd.append("id", String(payload.id));
  fd.append("title_en", payload.title_en);
  fd.append("title_ar", payload.title_ar);
  fd.append("description_en", payload.description_en ?? "");
  fd.append("description_ar", payload.description_ar ?? "");
  fd.append("link", payload.link ?? "");
  fd.append("active", payload.active === false ? "0" : "1");
  if (payload.imageFile) fd.append("image", payload.imageFile);

  await apiRequest<ApiOkResponse>("/banners/update.php", {
    method: "POST",
    body: fd,
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
 * IMPORTANT: passes desired active state to backend.
 */
export const toggleBannerStatus = async (bannerId: string | number, active: boolean): Promise<boolean> => {
  // ملاحظة: بما أن update.php صار FormData، نخليه FormData أيضاً للتوافق
  const fd = new FormData();
  fd.append("id", String(bannerId));
  fd.append("active", active ? "1" : "0");

  await apiRequest<ApiOkResponse>("/banners/update.php", {
    method: "POST",
    body: fd,
  });

  return true;
};
