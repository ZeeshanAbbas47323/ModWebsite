import { API_BASE, API_HEADERS } from "@/lib/upstream";
import type { ProductCategory } from "./product-category.service";
import { CACHE_TAGS } from "@/lib/cache-tags";

async function fetchCategories(
  filters: Record<string, unknown>,
  limit = 50
): Promise<ProductCategory[]> {
  const res = await fetch(`${API_BASE}/product-categories/frontend`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({ page: 1, limit, filters: { is_active: true, ...filters } }),
    next: { revalidate: 3600, tags: [CACHE_TAGS.productCategories] },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.payload ?? data.data ?? [];
}


export async function getCollectionBySlug(
  slug: string
): Promise<ProductCategory | null> {
  try {
    const [category] = await fetchCategories({ slug }, 1);
    return category ?? null;
  } catch {
    return null;
  }
}

export async function getCollections(): Promise<ProductCategory[]> {
  try {
    return await fetchCategories({});
  } catch {
    return [];
  }
}
