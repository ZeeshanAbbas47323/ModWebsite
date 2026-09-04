import apiClient from "@/lib/axios";

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: number | null;
  sort_order?: number;
  is_active?: boolean;
  parent?: ProductCategory | null;
  children?: ProductCategory[];
  _count?: { products: number };
}

export const productCategoryService = {
  list: async (parentId?: number | null): Promise<ProductCategory[]> => {
    // GET so the response is cacheable by URL.
    const query =
      parentId !== undefined ? `?parent_id=${parentId ?? ""}` : "";
    const { data } = await apiClient.get(`/product-categories${query}`);
    return data.payload ?? data.data ?? [];
  },

  bySlug: async (slug: string): Promise<ProductCategory | null> => {
    const { data } = await apiClient.get(
      `/product-categories?slug=${encodeURIComponent(slug)}`
    );
    const categories: ProductCategory[] = data.payload ?? data.data ?? [];
    return categories[0] ?? null;
  },
};
