import { useEffect, useMemo, useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminUsersPage = () => {
  const { t } = useLang();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'status' | 'role'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (user: User) => {
    await updateUserRole(user.id, !user.isAdmin);
    setUsers(users.map(u =>
      u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u
    ));
    toast.success(t('admin.userUpdated'));
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await updateUserStatus(user.id, newStatus);
    setUsers(users.map(u =>
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    toast.success(t('admin.userUpdated'));
  };

  const filteredAndSortedUsers = useMemo(() => {
    // Filter by role (admin/user/all)
    let arr = users.filter(u =>
      roleFilter === 'all' ? true : roleFilter === 'admin' ? u.isAdmin : !u.isAdmin
    );

    // Sort by selected field and direction
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'createdAt') {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      }
      if (sortBy === 'name') {
        const an = a.name ?? '';
        const bn = b.name ?? '';
        return an.localeCompare(bn) * dir;
      }
      if (sortBy === 'status') {
        const as = a.status ?? '';
        const bs = b.status ?? '';
        return as.localeCompare(bs) * dir;
      }
      if (sortBy === 'role') {
        return (Number(a.isAdmin) - Number(b.isAdmin)) * dir;
      }
      return 0;
    });
    return arr;
  }, [users, roleFilter, sortBy, sortDir]);

  const columns = [
    { 
      key: 'avatar',
      header: '',
      className: 'w-16',
      render: (user: User) => (
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name?.slice(0, 1) || '?'}</AvatarFallback>
        </Avatar>
      ),
    },
    { key: 'id', header: t('admin.id'), className: 'w-20' },
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
        actions={
          <div className="flex items-center gap-2">
            {/* Role filter: admin/user/all */}
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t('admin.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.all')}</SelectItem>
                <SelectItem value="admin">{t('admin.admin')}</SelectItem>
                <SelectItem value="user">{t('admin.user')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort by field: name/date/status/role */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('products.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t('auth.name')}</SelectItem>
                <SelectItem value="createdAt">{t('admin.createdAt')}</SelectItem>
                <SelectItem value="status">{t('admin.status')}</SelectItem>
                <SelectItem value="role">{t('admin.role')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort direction: asc/desc */}
            <Select value={sortDir} onValueChange={(v) => setSortDir(v as typeof sortDir)}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder={t('products.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">{t('admin.sortAsc')}</SelectItem>
                <SelectItem value="desc">{t('admin.sortDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <AdminTable
            columns={columns}
            data={filteredAndSortedUsers}
            loading={loading}
            emptyMessage={t('admin.noUsers')}
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsersPage;
