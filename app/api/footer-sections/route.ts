import { proxyGet, SHARED_CONTENT_TTL } from "@/lib/api-proxy";

export async function GET() {
  return proxyGet("footer-sections/frontend", {
    cacheSeconds: SHARED_CONTENT_TTL,
  });
}
