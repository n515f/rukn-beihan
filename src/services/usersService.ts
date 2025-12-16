// src/services/usersService.ts
// Service layer for users (Admin & Account)
// Uses shared apiRequest from src/services/api.ts

import { apiRequest, ApiOkResponse } from "./api";

/**
 * Backend user shape (PHP API)
 * users/list.php returns:
 * {
 *   success: true,
 *   users: [
 *     {
 *       id,
 *       name,
 *       email,
 *       phone,
 *       is_admin,
 *       status,
 *       created_at
 *     }
 *   ]
 * }
 */
type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  is_admin: boolean;
  status: "active" | "inactive";
  created_at: string;
};

type ApiUsersListResponse = {
  success: boolean;
  users: ApiUser[];
};

type ApiUserGetResponse = {
  success: boolean;
  user: ApiUser;
};

/**
 * UI User shape used across React app
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
  status: "active" | "inactive";
}

/**
 * Map API user -> UI user
 */
function mapApiUser(u: ApiUser): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    isAdmin: Boolean(u.is_admin),
    status: u.status,
    createdAt: u.created_at,
  };
}

// =======================
// ADMIN
// =======================

export const getUsers = async (): Promise<User[]> => {
  const data = await apiRequest<ApiUsersListResponse>("/users/list.php");
  return (data.users ?? []).map(mapApiUser);
};

export const getUserById = async (
  id: string
): Promise<User | null> => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  try {
    const data = await apiRequest<ApiUserGetResponse>(
      `/users/get.php?id=${numericId}`
    );
    return mapApiUser(data.user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
      return null;
    }
    throw e;
  }
};

export const updateUserRole = async (
  userId: string,
  isAdmin: boolean
): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/users/update.php", {
    method: "POST",
    body: JSON.stringify({
      id: Number(userId),
      is_admin: isAdmin,
    }),
  });

  return true;
};

export const updateUserStatus = async (
  userId: string,
  status: "active" | "inactive"
): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/users/update.php", {
    method: "POST",
    body: JSON.stringify({
      id: Number(userId),
      status,
    }),
  });

  return true;
};

export const deleteUser = async (
  userId: string
): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/users/delete.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(userId) }),
  });

  return true;
};

// =======================
// ACCOUNT (optional future use)
// =======================

export const getMe = async (): Promise<User> => {
  const data = await apiRequest<ApiUserGetResponse>("/auth/me.php");
  return mapApiUser(data.user);
};
