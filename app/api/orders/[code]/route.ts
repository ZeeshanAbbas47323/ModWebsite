import { NextRequest } from "next/server";
import { proxyAuthGet } from "@/lib/api-proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return proxyAuthGet(req, `orders/frontend/${encodeURIComponent(code)}`);
}
