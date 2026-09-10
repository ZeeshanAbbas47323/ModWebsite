import { NextRequest } from "next/server";
import { proxyCachedQuery, proxyPost } from "@/lib/api-proxy";
import { CACHE_TAGS } from "@/lib/cache-tags";


const FRONTEND_MENUS = {
  page: 1,
  limit: 200,
  filters: { menu_type: "frontend", is_active: true, visibility: true },
};

export async function GET() {
  return proxyCachedQuery("menus/frontend", FRONTEND_MENUS, {
    tags: [CACHE_TAGS.menus],
  });
}


export async function POST(req: NextRequest) {
  return proxyPost(req, "menus/frontend");
}
