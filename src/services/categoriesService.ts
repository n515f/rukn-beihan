// src/services/categoriesService.ts
import { apiRequest, ApiOkResponse } from "./api";

export type ApiCategory = {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  active: boolean;
  sort_order: number;
  count?: number;
};

type ApiCategoriesListResponse = {
  success: boolean;
  categories: ApiCategory[];
};

type ApiCreateResponse = {
  success: boolean;
  category_id: number;
};

export interface Category {
  id: string;      // keep UI friendly
  idNumber: number; // numeric id for filtering
  name: string;
  nameAr: string;
  slug: string;
  active: boolean;
  sortOrder: number;
  count: number;
}

function mapApiCategory(c: ApiCategory): Category {
  return {
    id: String(c.id),
    idNumber: Number(c.id),
    name: c.name_en,
    nameAr: c.name_ar,
    slug: c.slug,
    active: Boolean(c.active),
    sortOrder: Number(c.sort_order),
    count: Number(c.count ?? 0),
  };
}

// PUBLIC
export const getCategories = async (activeOnly = true): Promise<Category[]> => {
  const qs = activeOnly ? "?active=1" : "";
  const data = await apiRequest<ApiCategoriesListResponse>(`/categories/list.php${qs}`);
  return (data.categories ?? []).map(mapApiCategory);
};

// ADMIN CRUD (إذا رغبت لاحقاً)
export const adminCreateCategory = async (payload: {
  name_en: string;
  name_ar: string;
  slug: string;
  active?: boolean;
  sort_order?: number;
}): Promise<{ categoryId: string }> => {
  const res = await apiRequest<ApiCreateResponse>("/categories/create.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { categoryId: String(res.category_id) };
};

export const adminUpdateCategory = async (payload: {
  id: number | string;
  name_en?: string;
  name_ar?: string;
  slug?: string;
  active?: boolean;
  sort_order?: number;
}): Promise<void> => {
  await apiRequest<ApiOkResponse>("/categories/update.php", {
    method: "POST",
    body: JSON.stringify({ ...payload, id: Number(payload.id) }),
  });
};

export const adminDeleteCategory = async (id: number | string): Promise<void> => {
  await apiRequest<ApiOkResponse>("/categories/delete.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(id) }),
  });
};
