// src/services/productsService.ts
import { apiRequest, ApiOkResponse, API_BASE } from "./api";

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

  categoryId: number;
  categoryName: string;
  categoryNameAr: string;

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

function resolveImageUrl(imageUrl?: string | null): string {
  if (!imageUrl || !String(imageUrl).trim()) return "/placeholder-battery.jpg";

  const url = String(imageUrl).trim();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const apiOrigin = API_BASE.replace(/\/api\/?$/, ""); // http://localhost/rukn-api
  const hostOrigin = (() => {
    try {
      return new URL(API_BASE).origin; // http://localhost
    } catch {
      return "http://localhost";
    }
  })();

  // إذا كانت مخزنة: /uploads/products/x.jpg  => http://localhost/rukn-api/uploads/products/x.jpg
  if (url.startsWith("/uploads/")) return `${apiOrigin}${url}`;

  // إذا كانت مخزنة: /rukn-api/uploads/products/x.jpg => http://localhost/rukn-api/uploads/products/x.jpg
  if (url.startsWith("/rukn-api/")) return `${hostOrigin}${url}`;

  // إذا كانت بدون / في البداية
  if (url.startsWith("uploads/")) return `${apiOrigin}/${url}`;

  // fallback
  return `${apiOrigin}/${url}`;
}

function mapApiProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.name_en,
    nameAr: p.name_ar,

    brand: p.brand,

    categoryId: Number(p.category_id),
    categoryName: (p.category_name_en ?? "Category").toString(),
    categoryNameAr: (p.category_name_ar ?? "التصنيف").toString(),

    price: Number(p.price),
    oldPrice: null,

    image: resolveImageUrl(p.image_url),

    rating: 4.6,
    reviews: 0,

    stock: Number(p.stock),

    description: p.description_en ?? "",
    descriptionAr: p.description_ar ?? "",

    specifications: {},
    features: [],

    bestSeller: Number(p.stock) > 20,
    isNew: Number(p.id) > 50,

    active: Boolean(p.active),
  };
}

const PUBLIC_PRODUCTS_ENDPOINT = "/products/list.php";
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

// ✅ Public: يخفي inactive
export const getProductById = async (id: string): Promise<Product | null> => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  try {
    const data = await apiRequest<ApiProductGetResponse>(
      `/products/get.php?id=${encodeURIComponent(String(numericId))}`
    );

    if (!data.product?.active) return null;
    return mapApiProduct(data.product);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) return null;
    throw e;
  }
};

// ✅ Admin: يسمح حتى لو inactive
export const getAdminProductById = async (id: string): Promise<Product | null> => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  try {
    const data = await apiRequest<ApiProductGetResponse>(
      `/products/get.php?id=${encodeURIComponent(String(numericId))}`
    );
    return data.product ? mapApiProduct(data.product) : null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) return null;
    throw e;
  }
};

// ✅ FIX: HomePage يحتاجها
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

    return name.includes(q) || nameAr.includes(q) || brand.includes(q) || cat.includes(q) || catAr.includes(q);
  });
};

// =======================
// ADMIN CRUD (multipart)
// =======================

export const adminCreateProduct = async (payload: {
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  brand: string;
  category_id: number;
  price: number;
  stock: number;
  active?: boolean;
  imageFile: File; // REQUIRED
}): Promise<{ productId: string }> => {
  const fd = new FormData();
  fd.append("name_en", payload.name_en);
  fd.append("name_ar", payload.name_ar);
  fd.append("description_en", payload.description_en ?? "");
  fd.append("description_ar", payload.description_ar ?? "");
  fd.append("brand", payload.brand);
  fd.append("category_id", String(payload.category_id));
  fd.append("price", String(payload.price));
  fd.append("stock", String(payload.stock));
  fd.append("active", String(payload.active ? 1 : 0));
  fd.append("image", payload.imageFile);

  const res = await apiRequest<ApiCreateResponse>("/products/create.php", {
    method: "POST",
    body: fd,
  });

  return { productId: String(res.product_id) };
};

export const adminUpdateProduct = async (payload: {
  id: number | string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  brand: string;
  category_id: number;
  price: number;
  stock: number;
  active?: boolean;
  imageFile?: File | null; // OPTIONAL
}): Promise<void> => {
  const fd = new FormData();
  fd.append("id", String(payload.id));
  fd.append("name_en", payload.name_en);
  fd.append("name_ar", payload.name_ar);
  fd.append("description_en", payload.description_en ?? "");
  fd.append("description_ar", payload.description_ar ?? "");
  fd.append("brand", payload.brand);
  fd.append("category_id", String(payload.category_id));
  fd.append("price", String(payload.price));
  fd.append("stock", String(payload.stock));
  fd.append("active", String(payload.active ? 1 : 0));
  if (payload.imageFile) fd.append("image", payload.imageFile);

  await apiRequest<ApiOkResponse>("/products/update.php", {
    method: "POST",
    body: fd,
  });
};

export const adminDeleteProduct = async (id: number | string): Promise<void> => {
  await apiRequest<ApiOkResponse>("/products/delete.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(id) }),
  });
};

// NEW: Safely adjust stock by delta (negative/positive) after fetching full product
export const adminAdjustProductStock = async (
  productId: number | string,
  delta: number
): Promise<number> => {
  const p = await getAdminProductById(String(productId));
  if (!p) throw new Error("Product not found");

  const newStock = Math.max(0, Number(p.stock) + Number(delta));

  await adminUpdateProduct({
    id: productId,
    name_en: p.name,
    name_ar: p.nameAr ?? p.name,
    description_en: p.description ?? "",
    description_ar: p.descriptionAr ?? "",
    brand: p.brand,
    category_id: p.categoryId,
    price: p.price,
    stock: newStock,
    active: p.active,
    imageFile: null,
  });

  return newStock;
};

// ✅ NEW: Strict decrement function that rejects if stock would go below 0
export const adminDecrementProductStock = async (
  productId: number | string,
  qty: number
): Promise<number> => {
  const p = await getAdminProductById(String(productId));
  if (!p) throw new Error("Product not found");

  const decrement = Math.max(0, Number(qty));
  const current = Number(p.stock);

  if (!Number.isFinite(decrement) || decrement <= 0) {
    throw new Error("Invalid decrement quantity");
  }

  if (current < decrement) {
    throw new Error(
      `Insufficient stock for product ${productId}. Available: ${current}, required: ${decrement}`
    );
  }

  const newStock = current - decrement;

  await adminUpdateProduct({
    id: productId,
    name_en: p.name,
    name_ar: p.nameAr ?? p.name,
    description_en: p.description ?? "",
    description_ar: p.descriptionAr ?? "",
    brand: p.brand,
    category_id: p.categoryId,
    price: p.price,
    stock: newStock,
    active: p.active,
    imageFile: null,
  });

  return newStock;
};

// ✅ شغّال: يجلب المنتج ثم يحدّث active مع نفس الحقول (لأن update.php يتطلب الحقول)
export const adminToggleProductActive = async (
  id: number | string,
  active: boolean
): Promise<boolean> => {
  const p = await getAdminProductById(String(id));
  if (!p) throw new Error("Product not found");

  await adminUpdateProduct({
    id,
    name_en: p.name,
    name_ar: p.nameAr ?? p.name,
    description_en: p.description ?? "",
    description_ar: p.descriptionAr ?? "",
    brand: p.brand,
    category_id: p.categoryId,
    price: p.price,
    stock: p.stock,
    active,
    imageFile: null,
  });

  return true;
};
