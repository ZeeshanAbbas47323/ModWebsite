import { proxyGet, SHARED_CONTENT_TTL } from "@/lib/api-proxy";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function GET() {
  return proxyGet("footer-sections/frontend", {
    cacheSeconds: SHARED_CONTENT_TTL,
    tags: [CACHE_TAGS.footerSections],
  });
}
