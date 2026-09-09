import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/api-proxy";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get("action") === "create") {
    return proxyPost(req, "reviews");
  }
  return proxyPost(req, "reviews/frontend");
}
