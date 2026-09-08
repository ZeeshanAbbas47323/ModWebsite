import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/api-proxy";

/**
 * List a product's approved reviews, or submit one with ?action=create.
 *
 * Creating needs the customer's bearer token, which proxyPost forwards; the
 * listing side only needs the site API key.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "create") {
    return proxyPost(req, "reviews");
  }
  return proxyPost(req, "reviews/frontend");
}
