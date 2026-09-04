export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "")
  .replace(/\/api\/.*$/, "")
  .replace(/\/$/, "");

/** Primary CDN for uploaded media. */
export const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_URL ?? "").replace(/\/$/, "");

/** Earlier public base for CMS media (R2), kept as a fallback. */
export const MEDIA_BASE_URL = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "").replace(
  /\/$/,
  ""
);

// Domains to rewrite (if they become inaccessible)
// storage.modfirstapparel.com is a defunct domain — rewrite its paths instead.
const DEAD_DOMAINS: string[] = ["storage.modfirstapparel.com"];

/**
 * Media served through this site, which resolves whichever host actually holds
 * the file. Uploads live on the storage CDN now, but some files are still only
 * on R2 or the API origin, and each host 404s for the other's files.
 */
function mediaUrl(path: string): string {
  // The API is inconsistent about prefixes: /uploads/x, /upload/uploads/x, /x.
  // The hosts key everything without them.
  const key = path.replace(/^\/+/, "").replace(/^(uploads?\/)+/, "");
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `/api/media/${encoded}`;
}

export function resolveImageUrl(url: string | null | undefined, fallback = ""): string {
  if (!url) return fallback;

  // Rewrite dead/old domains through the media resolver.
  for (const dead of DEAD_DOMAINS) {
    if (url.includes(dead)) {
      try {
        return mediaUrl(new URL(url).pathname);
      } catch {
        // ignore
      }
    }
  }

  // Local assets and anything already absolute are used as-is.
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/images/")) {
    return url;
  }

  // Relative path from the API, e.g. /uploads/products/foo.jpg
  return mediaUrl(url);
}
