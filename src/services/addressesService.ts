import { apiRequest } from "./api";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  street: string;
  locationUrl?: string;
  isDefault: boolean;
}

type ApiCreateAddressResponse = {
  success: boolean;
  address_id: number;
};

function parseLatLng(link?: string): { lat: number; lng: number } | null {
  if (!link) return null;
  const m1 = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m1) return { lat: Number(m1[1]), lng: Number(m1[2]) };
  const m2 = link.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m2) return { lat: Number(m2[1]), lng: Number(m2[2]) };
  return null;
}

async function reverseGeocode(
  link?: string
): Promise<{ city?: string; street?: string }> {
  const coords = parseLatLng(link);
  try {
    if (coords) {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
        String(coords.lat)
      )}&lon=${encodeURIComponent(String(coords.lng))}&accept-language=ar`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "rukn-beihan-frontend/1.0",
        },
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.state;
        const street = addr.road || addr.neighbourhood || addr.suburb;
        return { city, street };
      }
    } else if (link) {
      const qParam = link.match(/q=([^&]+)/);
      const q = qParam ? decodeURIComponent(qParam[1]) : link;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=1&accept-language=ar`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "rukn-beihan-frontend/1.0",
        },
      });
      if (res.ok) {
        const arr = await res.json();
        if (Array.isArray(arr) && arr.length > 0) {
          const item = arr[0];
          const lat = item.lat;
          const lon = item.lon;
          return await reverseGeocode(`@${lat},${lon}`);
        }
      }
    }
  } catch (_) {}
  return {};
}

export const createAddress = async (payload: {
  userId: string | number;
  fullName: string;
  phone: string;
  city?: string;
  street?: string;
  locationUrl?: string;
  isDefault?: boolean;
}): Promise<string> => {
  let city = payload.city;
  let street = payload.street;
  if (!city || !street) {
    const resolved = await reverseGeocode(payload.locationUrl);
    city = city ?? resolved.city;
    street = street ?? resolved.street;
  }

  const res = await apiRequest<ApiCreateAddressResponse>("/addresses/create.php", {
    method: "POST",
    body: JSON.stringify({
      user_id: Number(payload.userId),
      full_name: payload.fullName,
      phone: payload.phone,
      ...(city ? { city } : {}),
      street: street ?? "Pinned Location",
      address: street ?? "Pinned Location",
      location_url: payload.locationUrl,
      is_default: payload.isDefault ? 1 : 0,
    }),
  });
  return String(res.address_id);
};
