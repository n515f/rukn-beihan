// src/services/reviewsService.ts
// Service layer for product reviews
// Uses shared apiRequest from src/services/api.ts

import { apiRequest, ApiOkResponse } from "./api";

/**
 * Backend review shape (PHP API)
 * reviews/list.php?product_id=ID returns:
 * {
 *   success: true,
 *   reviews: [
 *     {
 *       id,
 *       product_id,
 *       user_id,
 *       user_name,
 *       rating,
 *       comment_en,
 *       comment_ar,
 *       created_at
 *     }
 *   ]
 * }
 */
type ApiReview = {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment_en: string;
  comment_ar?: string | null;
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

/**
 * UI Review shape used across React app
 */
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

/**
 * Map API review -> UI review
 */
function mapApiReview(r: ApiReview): Review {
  return {
    id: String(r.id),
    productId: String(r.product_id),
    userId: String(r.user_id),
    userName: r.user_name,
    rating: Number(r.rating),
    comment: r.comment_en,
    commentAr: r.comment_ar ?? "",
    date: r.created_at,
  };
}

// =======================
// PUBLIC (Product pages)
// =======================

export const getReviewsByProduct = async (
  productId: string
): Promise<Review[]> => {
  const numericId = Number(productId);
  if (!Number.isFinite(numericId)) return [];

  const data = await apiRequest<ApiReviewsListResponse>(
    `/reviews/list.php?product_id=${numericId}`
  );

  return (data.reviews ?? []).map(mapApiReview);
};

export const getAverageRating = async (
  productId: string
): Promise<number> => {
  const reviews = await getReviewsByProduct(productId);
  if (reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
};

// =======================
// USER (after order completion)
// =======================

export const addReview = async (payload: {
  product_id: number | string;
  user_id: number | string;
  rating: number;
  comment_en: string;
  comment_ar?: string;
}): Promise<Review> => {
  const res = await apiRequest<ApiCreateReviewResponse>(
    "/reviews/create.php",
    {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        product_id: Number(payload.product_id),
        user_id: Number(payload.user_id),
      }),
    }
  );

  // Fetch fresh reviews to return the created one mapped
  const reviews = await getReviewsByProduct(String(payload.product_id));
  const created = reviews.find((r) => r.id === String(res.review_id));

  if (!created) {
    throw new Error("Review created but not found in list");
  }

  return created;
};

export const getUserReviews = async (
  userId: string
): Promise<Review[]> => {
  const numericId = Number(userId);
  if (!Number.isFinite(numericId)) return [];

  const data = await apiRequest<ApiReviewsListResponse>(
    `/reviews/list.php?user_id=${numericId}`
  );

  return (data.reviews ?? []).map(mapApiReview);
};

// =======================
// ADMIN
// =======================

export const deleteReview = async (
  reviewId: number | string
): Promise<boolean> => {
  await apiRequest<ApiOkResponse>("/reviews/delete.php", {
    method: "POST",
    body: JSON.stringify({ id: Number(reviewId) }),
  });

  return true;
};
