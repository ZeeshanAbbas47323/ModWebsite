import { NextRequest } from "next/server";
import { proxyDelete } from "@/lib/api-proxy";

/**
 * Soft-delete one of the customer's own records — an address, a cart item, a
 * wishlist entry. The upstream route is DELETE and takes the body.
 */
export async function DELETE(req: NextRequest) {
  return proxyDelete(req, "common/frontend/delete");
}
