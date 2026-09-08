import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/api-proxy";

/** Re-add a past order's items to the cart. Requires a signed-in customer. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return proxyPost(req, `orders/frontend/${encodeURIComponent(code)}/reorder`);
}
