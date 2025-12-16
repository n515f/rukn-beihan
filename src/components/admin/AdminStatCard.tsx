import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const AdminStatCard = ({ title, value, icon: Icon, trend, className }: AdminStatCardProps) => {
  return (
    <Card className={cn('hover-lift', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            {trend && (
              <p
                className={cn(
                  'text-xs mt-1',
                  trend.isPositive ? 'text-green-500' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStatCard;
