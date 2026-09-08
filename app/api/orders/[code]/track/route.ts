import { proxyGet } from "@/lib/api-proxy";

/** Carrier tracking for one order. Public to the site's API key. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return proxyGet(`shippings/frontend/${encodeURIComponent(code)}/track`);
}
