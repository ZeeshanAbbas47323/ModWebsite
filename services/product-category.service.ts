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
  /**
   * `GET /product-categories` never existed (only `POST /product-categories`,
   * staff-only) — this call 404'd silently on every load, so the home page
   * always fell back to its hardcoded placeholder categories instead of the
   * real ones. The only public route is `POST /product-categories/frontend`,
   * which also enforces `is_active` server-side.
   */
  list: async (parentId?: number | null): Promise<ProductCategory[]> => {
    const filters: Record<string, unknown> = {};
    if (parentId !== undefined) filters.parent_id = parentId;
    const { data } = await apiClient.post("/product-categories/frontend", {
      page: 1,
      limit: 100,
      filters,
    });
    return data.payload ?? data.data ?? [];
  },

  bySlug: async (slug: string): Promise<ProductCategory | null> => {
    const { data } = await apiClient.post("/product-categories/frontend", {
      page: 1,
      limit: 1,
      filters: { slug },
    });
    const categories: ProductCategory[] = data.payload ?? data.data ?? [];
    return categories[0] ?? null;
  },
};
