import { API_BASE, API_HEADERS } from "@/lib/upstream";
import type { ContentPage, ContentPageFilters } from "./content-page.service";

/**
 * Content pages are prerendered, so a slow or unreachable API would otherwise
 * stall the whole build. Give up quickly instead and let the page fall back —
 * ISR fills in the real content on the next revalidation.
 */
const REQUEST_TIMEOUT_MS = 10_000;

/** Server-side twin of contentPageService.find, for SSR and metadata. */
export async function getContentPage(
  filters: ContentPageFilters
): Promise<ContentPage | null> {
  if (!API_BASE) {
    console.error(
      "[content-page] NEXT_PUBLIC_API_BASE_URL is not set — cannot load content pages. " +
        "Add it to .env.local (or the deploy environment) and rebuild."
    );
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/content-pages/frontend`, {
      method: "POST",
      headers: API_HEADERS,
      body: JSON.stringify({ page: 1, limit: 1, filters: { is_active: true, ...filters } }),
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(
        `[content-page] ${filters.slug ?? "page"} — API responded ${res.status}`
      );
      return null;
    }

    const data = await res.json();
    const pages: ContentPage[] = data.payload ?? data.data ?? [];
    return pages[0] ?? null;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(
      `[content-page] ${filters.slug ?? "page"} — request failed: ${reason}`
    );
    return null;
  }
}
