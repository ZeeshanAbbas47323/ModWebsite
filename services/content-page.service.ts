import apiClient from "@/lib/axios";

export interface ContentPage {
  id: number | string;
  title: string;
  slug: string;
  content: string;
  content_type?: string;
  meta_title?: string;
  meta_desc?: string;
  meta_keywords?: string;
  canonical_url?: string;
  featured_image?: string;
}

export interface ContentPageFilters {
  id?: number | string;
  slug?: string;
  content_type?: string;
}

export const contentPageService = {

  find: async (filters: ContentPageFilters): Promise<ContentPage | null> => {
    const { data } = await apiClient.post("/content-pages", {
      page: 1,
      limit: 1,
      filters: { is_active: true, ...filters },
    });
    const pages: ContentPage[] = data.payload ?? data.data ?? [];
    return pages[0] ?? null;
  },
};
