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

export interface ReviewListParams {
  page?: number;
  limit?: number;
  filters?: {
    product_id?: number;
    rating?: number;
  };
}

export const reviewService = {
  list: async (params: ReviewListParams = {}): Promise<{ data: Review[]; pagination: { total: number } }> => {
    const { data } = await apiClient.post("/reviews", {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      filters: params.filters ?? {},
    });
    return { data: data.payload ?? data.data ?? [], pagination: data.pagination ?? { total: 0 } };
  },
};
