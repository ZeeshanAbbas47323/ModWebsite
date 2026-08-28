import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/api-proxy";

/** List the logged-in customer's wishlist, or add to it with ?action=create. */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "create") {
    return proxyPost(req, "wishlists");
  }
  return proxyPost(req, "wishlists/list");
}
