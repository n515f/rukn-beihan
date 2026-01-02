// src/services/ordersService.ts
// Final version aligned with PHP api/orders + addresses (address_id)

import { apiRequest, ApiOkResponse } from "./api";
import { adminDecrementProductStock } from "./productsService";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "online";

/** ===== UI Types (used by your pages) ===== */
export interface OrderItem {
  productId: string;
  name: string; // UI name (prefer EN/AR if provided)
  nameEn?: string;
  nameAr?: string;
  quantity: number;
  price: number;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  address: string; // street
  city: string;
  zipCode: string; // not in DB -> keep empty
  locationUrl?: string | null;
}

export interface Order {
  id: string;
  userId: string;

  // Link to addresses table
  addressId: string | null;

  date: string; // created_at
  status: OrderStatus;
  paymentMethod: PaymentMethod;

  currency: string;
  vatAmount: number; // vat_amount
  totalAmount: number; // total_amount

  items: OrderItem[];

  // UI Calculated fields (to keep your current pages working)
  subtotal: number;
  shipping: number;
  total: number;
  tax: number;

  // For UI pages (OrderDetails/AdminOrders)
  deliveryAddress: DeliveryAddress;
}

/** ===== API Shapes (what PHP returns) ===== */
type ApiOrderItem = {
  id?: number;
  product_id: number;
  quantity: number;
  price: number;

  // get.php may return these from products join
  name_en?: string | null;
  name_ar?: string | null;
};

type ApiAddress = {
  id: number;
  user_id?: number;
  full_name?: string | null;
  phone?: string | null;
  city?: string | null;
  street?: string | null;
  location_url?: string | null;
  is_default?: boolean | number | null;
  created_at?: string | null;
};

// This shape supports both:
// 1) order.address = {...} (recommended)
// 2) flattened address fields on order (fallback)
type ApiOrder = {
  id: number;
  user_id: number;
  address_id?: number | null;

  total_amount: number;
  currency?: string | null;
  vat_amount?: number | null;

  status: OrderStatus;
  payment_method?: PaymentMethod | null;

  created_at?: string | null;

  // Preferred: nested address
  address?: ApiAddress | null;

  // Fallback: flattened
  full_name?: string | null;
  phone?: string | null;
  city?: string | null;
  street?: string | null;
  location_url?: string | null;

  // Sometimes list.php includes items; if not, ignore
  items?: ApiOrderItem[];
};

type ApiOrdersListResponse = {
  success: boolean;
  orders: ApiOrder[];
};

type ApiOrderGetResponse = {
  success: boolean;
  order: ApiOrder;
  items: ApiOrderItem[];
};

type ApiCreateOrderResponse = {
  success: boolean;
  order_id: number;
};

/** ===== Helpers ===== */
function toNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function mapItem(it: ApiOrderItem): OrderItem {
  const nameEn = it.name_en ?? undefined;
  const nameAr = it.name_ar ?? undefined;

  return {
    productId: String(it.product_id),
    name: nameEn ?? nameAr ?? `Product #${it.product_id}`,
    nameEn,
    nameAr,
    quantity: toNumber(it.quantity, 1),
    price: toNumber(it.price, 0),
  };
}

function mapDeliveryAddress(order: ApiOrder): DeliveryAddress {
  const a = order.address ?? null;

  const name = String(a?.full_name ?? order.full_name ?? "");
  const phone = String(a?.phone ?? order.phone ?? "");
  const city = String(a?.city ?? order.city ?? "");
  const street = String(a?.street ?? order.street ?? "");
  const locationUrl = (a?.location_url ?? order.location_url ?? null) as
    | string
    | null;

  return {
    name,
    phone,
    city,
    address: street,
    zipCode: "", // your DB doesn't have zip_code
    locationUrl,
  };
}

function mapOrder(order: ApiOrder, itemsFallback: ApiOrderItem[] = []): Order {
  const items = (order.items ?? itemsFallback ?? []).map(mapItem);

  const totalAmount = toNumber(order.total_amount, 0);
  const vatAmount = toNumber(order.vat_amount, 0);

  // Keep your UI assumptions:
  const shipping = totalAmount > 0 ? 15 : 0;
  const subtotal = Math.max(0, totalAmount - vatAmount - shipping);

  const createdAt = order.created_at ?? new Date().toISOString();
  const paymentMethod = (order.payment_method ?? "cod") as PaymentMethod;

  return {
    id: String(order.id),
    userId: String(order.user_id),
    addressId:
      order.address_id == null ? null : String(order.address_id),

    date: createdAt,
    status: order.status,
    paymentMethod,

    currency: String(order.currency ?? "SAR"),
    vatAmount,
    totalAmount,

    items,

    subtotal,
    shipping,
    total: totalAmount,
    tax: vatAmount,

    deliveryAddress: mapDeliveryAddress(order),
  };
}

/** ===== USER ===== */
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  const id = Number(userId);
  if (!Number.isFinite(id)) return [];

  const data = await apiRequest<ApiOrdersListResponse>(
    `/orders/list.php?user_id=${encodeURIComponent(String(id))}`
  );

  return (data.orders ?? []).map((o) => mapOrder(o));
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const id = Number(orderId);
  if (!Number.isFinite(id)) return null;

  try {
    const data = await apiRequest<ApiOrderGetResponse>(
      `/orders/get.php?id=${encodeURIComponent(String(id))}`
    );

    return mapOrder(data.order, data.items ?? []);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) return null;
    throw e;
  }
};

/**
 * Create order (MUST send address_id because orders table has address_id)
 * Matches your PHP create.php expected keys:
 * user_id, address_id, items[], total_amount, currency, vat_amount, payment_method
 */
export const createOrder = async (payload: {
  user_id: number | string;
  address_id: number | string;
  items: { product_id: number | string; quantity: number; price: number }[];
  total_amount: number;
  vat_amount?: number;
  currency?: string;
  payment_method?: PaymentMethod;
}): Promise<{ orderId: string }> => {
  const res = await apiRequest<ApiCreateOrderResponse>("/orders/create.php", {
    method: "POST",
    body: JSON.stringify({
      user_id: Number(payload.user_id),
      address_id: Number(payload.address_id),
      items: payload.items.map((it) => ({
        product_id: Number(it.product_id),
        quantity: toNumber(it.quantity, 1),
        price: toNumber(it.price, 0),
      })),
      total_amount: toNumber(payload.total_amount, 0),
      vat_amount: toNumber(payload.vat_amount ?? 0, 0),
      currency: payload.currency ?? "SAR",
      payment_method: payload.payment_method ?? "cod",
    }),
  });

  return { orderId: String(res.order_id) };
};

/** ===== ADMIN ===== */
export const getAllOrders = async (): Promise<Order[]> => {
  const data = await apiRequest<ApiOrdersListResponse>("/orders/list.php");
  return (data.orders ?? []).map((o) => mapOrder(o));
};

export const updateOrderStatus = async (
  orderId: number | string,
  status: OrderStatus
): Promise<void> => {
  // Backend handles stock_reserved logic; send JSON with text status
  try {
    await apiRequest<ApiOkResponse>("/orders/update-status.php", {
      method: "POST",
      body: JSON.stringify({ id: Number(orderId), status }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Rethrow the server message so UI can show it (e.g., 422 validation)
    throw new Error(msg);
  }
};
