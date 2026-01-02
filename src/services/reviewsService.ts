// src/services/reviewsService.ts
// Service layer for product reviews
import { apiRequest, ApiOkResponse } from "./api";

/**
 * Backend:
 * - GET /reviews/list.php?product_id=ID  -> returns review_text
 * - POST /reviews/create.php expects: product_id, user_id, rating, review_text
 */
type ApiReview = {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
};

type ApiReviewsListResponse = {
  success: boolean;
  reviews: ApiReview[];
};

type ApiCreateReviewResponse = {
  success: boolean;
  review_id: number;
};

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  commentAr: string;
  date: string;
}

function mapApiReview(r: ApiReview): Review {
  const text = (r.review_text ?? "").toString();
  return {
    id: String(r.id),
    productId: String(r.product_id),
    userId: String(r.user_id),
    userName: (r.user_name ?? "User").toString(),
    rating: Number(r.rating),
    comment: text,
    // backend عندك حقل واحد فقط، نخلي العربي نفس النص
    commentAr: text,
    date: r.created_at,
  };
}

// =======================
// PUBLIC (Product pages)
// =======================

export const getReviewsByProduct = async (productId: string): Promise<Review[]> => {
  const numericId = Number(productId);
  if (!Number.isFinite(numericId)) return [];

  const data = await apiRequest<ApiReviewsListResponse>(
    `/reviews/list.php?product_id=${encodeURIComponent(String(numericId))}`
  );

  return (data.reviews ?? []).map(mapApiReview);
};

export const getAverageRating = async (productId: string): Promise<number> => {
  const reviews = await getReviewsByProduct(productId);
  if (reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return Number((sum / reviews.length).toFixed(1));
};

// =======================
// USER (create)
// =======================

export const addReview = async (payload: {
  product_id: number | string;
  user_id: number | string;
  rating: number;
  // عندنا بالنظام حقل واحد فقط في DB
  review_text: string;
}): Promise<Review> => {
  const res = await apiRequest<ApiCreateReviewResponse>("/reviews/create.php", {
    method: "POST",
    body: JSON.stringify({
      product_id: Number(payload.product_id),
      user_id: Number(payload.user_id),
      rating: Number(payload.rating),
      review_text: payload.review_text,
    }),
  });

  // رجّع أحدث تعليق تم إنشاؤه
  const reviews = await getReviewsByProduct(String(payload.product_id));
  const created = reviews.find((r) => r.id === String(res.review_id));
  if (!created) throw new Error("Review created but not found in list");
  return created;
};

// =======================
// ADMIN
// =======================

export const getAllReviewsAdmin = async (): Promise<Review[]> => {
  const data = await apiRequest<ApiReviewsListResponse>("/reviews/list.php");
  return (data.reviews ?? []).map(mapApiReview);
};

export const deleteReview = async (reviewId: number | string): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/reviews/delete.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(reviewId) }),
  });
  return true;
};
