import { API_BASE, API_HEADERS } from "@/lib/upstream";
import type { Product } from "./product.service";

/**
 * Server-side product lookup by id, for the legacy /product-detail?id=
 * route — it only needs the slug, to redirect to the real /products/<slug>
 * page instead of rendering the old id-based URL.
 *
 * `products/get/:id` requires a customer session (401 for a plain request),
 * so this goes through the same public `products/frontend` list endpoint
 * `getProductBySlug` uses, filtered by id instead of slug.
 */
export async function getProductById(id: number): Promise<Product | null> {
  if (!API_BASE || !id) return null;
  try {
    const res = await fetch(`${API_BASE}/products/frontend`, {
      method: "POST",
      headers: API_HEADERS,
      body: JSON.stringify({ page: 1, limit: 1, filters: { id } }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const rows = (data?.payload ?? data?.data ?? []) as Product[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Server-side product lookup, used by `generateMetadata` on the product page.
 * The client-side `productService.getBySlug` goes through the browser axios
 * instance, which cannot run during metadata generation.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!API_BASE || !slug) return null;
  try {
    const res = await fetch(`${API_BASE}/products/frontend`, {
      method: "POST",
      headers: API_HEADERS,
      body: JSON.stringify({ page: 1, limit: 1, filters: { slug } }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const rows = (data?.payload ?? data?.data ?? []) as Product[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
