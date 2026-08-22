import apiClient from "@/lib/axios";

export interface ProductCategory {
  id: number;
  name: string;
  description: string;
  image_url: string;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  _count?: { products: number };
}

export const productCategoryService = {
  list: async (parentId?: number | null): Promise<ProductCategory[]> => {
    const { data } = await apiClient.post("/product-categories", {
      page: 1,
      limit: 50,
      filters: {
        is_active: true,
        ...(parentId !== undefined ? { parent_id: parentId } : {}),
      },
    });
    return data.payload ?? data.data ?? [];
  },
};
