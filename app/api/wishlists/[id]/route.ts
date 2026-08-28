import { NextRequest } from "next/server";
import { proxyDelete } from "@/lib/api-proxy";

/** Wishlist rows are removed through the shared frontend delete endpoint. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const forwarded = new NextRequest(req.url, {
    method: "DELETE",
    headers: req.headers,
    body: JSON.stringify({ id: Number(id), table: "wishlist" }),
  });
  return proxyDelete(forwarded, "common/frontend/delete");
}
