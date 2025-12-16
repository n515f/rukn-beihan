// src/components/auth/AdminGuard.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
