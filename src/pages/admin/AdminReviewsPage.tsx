import { useEffect, useState } from 'react';
import { Check, X, Trash2, Star } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import reviewsData from '@/data/reviews.json';
import { toast } from 'sonner';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  commentAr: string;
  date: string;
  status?: 'approved' | 'pending' | 'rejected';
}

// Local state for reviews
let localReviews: Review[] = reviewsData.map(r => ({ ...r, status: 'approved' as const }));

const AdminReviewsPage = () => {
  const { t, lang } = useLang();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  useEffect(() => {
    // Simulate async loading
    setTimeout(() => {
      setReviews([...localReviews]);
      setLoading(false);
    }, 300);
  }, []);

  const handleApprove = (review: Review) => {
    // TODO: Replace with actual API call to backend
    localReviews = localReviews.map(r =>
      r.id === review.id ? { ...r, status: 'approved' as const } : r
    );
    setReviews([...localReviews]);
    toast.success(t('admin.reviewApproved'));
  };

  const handleReject = (review: Review) => {
    // TODO: Replace with actual API call to backend
    localReviews = localReviews.map(r =>
      r.id === review.id ? { ...r, status: 'rejected' as const } : r
    );
    setReviews([...localReviews]);
    toast.success(t('admin.reviewRejected'));
  };

  const handleDelete = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (reviewToDelete) {
      // TODO: Replace with actual API call to backend
      localReviews = localReviews.filter(r => r.id !== reviewToDelete.id);
      setReviews([...localReviews]);
      toast.success(t('admin.reviewDeleted'));
    }
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-primary fill-primary' : 'text-muted'
          }`}
        />
      ))}
    </div>
  );

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const columns = [
    { key: 'id', header: 'ID', className: 'w-20' },
    { 
      key: 'productId', 
      header: t('admin.product'),
      render: (review: Review) => `#${review.productId}`,
    },
    { 
      key: 'user', 
      header: t('admin.user'),
      render: (review: Review) => review.userName,
    },
    { 
      key: 'rating', 
      header: t('reviews.yourRating'),
      render: (review: Review) => renderStars(review.rating),
    },
    { 
      key: 'comment', 
      header: t('reviews.yourComment'),
      render: (review: Review) => (
        <p className="max-w-[200px] truncate">
          {lang === 'ar' ? review.commentAr : review.comment}
        </p>
      ),
    },
    { 
      key: 'date', 
      header: t('admin.date'),
      render: (review: Review) => new Date(review.date).toLocaleDateString(),
    },
    { 
      key: 'status', 
      header: t('admin.status'),
      render: (review: Review) => (
        <Badge variant={getStatusBadgeVariant(review.status)}>
          {review.status === 'approved' ? t('admin.approved') :
           review.status === 'rejected' ? t('admin.rejected') :
           t('admin.pending')}
        </Badge>
      ),
    },
    { 
      key: 'actions', 
      header: t('admin.actions'),
      render: (review: Review) => (
        <div className="flex items-center gap-1">
          {review.status !== 'approved' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleApprove(review)}
              title={t('admin.approve')}
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
          )}
          {review.status !== 'rejected' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleReject(review)}
              title={t('admin.reject')}
            >
              <X className="h-4 w-4 text-destructive" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(review)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('admin.reviews')}
        breadcrumbs={[{ label: t('admin.reviews') }]}
      />

      <Card>
        <CardContent className="p-0">
          <AdminTable
            columns={columns}
            data={reviews}
            loading={loading}
            emptyMessage={t('admin.noReviews')}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.deleteReview')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.deleteReviewConfirm')}
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

export default AdminReviewsPage;
