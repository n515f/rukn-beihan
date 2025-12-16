import { useEffect, useState } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLang } from '@/context/LangContext';
import { getUsers, User, updateUserRole, updateUserStatus } from '@/services/usersService';
import { toast } from 'sonner';

const AdminUsersPage = () => {
  const { t } = useLang();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (user: User) => {
    // TODO: Replace with actual API call to backend
    await updateUserRole(user.id, !user.isAdmin);
    setUsers(users.map(u =>
      u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u
    ));
    toast.success(t('admin.userUpdated'));
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    // TODO: Replace with actual API call to backend
    await updateUserStatus(user.id, newStatus);
    setUsers(users.map(u =>
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    toast.success(t('admin.userUpdated'));
  };

  const columns = [
    { key: 'id', header: 'ID', className: 'w-20' },
    { 
      key: 'name', 
      header: t('auth.name'),
      render: (user: User) => (
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    { 
      key: 'phone', 
      header: t('auth.phone'),
    },
    { 
      key: 'role', 
      header: t('admin.role'),
      render: (user: User) => (
        <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
          {user.isAdmin ? t('admin.admin') : t('admin.user')}
        </Badge>
      ),
    },
    { 
      key: 'status', 
      header: t('admin.status'),
      render: (user: User) => (
        <Badge variant={user.status === 'active' ? 'outline' : 'destructive'}>
          {user.status === 'active' ? t('admin.active') : t('admin.inactive')}
        </Badge>
      ),
    },
    { 
      key: 'createdAt', 
      header: t('admin.createdAt'),
      render: (user: User) => new Date(user.createdAt).toLocaleDateString(),
    },
    { 
      key: 'actions', 
      header: t('admin.actions'),
      render: (user: User) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleAdmin(user)}
            title={user.isAdmin ? t('admin.removeAdmin') : t('admin.makeAdmin')}
          >
            {user.isAdmin ? (
              <ShieldOff className="h-4 w-4 text-destructive" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={user.status === 'active' ? 'ghost' : 'default'}
            size="sm"
            onClick={() => handleToggleStatus(user)}
          >
            {user.status === 'active' ? t('admin.deactivate') : t('admin.activate')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('admin.users')}
        breadcrumbs={[{ label: t('admin.users') }]}
      />

      <Card>
        <CardContent className="p-0">
          <AdminTable
            columns={columns}
            data={users}
            loading={loading}
            emptyMessage={t('admin.noUsers')}
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsersPage;
