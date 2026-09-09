import { proxyGet } from "@/lib/api-proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  return proxyGet(`reviews/frontend/summary/${encodeURIComponent(productId)}`);
}
