import { useEffect, useMemo, useState } from "react";
import { Trash2, Star } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLang } from "@/context/LangContext";
import { toast } from "sonner";
import { deleteReview, getAllReviewsAdmin, Review } from "@/services/reviewsService";

const AdminReviewsPage = () => {
  const { t, lang } = useLang();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getAllReviewsAdmin();
        if (!mounted) return;
        setReviews(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (mounted) setReviews([]);
        toast.error(t("common.error"));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReviews();
    return () => {
      mounted = false;
    };
  }, [t]);

  const handleDelete = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteReview(reviewToDelete.id);
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
      toast.success(t("admin.reviewDeleted"));
    } catch (e) {
      console.error(e);
      toast.error(t("admin.deleteFailed"));
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-primary fill-primary" : "text-muted"}`}
        />
      ))}
    </div>
  );

  const columns = useMemo(
    () => [
      { key: "id", header: "ID", className: "w-20" },
      {
        key: "productId",
        header: t("admin.product"),
        render: (r: Review) => `#${r.productId}`,
      },
      {
        key: "user",
        header: t("admin.user"),
        render: (r: Review) => r.userName,
      },
      {
        key: "rating",
        header: t("reviews.yourRating"),
        render: (r: Review) => renderStars(Number(r.rating) || 0),
      },
      {
        key: "comment",
        header: t("reviews.yourComment"),
        render: (r: Review) => (
          <p className="max-w-[240px] truncate">
            {lang === "ar" ? (r.commentAr || r.comment) : r.comment}
          </p>
        ),
      },
      {
        key: "date",
        header: t("admin.date"),
        render: (r: Review) => (r.date ? new Date(r.date).toLocaleDateString() : ""),
      },
      {
        key: "actions",
        header: t("admin.actions"),
        render: (r: Review) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleDelete(r)} aria-label={t("common.delete")}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [t, lang]
  );

  return (
    <AdminLayout>
      <AdminPageHeader title={t("admin.reviews")} breadcrumbs={[{ label: t("admin.reviews") }]} />

      <Card>
        <CardContent className="p-0">
          <AdminTable
            columns={columns}
            data={reviews}
            loading={loading}
            emptyMessage={t("admin.noReviews")}
          />
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.deleteReview")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.deleteReviewConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminReviewsPage;
