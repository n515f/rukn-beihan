// src/services/cartService.ts
import { apiRequest, ApiOkResponse, API_BASE } from "./api";

export type ApiCartItem = {
  id: number;
  product_id: number;
  name_en?: string | null;
  name_ar?: string | null;
  image_url?: string | null;
  quantity: number;
  price: number;
  line_total?: number;
};

type ApiCartGetResponse = {
  success: boolean;
  cart: {
    id: number;
    user_id: number;
    total: number;
  };
  items: ApiCartItem[];
};

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  nameAr: string;
  image: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  userId: string;
  total: number;
  items: CartItem[];
}

function resolveImageUrl(imageUrl?: string | null): string {
  if (!imageUrl || !String(imageUrl).trim()) return "/placeholder-battery.jpg";
  const url = String(imageUrl).trim();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const apiOrigin = API_BASE.replace(/\/api\/?$/, ""); // http://localhost/rukn-api
  const hostOrigin = (() => {
    try {
      return new URL(API_BASE).origin;
    } catch {
      return "http://localhost";
    }
  })();

  if (url.startsWith("/uploads/")) return `${apiOrigin}${url}`;
  if (url.startsWith("/rukn-api/")) return `${hostOrigin}${url}`;
  if (url.startsWith("uploads/")) return `${apiOrigin}/${url}`;
  return `${apiOrigin}/${url}`;
}

function mapApiItem(it: ApiCartItem): CartItem {
  const qty = Number(it.quantity) || 0;
  const price = Number(it.price) || 0;
  const lineTotal = Number(it.line_total ?? qty * price);

  return {
    id: String(it.id),
    productId: String(it.product_id),
    name: String(it.name_en ?? `Product #${it.product_id}`),
    nameAr: String(it.name_ar ?? ""),
    image: resolveImageUrl(it.image_url),
    quantity: qty,
    price,
    lineTotal,
  };
}

export const getCart = async (userId: number | string): Promise<Cart> => {
  const data = await apiRequest<ApiCartGetResponse>(
    `/cart/get.php?user_id=${encodeURIComponent(String(Number(userId)))}`
  );

  return {
    id: String(data.cart.id),
    userId: String(data.cart.user_id),
    total: Number(data.cart.total) || 0,
    items: (data.items ?? []).map(mapApiItem),
  };
};

export const addCartItem = async (payload: {
  user_id: number | string;
  product_id: number | string;
  quantity?: number;
}): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/cart/add-item.php", {
    method: "POST",
    body: JSON.stringify({
      user_id: Number(payload.user_id),
      product_id: Number(payload.product_id),
      quantity: payload.quantity ?? 1,
    }),
  });
  return true;
};

export const updateCartItem = async (payload: {
  user_id: number | string;
  product_id: number | string;
  quantity: number;
}): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/cart/update-item.php", {
    method: "POST",
    body: JSON.stringify({
      user_id: Number(payload.user_id),
      product_id: Number(payload.product_id),
      quantity: Number(payload.quantity),
    }),
  });
  return true;
};

export const removeCartItem = async (payload: {
  user_id: number | string;
  product_id: number | string;
}): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/cart/remove-item.php", {
    method: "POST",
    body: JSON.stringify({
      user_id: Number(payload.user_id),
      product_id: Number(payload.product_id),
    }),
  });
  return true;
};

export const clearCartApi = async (userId: number | string): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/cart/clear.php", {
    method: "POST",
    body: JSON.stringify({ user_id: Number(userId) }),
  });
  return true;
};

type ApiCartCheckoutResponse = { success: boolean; order_id: number };

export const checkoutCart = async (payload: {
  user_id: number | string;
  vat_amount?: number;
  currency?: string;
  payment_method?: "cod" | "online";
}): Promise<{ orderId: string }> => {
  const res = await apiRequest<ApiCartCheckoutResponse>("/cart/checkout.php", {
    method: "POST",
    body: JSON.stringify({
      user_id: Number(payload.user_id),
      vat_amount: Number(payload.vat_amount ?? 0),
      currency: payload.currency ?? "SAR",
      payment_method: payload.payment_method ?? "cod",
    }),
  });

  return { orderId: String(res.order_id) };
};
