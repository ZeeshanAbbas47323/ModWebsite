import { API_BASE, API_HEADERS } from "@/lib/upstream";
import type { Product } from "./product.service";

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
