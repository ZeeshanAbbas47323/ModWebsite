import apiClient from "@/lib/axios";

export interface SearchResult {
  query: string;
  total: number;
  products: Array<{ id: number; name: string; slug: string; base_price: number; image_url?: string }>;
  categories: Array<{ id: number; name: string; slug?: string }>;
  blogs: Array<{ id: number; title: string; slug: string }>;
  pages: Array<{ id: number; title: string; slug: string }>;
}

export const searchService = {
  search: async (query: string, types?: string[], limit = 5): Promise<SearchResult> => {
    const { data } = await apiClient.post("/search", {
      query,
      ...(types ? { types } : {}),
      limit,
    });
    return data.payload;
  },
};
