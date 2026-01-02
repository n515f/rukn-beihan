import { apiRequest, ApiOkResponse } from "./api";

export type ApiBrand = {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  active: boolean;
  sort_order: number;
  count?: number;
};

type ApiBrandsListResponse = {
  success: boolean;
  brands: ApiBrand[];
};

type ApiBrandGetResponse = {
  success: boolean;
  brand: ApiBrand;
};

type ApiCreateResponse = {
  success: boolean;
  brand_id: number;
};

export interface Brand {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  active: boolean;
  sortOrder: number;
  productCount: number;
}

function mapApiBrand(b: ApiBrand): Brand {
  return {
    id: String(b.id),
    name: b.name_en,
    nameAr: b.name_ar,
    slug: b.slug,
    active: Boolean(b.active),
    sortOrder: Number(b.sort_order),
    productCount: Number(b.count ?? 0),
  };
}

export const getBrands = async (activeOnly = true): Promise<Brand[]> => {
  const qs = activeOnly ? "?active=1" : "";
  const data = await apiRequest<ApiBrandsListResponse>(`/brands/list.php${qs}`);
  return (data.brands ?? []).map(mapApiBrand);
};

export const getBrandById = async (id: string): Promise<Brand | null> => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;
  try {
    const data = await apiRequest<ApiBrandGetResponse>(`/brands/get.php?id=${numericId}`);
    return mapApiBrand(data.brand);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
      return null;
    }
    throw e;
  }
};

export const createBrand = async (payload: {
  name_en: string;
  name_ar: string;
  slug: string;
  active?: boolean;
  sort_order?: number;
}): Promise<string> => {
  const res = await apiRequest<ApiCreateResponse>("/brands/create.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return String(res.brand_id);
};

export const updateBrand = async (
  id: string | number,
  changes: {
    name_en?: string;
    name_ar?: string;
    slug?: string;
    active?: boolean;
    sort_order?: number;
  }
): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/brands/update.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(id), ...changes }),
  });
  return true;
};

export const deleteBrand = async (id: string | number): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/brands/delete.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(id) }),
  });
  return true;
};
