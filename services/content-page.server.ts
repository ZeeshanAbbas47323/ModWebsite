import { API_BASE, API_HEADERS } from "@/lib/upstream";
import type { ContentPage, ContentPageFilters } from "./content-page.service";

/** Server-side twin of contentPageService.find, for SSR and metadata. */
export async function getContentPage(
  filters: ContentPageFilters
): Promise<ContentPage | null> {
  const res = await fetch(`${API_BASE}/content-pages/frontend`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({ page: 1, limit: 1, filters: { is_active: true, ...filters } }),
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const pages: ContentPage[] = data.payload ?? data.data ?? [];
  return pages[0] ?? null;
}
