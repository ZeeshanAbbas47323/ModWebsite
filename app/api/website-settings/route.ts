import { proxyGet, SHARED_CONTENT_TTL } from "@/lib/api-proxy";

export async function GET() {
  return proxyGet("website-settings/current", {
    cacheSeconds: SHARED_CONTENT_TTL,
  });
}
