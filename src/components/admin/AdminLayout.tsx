import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAuthenticated } = useAuth();
  const { lang } = useLang();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed top-0 h-screen w-64 bg-card border-e border-border z-40 transition-transform duration-300 lg:hidden',
          lang === 'ar' ? 'right-0' : 'left-0',
          mobileMenuOpen
            ? 'translate-x-0'
            : lang === 'ar'
            ? 'translate-x-full'
            : '-translate-x-full'
        )}
      >
        <AdminSidebar
          collapsed={false}
          onToggle={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed 
            ? (lang === 'ar' ? 'lg:mr-16' : 'lg:ml-16')
            : (lang === 'ar' ? 'lg:mr-64' : 'lg:ml-64')
        )}
      >
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
