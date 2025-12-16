import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getProducts, Product } from '@/services/productsService';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Local state for products
let localProducts: Product[] = [];

const AdminProductsPage = () => {
  const { t } = useLang();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (localProducts.length === 0) {
        const data = await getProducts();
        localProducts = [...data];
      }
      setProducts([...localProducts]);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      // TODO: Replace with actual API call to backend
      localProducts = localProducts.filter(p => p.id !== productToDelete.id);
      setProducts([...localProducts]);
      toast.success(t('admin.productDeleted'));
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('admin.products')}
        breadcrumbs={[{ label: t('admin.products') }]}
        actions={
          <Button onClick={() => navigate('/admin/products/new')}>
            <Plus className="h-4 w-4 me-2" />
            {t('admin.addProduct')}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">{t('common.loading')}</div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">{t('admin.noProducts')}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>{t('admin.productName')}</TableHead>
                    <TableHead>{t('admin.brand')}</TableHead>
                    <TableHead>{t('products.category')}</TableHead>
                    <TableHead>{t('admin.price')}</TableHead>
                    <TableHead>{t('admin.stock')}</TableHead>
                    <TableHead>{t('admin.status')}</TableHead>
                    <TableHead className="text-end">{t('admin.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs">#{product.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                          {product.stock > 0 ? t('products.inStock') : t('products.outOfStock')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/products/${product.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.deleteProduct')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.deleteProductConfirm')} "{productToDelete?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProductsPage;
