import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '@/context/LangContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const AdminPageHeader = ({ title, description, breadcrumbs, actions }: AdminPageHeaderProps) => {
  const { t } = useLang();

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <Link to="/admin" className="hover:text-foreground transition-colors">
            {t('admin.dashboard')}
          </Link>
          {breadcrumbs.map((item, index) => (
            <span key={index} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4" />
              {item.href ? (
                <Link to={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default AdminPageHeader;
