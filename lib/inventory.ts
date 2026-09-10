"use client";

import { useQueries } from "@tanstack/react-query";

import { productCategoryService } from "@/services/product-category.service";
import {
  productStock,
  variantStock,
  type Product,
} from "@/services/product.service";
import { SHARED_CONTENT_STALE_TIME } from "@/lib/query-client";

/**
 * Categories whose products are sold from real stock, so the storefront shows
 * availability and blocks buying what isn't there. Everything else is made to
 * order and always purchasable.
 *
 * Sub-categories are pulled in automatically, so adding a child in the admin
 * needs no change here - only a new top-level range does.
 */
export const INVENTORY_ENFORCED_CATEGORY_IDS = [72, 85] as const;

/**
 * The enforced categories plus every sub-category beneath them.
 *
 * `useQueries` rather than a hook per id, so the list above can grow without
 * changing the number of hooks this renders.
 */
export function useInventoryEnforcedCategoryIds(): Set<number> {
  const results = useQueries({
    queries: INVENTORY_ENFORCED_CATEGORY_IDS.map((parentId) => ({
      queryKey: ["product-categories", parentId],
      queryFn: () => productCategoryService.list(parentId),
      staleTime: SHARED_CONTENT_STALE_TIME,
      gcTime: SHARED_CONTENT_STALE_TIME,
    })),
  });

  const ids = new Set<number>(INVENTORY_ENFORCED_CATEGORY_IDS);
  for (const result of results) {
    for (const category of result.data ?? []) {
      if (typeof category.id === "number") ids.add(category.id);
    }
  }
  return ids;
}

export function isInventoryEnforced(
  product: Product | null | undefined,
  enforcedIds: Set<number>
): boolean {
  if (!product) return false;
  const categoryId = product.category_id ?? product.category?.id ?? null;
  return categoryId != null && enforcedIds.has(categoryId);
}

/**
 * Total sellable units: per-variant counts when variants carry their own
 * stock, otherwise the product-level pool.
 *
 * A product whose variants have not been loaded falls back to the pool, so a
 * listing never claims "out of stock" just because it fetched less data than
 * the detail page.
 */
export function availableStock(product: Product | null | undefined): number {
  if (!product) return 0;

  const variants = product.variants ?? [];
  const variantTotal = variants.reduce(
    (sum, variant) =>
      variant.status === "active" ? sum + variantStock(variant) : sum,
    0
  );

  if (variantTotal > 0) return variantTotal;

  return productStock(product);
}

/**
 * Whether to show an out-of-stock state. Only ever true for enforced
 * categories - a made-to-order product has no stock to run out of.
 */
export function isOutOfStock(
  product: Product | null | undefined,
  enforcedIds: Set<number>
): boolean {
  if (!isInventoryEnforced(product, enforcedIds)) return false;
  return availableStock(product) <= 0;
}
