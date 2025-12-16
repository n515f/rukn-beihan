// src/services/productsService.ts
// Service that adapts backend product data to the UI product shape.
// Uses shared apiRequest from src/services/api.ts

import { apiRequest, ApiOkResponse } from "./api";

// Optional: keep small delay if you want UI skeletons to appear consistently
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Backend shape (from PHP API):
 * - products/list.php (public) should ideally return JOINed category names:
 *   { success: true, products: [{ id, name_en, name_ar, description_en, description_ar, brand, category_id, category_name_en, category_name_ar, price, stock, image_url, active }] }
 *
 * - products/admin-list.php (admin) returns the same + inactive too.
 */
export type ApiProduct = {
  id: number;
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  brand: string;

  category_id: number;
  category_name_en?: string | null;
  category_name_ar?: string | null;

  price: number;
  stock: number;
  image_url?: string | null;
  active: boolean;
};

type ApiProductsListResponse = {
  success: boolean;
  products: ApiProduct[];
};

type ApiProductGetResponse = {
  success: boolean;
  product: ApiProduct;
};

type ApiCreateResponse = {
  success: boolean;
  product_id: number;
};

export interface Product {
  id: string;

  name: string;
  nameAr?: string;

  brand: string;

  // NEW: categories are stored in DB
  categoryId: number;
  categoryName: string;   // EN (fallback if missing)
  categoryNameAr: string; // AR (fallback if missing)

  price: number;
  oldPrice: number | null;

  image: string;

  rating: number;
  reviews: number;
  stock: number;

  description: string;
  descriptionAr?: string;

  specifications: Record<string, string>;
  features: string[];

  bestSeller: boolean;
  isNew: boolean;

  active: boolean;
}

function mapApiProduct(p: ApiProduct): Product {
  const image =
    p.image_url && p.image_url.trim().length > 0
      ? p.image_url
      : "/placeholder-battery.jpg";

  return {
    id: String(p.id),
    name: p.name_en,
    nameAr: p.name_ar,

    brand: p.brand,

    categoryId: Number(p.category_id),
    categoryName: (p.category_name_en ?? "Category").toString(),
    categoryNameAr: (p.category_name_ar ?? "التصنيف").toString(),

    price: Number(p.price),
    oldPrice: null, // TODO: add old_price later if needed

    image,

    rating: 4.6, // TODO: backend rating_avg
    reviews: 0, // TODO: backend reviews_count

    stock: Number(p.stock),

    description: p.description_en ?? "",
    descriptionAr: p.description_ar ?? "",

    specifications: {}, // TODO: backend specs JSON
    features: [], // TODO: backend features JSON

    bestSeller: Number(p.stock) > 20,
    isNew: Number(p.id) > 50,

    active: Boolean(p.active),
  };
}

/**
 * PUBLIC (used by UI)
 * Uses products/list.php by default.
 * If your list.php does not include category_name_en/ar yet, either:
 * - update list.php to JOIN categories (recommended), OR
 * - switch PUBLIC_PRODUCTS_ENDPOINT to "/products/admin-list.php" temporarily.
 */
const PUBLIC_PRODUCTS_ENDPOINT = "/products/list.php";

/**
 * ADMIN (used by admin UI)
 */
const ADMIN_PRODUCTS_ENDPOINT = "/products/admin-list.php";

export const getProducts = async (): Promise<Product[]> => {
  const data = await apiRequest<ApiProductsListResponse>(PUBLIC_PRODUCTS_ENDPOINT);
  const activeProducts = (data.products ?? []).filter((p) => p.active);
  return activeProducts.map(mapApiProduct);
};

export const getAdminProducts = async (): Promise<Product[]> => {
  const data = await apiRequest<ApiProductsListResponse>(ADMIN_PRODUCTS_ENDPOINT);
  return (data.products ?? []).map(mapApiProduct);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  try {
    const data = await apiRequest<ApiProductGetResponse>(
      `/products/get.php?id=${encodeURIComponent(String(numericId))}`
    );

    // For public UI: if product inactive, hide it
    if (!data.product?.active) return null;

    return mapApiProduct(data.product);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) return null;
    throw e;
  }
};

export const getBestSellers = async (): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter((p) => p.bestSeller);
};

export const getNewProducts = async (): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter((p) => p.isNew);
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const q = query.trim().toLowerCase();
  if (!q) return getProducts();

  const products = await getProducts();
  return products.filter((p) => {
    const name = (p.name ?? "").toLowerCase();
    const nameAr = (p.nameAr ?? "").toLowerCase();
    const brand = (p.brand ?? "").toLowerCase();
    const cat = (p.categoryName ?? "").toLowerCase();
    const catAr = (p.categoryNameAr ?? "").toLowerCase();

    return (
      name.includes(q) ||
      nameAr.includes(q) ||
      brand.includes(q) ||
      cat.includes(q) ||
      catAr.includes(q)
    );
  });
};

// =======================
// ADMIN CRUD (UI only)
// =======================

export const adminCreateProduct = async (payload: {
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  brand: string;
  category_id: number; // UPDATED
  price: number;
  stock: number;
  image_url?: string;
  active?: boolean;
}): Promise<{ productId: string }> => {
  const res = await apiRequest<ApiCreateResponse>("/products/create.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { productId: String(res.product_id) };
};

export const adminUpdateProduct = async (payload: {
  id: number | string;
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  brand?: string;
  category_id?: number; // UPDATED
  price?: number;
  stock?: number;
  image_url?: string;
  active?: boolean;
}): Promise<void> => {
  await apiRequest<ApiOkResponse>("/products/update.php", {
    method: "POST",
    body: JSON.stringify({ ...payload, id: Number(payload.id) }),
  });
};

export const adminDeleteProduct = async (id: number | string): Promise<void> => {
  await apiRequest<ApiOkResponse>("/products/delete.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(id) }),
  });
};

export const adminToggleProductActive = async (
  id: number | string,
  active: boolean
): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/products/update.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(id), active }),
  });
  return true;
};
