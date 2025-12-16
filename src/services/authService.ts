// src/services/authService.ts
import {
  apiRequest,
  ApiAuthMeResponse,
  ApiAuthLoginResponse,
  ApiAuthRegisterResponse,
  ApiOkResponse,
} from "./api";

export const authMe = async () => {
  const res = await apiRequest<ApiAuthMeResponse>("/auth/me.php");
  return res.user;
};

export const login = async (payload: { email: string; password: string }) => {
  const res = await apiRequest<ApiAuthLoginResponse>("/auth/login.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.user;
};

export const register = async (payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const res = await apiRequest<ApiAuthRegisterResponse>("/auth/register.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.user_id;
};

export const logout = async () => {
  await apiRequest<ApiOkResponse>("/auth/logout.php", { method: "POST" });
  return true;
};
