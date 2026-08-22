import { proxyGet } from "@/lib/api-proxy";

export async function GET() {
  return proxyGet("website-settings/current", { revalidate: 300 });
}
