import { NextRequest } from "next/server";
import { proxyPut, proxyDelete } from "@/lib/api-proxy";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyPut(req, `cart-items/${id}`);
}

/** Cart items are removed through the shared frontend delete endpoint. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = JSON.stringify({ id: Number(id), table: "cartItem" });
  const forwarded = new NextRequest(req.url, {
    method: "DELETE",
    headers: req.headers,
    body,
  });
  return proxyDelete(forwarded, "common/frontend/delete");
}
