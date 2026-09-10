import { NextRequest } from "next/server";
import { proxyCachedQuery, proxyPost } from "@/lib/api-proxy";
import { CACHE_TAGS } from "@/lib/cache-tags";


export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const parentId = params.get("parent_id");
  const slug = params.get("slug");

  return proxyCachedQuery("product-categories/frontend", {
    page: 1,
    limit: slug ? 1 : 50,
    filters: {
      is_active: true,
      ...(parentId !== null ? { parent_id: parentId === "" ? null : Number(parentId) } : {}),
      ...(slug ? { slug } : {}),
    },
  }, { tags: [CACHE_TAGS.productCategories] });
}


export async function POST(req: NextRequest) {
  return proxyPost(req, "product-categories/frontend");
}
