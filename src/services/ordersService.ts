// src/services/ordersService.ts
// Orders service - now connected to PHP REST API (XAMPP)
// Uses shared apiRequest from src/services/api.ts

import { apiRequest, ApiOkResponse } from "./api";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface OrderLocation {
  type: "map" | "custom";
  mapLink?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  shipping: number;
  total: number;
  deliveryAddress: DeliveryAddress;
  location?: OrderLocation;
  paymentMethod: "cashOnDelivery" | "onlinePayment";
}

/**
 * ======================
 * API Response Shapes
 * ======================
 * Adjust mapping here if your PHP returns slightly different field names.
 */

type ApiOrderItem = {
  product_id: number;
  name?: string | null; // optional (sometimes you only have product_id)
  quantity: number;
  price: number;
};

type ApiOrderAddress = {
  full_name?: string | null;
  phone?: string | null;
  street?: string | null;
  address?: string | null; // some APIs use "address"
  city?: string | null;
  zip_code?: string | null;
  map_link?: string | null;
};

type ApiOrder = {
  id: number;
  user_id: number;
  created_at?: string | null;
  date?: string | null; // some APIs use "date"
  status: Order["status"];

  payment_method?: "cashOnDelivery" | "onlinePayment" | "cod" | "online";
  subtotal: number;
  tax?: number | null;
  shipping: number;
  total: number;

  address?: ApiOrderAddress | null;
  delivery_address?: ApiOrderAddress | null; // alternate name
  location_type?: "map" | "custom" | null;
  location_map_link?: string | null;
  location_address?: string | null;
  location_city?: string | null;
  location_zip_code?: string | null;

  items?: ApiOrderItem[]; // sometimes included
};

type ApiOrdersListResponse = {
  success: boolean;
  orders: ApiOrder[];
};

type ApiOrderGetResponse = {
  success: boolean;
  order: ApiOrder & { items: ApiOrderItem[] };
};

type ApiCreateOrderResponse = {
  success: boolean;
  order_id: number;
};

function normalizePaymentMethod(
  pm?: ApiOrder["payment_method"]
): Order["paymentMethod"] {
  if (!pm) return "cashOnDelivery";
  if (pm === "cod") return "cashOnDelivery";
  if (pm === "online") return "onlinePayment";
  return pm;
}

function mapApiOrderToUI(o: ApiOrder, itemsFallback: ApiOrderItem[] = []): Order {
  const items = (o.items ?? itemsFallback ?? []).map((it) => ({
    productId: String(it.product_id),
    name: it.name ?? `Product #${it.product_id}`,
    quantity: Number(it.quantity),
    price: Number(it.price),
  }));

  const addr = o.delivery_address ?? o.address ?? null;

  const deliveryAddress: DeliveryAddress = {
    name: addr?.full_name ?? "",
    phone: addr?.phone ?? "",
    address: addr?.street ?? addr?.address ?? "",
    city: addr?.city ?? "",
    zipCode: addr?.zip_code ?? "",
  };

  const location: OrderLocation | undefined =
    o.location_type === "map" || o.location_type === "custom"
      ? {
          type: o.location_type,
          mapLink: o.location_map_link ?? addr?.map_link ?? undefined,
          address: o.location_address ?? deliveryAddress.address,
          city: o.location_city ?? deliveryAddress.city,
          zipCode: o.location_zip_code ?? deliveryAddress.zipCode,
        }
      : // if your address includes map_link and you want to expose it:
      addr?.map_link
      ? {
          type: "map",
          mapLink: addr.map_link,
          address: deliveryAddress.address,
          city: deliveryAddress.city,
          zipCode: deliveryAddress.zipCode,
        }
      : undefined;

  const date = o.created_at ?? o.date ?? new Date().toISOString();

  return {
    id: String(o.id),
    userId: String(o.user_id),
    date,
    status: o.status,
    items,
    subtotal: Number(o.subtotal),
    tax: o.tax == null ? undefined : Number(o.tax),
    shipping: Number(o.shipping),
    total: Number(o.total),
    deliveryAddress,
    location,
    paymentMethod: normalizePaymentMethod(o.payment_method),
  };
}

/**
 * ======================
 * Public (User)
 * ======================
 */

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  const data = await apiRequest<ApiOrdersListResponse>(
    `/orders/list.php?user_id=${encodeURIComponent(userId)}`
  );
  return (data.orders ?? []).map((o) => mapApiOrderToUI(o));
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const numericId = Number(orderId);
  if (!Number.isFinite(numericId)) return null;

  try {
    const data = await apiRequest<ApiOrderGetResponse>(
      `/orders/get.php?id=${encodeURIComponent(String(numericId))}`
    );

    // Ensure items are present
    const order = mapApiOrderToUI(data.order, data.order.items ?? []);
    return order;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) return null;
    throw e;
  }
};

export const createOrder = async (
  orderData: Omit<Order, "id" | "date">
): Promise<Order> => {
  /**
   * We send a backend-friendly payload.
   * Adjust keys to match your PHP create.php expectation.
   */
  const payload = {
    user_id: Number(orderData.userId),
    status: orderData.status,
    payment_method: orderData.paymentMethod,
    subtotal: orderData.subtotal,
    tax: orderData.tax ?? 0,
    shipping: orderData.shipping,
    total: orderData.total,

    address: {
      full_name: orderData.deliveryAddress.name,
      phone: orderData.deliveryAddress.phone,
      street: orderData.deliveryAddress.address,
      city: orderData.deliveryAddress.city,
      zip_code: orderData.deliveryAddress.zipCode,
    },

    location: orderData.location
      ? {
          type: orderData.location.type,
          map_link: orderData.location.mapLink ?? null,
          address: orderData.location.address ?? null,
          city: orderData.location.city ?? null,
          zip_code: orderData.location.zipCode ?? null,
        }
      : null,

    items: orderData.items.map((it) => ({
      product_id: Number(it.productId),
      name: it.name,
      quantity: it.quantity,
      price: it.price,
    })),
  };

  const res = await apiRequest<ApiCreateOrderResponse>("/orders/create.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Return a UI Order similar to old behavior, but with real order_id
  return {
    ...orderData,
    id: String(res.order_id),
    date: new Date().toISOString(),
  };
};

/**
 * ======================
 * Admin
 * ======================
 */

export const getAllOrders = async (): Promise<Order[]> => {
  const data = await apiRequest<ApiOrdersListResponse>("/orders/list.php");
  return (data.orders ?? []).map((o) => mapApiOrderToUI(o));
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"]
): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/orders/update-status.php", {
    method: "POST",
    body: JSON.stringify({
      id: Number(orderId),
      status,
    }),
  });

  return true;
};
