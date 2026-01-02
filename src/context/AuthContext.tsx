// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as authService from "@/services/authService";
import * as usersService from "@/services/usersService";
import { createNotification } from "@/services/notificationsService";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;

  // ✅ أضفناها عشان ProfilePage
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from server
  useEffect(() => {
    const load = async () => {
      try {
        const me = await usersService.getMe();
        setUser({
          id: Number(me.id),
          name: me.name,
          email: me.email,
          phone: me.phone,
          isAdmin: Boolean(me.isAdmin),
          avatarUrl: me.avatarUrl,
        });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const login = async (email: string, password: string) => {
    const u = await authService.login({ email, password });
    try {
      const full = await usersService.getMe();
      setUser({
        id: Number(full.id),
        name: full.name,
        email: full.email,
        phone: full.phone,
        isAdmin: Boolean(full.isAdmin),
        avatarUrl: full.avatarUrl,
      });
    } catch {
      setUser({
        id: Number(u.id),
        name: u.name,
        email: u.email,
        phone: u.phone,
        isAdmin: Boolean(u.is_admin),
      });
    }
    return true;
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    const userId = await authService.register(data);
    await createNotification({
      userId,
      titleEn: "Welcome to PowerCell!",
      titleAr: "مرحباً بك في PowerCell!",
      messageEn: "Thank you for registering with us. Start shopping now!",
      messageAr: "شكراً لإنشاء حسابك معنا. ابدأ التسوق الآن!",
      type: "info",
    });
    return true;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
