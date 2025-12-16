import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Edit2, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { useAuth } from '@/context/AuthContext';
import reviewsData from '@/data/reviews.json';
import { toast } from 'sonner';

interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  commentAr: string;
  date: string;
  image?: string;
}

const AccountReviewsPage = () => {
  const { t, lang } = useLang();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    commentAr: '',
    image: '',
  });

  useEffect(() => {
    // Mock: Load reviews (يمكن لاحقًا ربطها بـ API)
    const userReviews = reviewsData.map((r: any) => ({
      ...r,
      productName: `Product #${r.productId}`,
    }));
    setReviews(userReviews);
  }, []);

  const handleOpenEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      comment: review.comment,
      commentAr: review.commentAr,
      image: review.image || '',
    });
    setDialogOpen(true);
  };

  const handleOpenNew = () => {
    setEditingReview(null);
    setFormData({
      rating: 5,
      comment: '',
      commentAr: '',
      image: '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingReview) {
      // Update existing review
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id
            ? { ...r, ...formData, date: new Date().toISOString() }
            : r
        )
      );
      toast.success(t('addresses.updated'));
    } else {
      // Add new review
      const newReview: Review = {
        id: Date.now().toString(),
        productId: '1',
        productName: 'Sample Product',
        userId: String(user?.id ?? '1'), // ✅ FIX: force string
        userName: user?.name || 'User',
        ...formData,
        date: new Date().toISOString(),
      };
      setReviews((prev) => [newReview, ...prev]);
      toast.success(t('reviews.submitted'));
    }

    setDialogOpen(false);
  };

  const handleDelete = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (reviewToDelete) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
      toast.success(t('addresses.deleted'));
    }
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onChange?: (rating: number) => void
  ) => (
    <div className="flex items-center gap-1" role="group" aria-label={t('reviews.yourRating')}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          aria-label={
            interactive
              ? `${t('reviews.yourRating')}: ${star}`
              : `${t('reviews.yourRating')}: ${rating}`
          }
          title={interactive ? `${star}` : undefined}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('reviews.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {reviews.length} {t('reviews.reviews')}
          </p>
        </div>

        <Button
          onClick={handleOpenNew}
          className="gold-gradient hover:shadow-gold transition-all duration-300"
          aria-label={t('reviews.writeReview')}
          title={t('reviews.writeReview')}
        >
          <Plus className="h-4 w-4 me-2" />
          {t('reviews.writeReview')}
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('reviews.noReviews')}</h3>
          <p className="text-muted-foreground mb-6">{t('account.startShopping')}</p>
          <Button asChild className="gold-gradient">
            <Link to="/catalog">{t('cart.continueShopping')}</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="premium-card overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{review.productId}
                      </Badge>
                      <span className="font-medium">{review.productName}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-foreground">
                      {lang === 'ar' ? review.commentAr : review.comment}
                    </p>

                    {review.image && (
                      <div className="mt-4">
                        <img
                          src={review.image}
                          alt={t('admin.imageUrl')}
                          className="h-20 w-20 object-cover rounded-lg border border-border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(review)}
                      aria-label={t('common.edit')}
                      title={t('common.edit')}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(review)}
                      aria-label={t('common.delete')}
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingReview ? t('common.edit') : t('reviews.writeReview')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>{t('reviews.yourRating')}</Label>
              <div className="flex justify-center py-2">
                {renderStars(formData.rating, true, (rating) =>
                  setFormData({ ...formData, rating })
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('reviews.yourComment')} (EN)</Label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder={t('reviews.commentPlaceholder')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('reviews.yourComment')} (AR)</Label>
              <Textarea
                value={formData.commentAr}
                onChange={(e) =>
                  setFormData({ ...formData, commentAr: e.target.value })
                }
                placeholder={t('reviews.commentPlaceholder')}
                rows={3}
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {t('admin.imageUrl')} ({t('common.or')} optional)
              </Label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} className="gold-gradient">
              {editingReview ? t('common.save') : t('reviews.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountReviewsPage;
