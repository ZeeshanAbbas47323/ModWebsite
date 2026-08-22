import { proxyGet } from "@/lib/api-proxy";

export async function GET() {
  return proxyGet("home-sections/frontend", { revalidate: 300 });
}
