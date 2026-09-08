import apiClient from "@/lib/axios";

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  video_url: string;
  is_verified: boolean;
  helpful_count: number;
  status: string;
  user?: { full_name: string };
  created_at: string;
}

/** Aggregates the list endpoint returns alongside the rows. */
export interface ReviewSummary {
  total_reviews: number;
  average_rating: number;
  /** Count per star, keyed 1–5. */
  rating_distribution: Record<number, number>;
  verified_reviews_count: number;
  recommendation_percentage: number;
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  filters?: {
    product_id?: number;
    rating?: number;
  };
}

export interface ReviewListResult {
  data: Review[];
  pagination: { total: number };
  summary: ReviewSummary;
}

export interface CreateReviewInput {
  product_id: number;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  video_url?: string;
}

const EMPTY_SUMMARY: ReviewSummary = {
  total_reviews: 0,
  average_rating: 0,
  rating_distribution: {},
  verified_reviews_count: 0,
  recommendation_percentage: 0,
};

export const reviewService = {
  list: async (params: ReviewListParams = {}): Promise<ReviewListResult> => {
    const { data } = await apiClient.post("/reviews", {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      filters: params.filters ?? {},
    });
    return {
      data: data.payload ?? data.data ?? [],
      pagination: data.pagination ?? { total: 0 },
      // The rating average lives here, not on the rows — without it the star
      // display has nothing to render but a guess.
      summary: data.summary ?? EMPTY_SUMMARY,
    };
  },

  /** Submit a review. Requires a signed-in customer. */
  create: async (input: CreateReviewInput): Promise<Review> => {
    const { data } = await apiClient.post("/reviews?action=create", input);
    return (data.payload ?? data.data) as Review;
  },

  /** Rating average and distribution without pulling the review rows. */
  summary: async (productId: number): Promise<ReviewSummary> => {
    const { data } = await apiClient.get(`/reviews/summary/${productId}`);
    return (data.payload ?? data.data ?? EMPTY_SUMMARY) as ReviewSummary;
  },

  markHelpful: async (reviewId: number): Promise<void> => {
    await apiClient.post(`/reviews/${reviewId}/helpful`, {});
  },
};
