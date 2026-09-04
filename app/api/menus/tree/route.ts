import { NextRequest } from "next/server";
import { proxyCachedQuery, proxyPost } from "@/lib/api-proxy";

/** The only menu query the storefront makes — fixed here so it can be cached. */
const FRONTEND_MENUS = {
  page: 1,
  limit: 200,
  filters: { menu_type: "frontend", is_active: true, visibility: true },
};

export async function GET() {
  return proxyCachedQuery("menus/frontend", FRONTEND_MENUS);
}

/** Kept for callers that need their own filters. */
export async function POST(req: NextRequest) {
  return proxyPost(req, "menus/frontend");
}
