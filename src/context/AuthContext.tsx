// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as authService from "@/services/authService";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await authService.authMe();
        if (me) {
          setUser({
            id: Number(me.id),
            name: me.name,
            email: me.email,
            phone: me.phone,
            isAdmin: Boolean(me.is_admin),
          });
        } else {
          setUser(null);
        }
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
    setUser({
      id: Number(u.id),
      name: u.name,
      email: u.email,
      phone: u.phone,
      isAdmin: Boolean(u.is_admin),
    });
    return true;
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    await authService.register(data);
    return true;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
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
