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


export interface DesignUpload {
  id: number;
  user_id?: number;
  file_url: string;
  file_name?: string | null;
  edit_url?: string | null;
  print_method?: PrintMethod | null;
}


export interface CartItemDesign {
  id: number;
  cart_item_id: number;
  design_upload_id: number;
  designUpload?: DesignUpload | null;
}


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
  designs?: CartItemDesign[] | null;
}


function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url, "https://placeholder.invalid").pathname;
    return decodeURIComponent(path.split("/").pop() || "") || "Design file";
  } catch {
    return "Design file";
  }
}


export function designUploadsOf(item: ServerCartItem): DesignUploadInput[] {
  return (item.designs ?? [])
    .map((design) => design.designUpload)
    .filter((upload): upload is DesignUpload => !!upload?.file_url)
    .map((upload) => ({
      file_url: upload.file_url,
      file_name: upload.file_name || fileNameFromUrl(upload.file_url),
      ...(upload.edit_url ? { edit_url: upload.edit_url } : {}),
      ...(upload.print_method ? { print_method: upload.print_method } : {}),
    }));
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


      await apiClient.put(`/cart-items/${id}`, { is_active: false });
    }
  },
};
