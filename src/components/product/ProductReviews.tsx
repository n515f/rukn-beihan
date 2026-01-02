import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { getReviewsByProduct, addReview, Review } from '@/services/reviewsService';
import { toast } from 'sonner';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { t, lang } = useLang();
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const canSubmit =
    isAuthenticated && !!user && newComment.trim().length > 0 && !submitting;

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getReviewsByProduct(productId);
        if (!mounted) return;
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (productId) fetchReviews();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const renderStars = (
    rating: number,
    interactive = false,
    size = 'h-5 w-5'
  ) => {
    const value = interactive ? hoverRating || newRating : rating;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= value ? 'fill-primary text-primary' : 'text-muted-foreground'
            } ${interactive ? 'cursor-pointer transition-colors' : ''}`}
            onClick={interactive ? () => setNewRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const comment = newComment.trim();
    if (!comment) return;

    setSubmitting(true);
    try {
      const created = await addReview({
  product_id: productId,
  user_id: user.id,
  rating: newRating,
  review_text: comment,
});


      setReviews((prev) => [created, ...prev]);
      setNewComment('');
      setNewRating(5);
      setHoverRating(0);

      toast.success(t('reviews.submitted'));
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(t('reviews.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">
            {averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">{t('reviews.outOf5')}</div>
        </div>
        <div>
          {renderStars(averageRating)}
          <p className="text-sm text-muted-foreground mt-1">
            {reviews.length} {t('reviews.reviews')}
          </p>
        </div>
      </div>

      {/* Add Review Form */}
      {isAuthenticated ? (
        <Card className="p-4">
          <h4 className="font-semibold mb-4">{t('reviews.writeReview')}</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">{t('reviews.yourRating')}</label>
              {renderStars(newRating, true, 'h-8 w-8')}
            </div>

            <div>
              <label className="block text-sm mb-2">{t('reviews.yourComment')}</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('reviews.commentPlaceholder')}
                rows={3}
                required
              />
            </div>

            <Button type="submit" disabled={!canSubmit}>
              {submitting ? t('common.loading') : t('reviews.submit')}
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground">{t('reviews.loginToReview')}</p>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t('reviews.noReviews')}</p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{review.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.date ? new Date(review.date).toLocaleDateString() : ''}
                  </p>
                </div>
                {renderStars(Number(review.rating) || 0)}
              </div>

              <p className="text-muted-foreground">
                {lang === 'ar' ? (review.commentAr || review.comment) : review.comment}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
