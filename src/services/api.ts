// src/services/api.ts
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost/rukn-api/api";

export type ApiErrorResponse = {
  success?: boolean;
  error?: string;
};

export type ApiOkResponse = {
  success: boolean;
};

// ===== Auth response types (used by authService.ts) =====
export type ApiAuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_admin: boolean;
  created_at?: string;
};

export type ApiAuthMeResponse = {
  success: boolean;
  user: ApiAuthUser | null;
};

export type ApiAuthLoginResponse = {
  success: boolean;
  user: ApiAuthUser;
};

export type ApiAuthRegisterResponse = {
  success: boolean;
  user_id: number;
};
// =======================================================

function buildHeaders(options: RequestInit): HeadersInit {
  const headers: Record<string, string> = {};

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  // لا تضع Content-Type عند FormData (المتصفح يضع boundary تلقائياً)
  if (options.body != null && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const extra = (options.headers as Record<string, string> | undefined) ?? {};
  return { ...headers, ...extra };
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: "include", // مهم لجلسات PHP
      ...options,
      headers: buildHeaders(options),
    });
  } catch {
    throw new Error("Network error: cannot reach API server.");
  }

  const raw = await res.text();

  let data: (T & ApiErrorResponse) | ApiErrorResponse;
  try {
    data = (raw ? JSON.parse(raw) : {}) as T & ApiErrorResponse;
  } catch {
    const preview = raw.slice(0, 200).replace(/\s+/g, " ").trim();
    throw new Error(
      `Invalid API response (not JSON). Status: ${res.status}. Preview: ${preview}`
    );
  }

  if (!res.ok || data.success === false) {
    const msg =
      data.error || `API error: ${res.status} ${res.statusText} (${path})`;
    throw new Error(msg);
  }

  return data as T;
}
