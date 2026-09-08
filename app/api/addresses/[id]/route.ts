import { NextRequest } from "next/server";
import { proxyPut } from "@/lib/api-proxy";

/** Update one of the signed-in customer's saved addresses. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyPut(req, `addresses/${encodeURIComponent(id)}`);
}
