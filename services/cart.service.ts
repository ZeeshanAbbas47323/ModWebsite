import apiClient from "@/lib/axios";
import { omitEmpty } from "@/lib/utils";
import type { Product, ProductVariant } from "@/services/product.service";

export type PrintMethod =
  | "dtf"
  | "dtg"
  | "screen_print"
  | "embroidery"
  | "sublimation"
  | "uv_dtf"
  | "vinyl";

export interface DesignUploadInput {
  file_url: string;
  file_name: string;
  edit_url?: string;
  print_method?: PrintMethod;
}

/** A cart row as returned by the API for a logged-in customer. */
export interface ServerCartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  print_method: PrintMethod | null;
  custom_text: string | null;
  is_active: boolean;
  product?: Product;
  variant?: ProductVariant;
}

export interface CreateCartItemInput {
  product_id: number;
  variant_id?: number | null;
  quantity?: number;
  print_method?: PrintMethod | null;
  custom_text?: string | null;
  design_uploads?: DesignUploadInput[];
}

export interface UpdateCartItemInput {
  variant_id?: number | null;
  quantity?: number;
  print_method?: PrintMethod | null;
  custom_text?: string | null;
}

export const cartService = {
  list: async (): Promise<ServerCartItem[]> => {
    const { data } = await apiClient.post("/cart-items", {
      page: 1,
      limit: 100,
      filters: { is_active: true },
    });
    return data.payload ?? data.data ?? [];
  },

  create: async (input: CreateCartItemInput): Promise<ServerCartItem> => {
    const { data } = await apiClient.post(
      "/cart-items?action=create",
      omitEmpty({ quantity: 1, ...input })
    );
    return data.payload ?? data.data ?? data;
  },

  update: async (id: number, input: UpdateCartItemInput): Promise<ServerCartItem> => {
    const { data } = await apiClient.put(`/cart-items/${id}`, omitEmpty(input));
    return data.payload ?? data.data ?? data;
  },

  remove: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/cart-items/${id}`);
    } catch {
      // The shared soft-delete endpoint writes deleted_by/deleted_at, which
      // CartItem does not have, so it fails server-side. Deactivating the row
      // has the same effect here because list() only asks for is_active rows.
      // Remove this fallback once the delete endpoint handles cartItem.
      await apiClient.put(`/cart-items/${id}`, { is_active: false });
    }
  },
};
