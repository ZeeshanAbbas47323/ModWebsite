import apiClient from "@/lib/axios";
import { omitEmpty } from "@/lib/utils";
import type { Product, ProductVariant } from "@/services/product.service";

/** A wishlist row as returned for a logged-in customer. */
export interface ServerWishlistItem {
  id: number;
  user_id?: number;
  product_id: number;
  variant_id: number | null;
  is_active?: boolean;
  product?: Product;
  variant?: ProductVariant;
}

export interface CreateWishlistInput {
  product_id: number;
  variant_id?: number | null;
}

export const wishlistService = {
  list: async (): Promise<ServerWishlistItem[]> => {
    const { data } = await apiClient.post("/wishlists", {
      page: 1,
      limit: 100,
      filters: { is_active: true },
    });
    return data.payload ?? data.data ?? [];
  },

  create: async (input: CreateWishlistInput): Promise<ServerWishlistItem> => {
    const { data } = await apiClient.post(
      "/wishlists?action=create",
      omitEmpty(input)
    );
    return data.payload ?? data.data ?? data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/wishlists/${id}`);
  },
};
