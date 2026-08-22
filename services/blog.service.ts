import apiClient from "@/lib/axios";

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string;
  status: string;
  published_at: string;
  meta_title: string;
  meta_description: string;
  view_count: number;
  humanize_status: string;
}

export interface BlogListFilters {
  category?: string;
  tags?: string;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  filters?: BlogListFilters;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BlogListResponse {
  payload: Blog[];
  pagination: Pagination;
}

export interface BlogDetailResponse {
  payload: Blog;
}

export const blogService = {
  list: async (params: BlogListParams): Promise<BlogListResponse> => {
    const { data } = await apiClient.post<BlogListResponse>("/blogs", {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      filters: params.filters ?? {},
    });
    return data;
  },

  detail: async (slug: string): Promise<Blog> => {
    const { data } = await apiClient.get<BlogDetailResponse>(`/blogs/${slug}`);
    return data.payload;
  },
};
