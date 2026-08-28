import apiClient from "@/lib/axios";

export interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  cost_price: number | null;
  description: string;
  short_desc: string;
  status: string;
  is_featured: boolean;
  is_customizable: boolean;
  is_active: boolean;
  category_id: number | null;
  vendor_id: number | null;
  tags: string[];
  discount_percent: number;
  discount_amount: number;
  print_methods: string;
  meta_title: string;
  meta_desc: string;
  meta_keywords: string;
  canonical_url: string;
  is_pickup_allowed: boolean;
  is_delivery_allowed: boolean;
  weight: number;
  length: number;
  width: number;
  height: number;
  view_count: number;
  order_count: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: { id: number; name: string };
  /** One row per variant, plus a variant_id:null row for the product itself. */
  inventory?: { id?: number; variant_id: number | null; quantity: number }[] | null;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  /** Money fields arrive as decimal strings. */
  price: string | number;
  sale_price: string | number | null;
  discount_percent?: number | null;
  /** Legacy flat stock count; current responses nest it under `inventory`. */
  stock?: number;
  inventory?: { quantity: number } | null;
  status: string;
  image_url?: string | null;
  color_id: number | null;
  size_id: number | null;
  color?: { id: number; name: string; hex_code: string } | null;
  size?: { id: number; name: string; display_name?: string } | null;
}

/** Units on hand for a variant, across both response shapes. */
export function variantStock(variant: ProductVariant): number {
  return variant.inventory?.quantity ?? variant.stock ?? 0;
}

/** Stock held against the product itself rather than a variant. */
export function productStock(product?: Product | null): number {
  const row = product?.inventory?.find((entry) => entry.variant_id == null);
  return row?.quantity ?? 0;
}

/**
 * Whether stock is actually tracked per variant.
 *
 * Some products carry their whole stock on the product row and leave every
 * variant at zero. Reading those literally marks every size out of stock, so
 * they fall back to the product's own count.
 */
export function tracksVariantStock(variants: ProductVariant[] | undefined): boolean {
  return !!variants?.some((variant) => variantStock(variant) > 0);
}

/**
 * @param pooledStock stock to fall back on when variants are not tracked
 *                    individually — pass `productStock(product)`.
 */
export function isVariantAvailable(
  variant: ProductVariant,
  options?: { pooledStock?: number; perVariantTracking?: boolean }
): boolean {
  if (variant.status !== "active") return false;
  if (variantStock(variant) > 0) return true;
  // Only trust a zero when this product really counts stock per variant.
  return options?.perVariantTracking === false && (options.pooledStock ?? 0) > 0;
}

export interface ProductDescription {
  id: number;
  product_id: number;
  title: string;
  content: string;
  sort_order: number;
}

export interface ProductFaq {
  id: number;
  product_id: number;
  question: string;
  answer: string;
  sort_order: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  filters?: {
    category_id?: number;
    name?: string;
    slug?: string;
    is_featured?: boolean;
    min_price?: number;
    max_price?: number;
    tags?: string[];
  };
  sortBy?: string;
  order?: string;
}

export const productService = {
  list: async (params: ProductListParams = {}): Promise<{ payload: Product[]; pagination: Pagination }> => {
    const { data } = await apiClient.post("/products", {
      page: params.page ?? 1,
      limit: params.limit ?? 24,
      filters: params.filters ?? {},
      sortBy: params.sortBy ?? "newest",
      order: params.order ?? "desc",
    });
    return { payload: data.payload ?? data.data ?? [], pagination: data.pagination };
  },

  collection: async (type: string, count = 8, categoryId?: number): Promise<Product[]> => {
    const { data } = await apiClient.post("/products/collection", {
      type,
      count,
      ...(categoryId ? { category_id: categoryId } : {}),
    });
    return data.payload ?? data.data ?? [];
  },

  getById: async (id: number): Promise<Product> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data.payload ?? data.data ?? data;
  },

  getBySlug: async (slug: string): Promise<Product | null> => {
    const { data } = await apiClient.post("/products", {
      page: 1,
      limit: 1,
      filters: { slug },
    });
    const products = data.payload ?? data.data ?? [];
    return products[0] ?? null;
  },

  increaseView: async (id: number): Promise<void> => {
    await apiClient.post(`/products/${id}/view`);
  },

  getVariants: async (productId: number): Promise<ProductVariant[]> => {
    const { data } = await apiClient.post("/product-variants", {
      page: 1,
      limit: 50,
      filters: { product_id: productId, is_active: true },
    });
    return data.payload ?? data.data ?? [];
  },

  getImages: async (productId: number): Promise<ProductImage[]> => {
    const { data } = await apiClient.post("/product-images", {
      page: 1,
      limit: 20,
      filters: { product_id: productId, is_active: true },
    });
    return data.payload ?? data.data ?? [];
  },

  getDescriptions: async (productId: number): Promise<ProductDescription[]> => {
    const { data } = await apiClient.post("/product-descriptions", {
      page: 1,
      limit: 50,
      filters: { product_id: productId, is_active: true },
    });
    return data.payload ?? data.data ?? [];
  },

  getFaqs: async (productId: number): Promise<ProductFaq[]> => {
    const { data } = await apiClient.post("/product-faqs", {
      page: 1,
      limit: 50,
      filters: { product_id: productId, is_active: true },
    });
    return data.payload ?? data.data ?? [];
  },
};
