import { apiRequest, ApiOkResponse, API_BASE } from "./api";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  is_admin: boolean;
  status?: "active" | "inactive";
  created_at: string;
  avatar_url?: string | null;
  auth_token?: string | null;
};

type ApiUsersListResponse = {
  success: boolean;
  users: ApiUser[];
};

type ApiUserGetResponse = {
  success: boolean;
  user: ApiUser;
};

type ApiMeResponse = {
  success: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    is_admin: boolean;
    created_at: string;
    avatar_url?: string | null;
    auth_token?: string | null;
  };
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
  status: "active" | "inactive";
  avatarUrl: string;
  authToken?: string;
}

function mapApiUser(u: ApiUser): User {
  const base = API_BASE.replace(/\/api$/, "");
  const resolveUrl = (p?: string | null) => {
    const s = String(p ?? "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/")) return `${base}${s}`;
    return `${base}/${s}`;
  };
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    isAdmin: Boolean(u.is_admin),
    status: u.status ?? "active",
    createdAt: u.created_at,
    avatarUrl: resolveUrl(u.avatar_url),
    authToken: u.auth_token ? String(u.auth_token) : undefined,
  };
}

export const getUsers = async (): Promise<User[]> => {
  const data = await apiRequest<ApiUsersListResponse>("/users/list.php");
  return (data.users ?? []).map(mapApiUser);
};

export const getUserById = async (id: string): Promise<User | null> => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  try {
    const data = await apiRequest<ApiUserGetResponse>(`/users/get.php?id=${numericId}`);
    return mapApiUser(data.user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
      return null;
    }
    throw e;
  }
};

export const updateUserRole = async (userId: string, isAdmin: boolean): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/users/update.php", {
    method: "POST",
    body: JSON.stringify({
      id: Number(userId),
      is_admin: isAdmin,
    }),
  });
  return true;
};

export const updateUserStatus = async (userId: string, status: "active" | "inactive"): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/users/update.php", {
    method: "POST",
    body: JSON.stringify({
      id: Number(userId),
      status,
    }),
  });
  return true;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/users/delete.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(userId) }),
  });
  return true;
};

export const getMe = async (): Promise<User> => {
  const data = await apiRequest<ApiMeResponse>("/auth/me.php");
  return mapApiUser(data.user as unknown as ApiUser);
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append("image", file);
  const data = await apiRequest<{ success: boolean; avatar_url: string }>("/users/upload-avatar.php", {
    method: "POST",
    body: form,
  });
  const base = API_BASE.replace(/\/api$/, "");
  const s = String(data.avatar_url ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return `${base}${s}`;
  return `${base}/${s}`;
};

export const googleLogin = async (idToken: string): Promise<User> => {
  const data = await apiRequest<{ success: boolean; user: ApiUser }>("/auth/google-login.php", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
  return mapApiUser(data.user);
};
