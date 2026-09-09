import { proxyGet } from "@/lib/api-proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return proxyGet(`shippings/frontend/${encodeURIComponent(code)}/track`);
}
