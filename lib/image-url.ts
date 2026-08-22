const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "")
  .replace(/\/api\/.*$/, "")
  .replace(/\/$/, "");

// Domains to rewrite to the active API origin (if they become inaccessible)
// storage.modfirstapparel.com is a defunct domain — rewrite paths to the active API origin
const DEAD_DOMAINS: string[] = ["storage.modfirstapparel.com"];

export function resolveImageUrl(url: string | null | undefined, fallback = ""): string {
  if (!url) return fallback;

  // Rewrite dead/old domains to current API origin
  for (const dead of DEAD_DOMAINS) {
    if (url.includes(dead)) {
      try {
        const u = new URL(url);
        return `${API_ORIGIN}${u.pathname}`;
      } catch {
        // ignore
      }
    }
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/images/")) {
    return url;
  }

  // relative path from API e.g. /uploads/...
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}
