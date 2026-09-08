import { proxyGet } from "@/lib/api-proxy";

/** Rating average and distribution for one product's review widget. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  return proxyGet(`reviews/frontend/summary/${encodeURIComponent(productId)}`);
}
