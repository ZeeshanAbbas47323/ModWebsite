import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { ALL_CACHE_TAGS, isCacheTag } from "@/lib/cache-tags";

/**
 * On-demand cache invalidation, called by the backend after it writes anything
 * the storefront shows. Without this, an edit in the dashboard would not appear
 * until the cache TTL expired.
 *
 * Authenticated with a shared secret rather than a user session, because the
 * caller is a server, not a person.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  // Refuse rather than run unauthenticated: an open purge endpoint lets anyone
  // dump the cache and hammer the API behind it.
  if (!secret) {
    return NextResponse.json(
      { success: false, message: "Revalidation is not configured" },
      { status: 503 }
    );
  }

  const provided =
    req.headers.get("x-revalidate-secret") ??
    req.nextUrl.searchParams.get("secret");

  if (provided !== secret) {
    return NextResponse.json(
      { success: false, message: "Invalid revalidation secret" },
      { status: 401 }
    );
  }

  let body: { tags?: unknown; all?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // An empty body means "everything", handled below.
  }

  const requested = Array.isArray(body.tags) ? body.tags.map(String) : [];
  const tags = body.all === true ? [...ALL_CACHE_TAGS] : requested.filter(isCacheTag);

  const unknown = body.all === true ? [] : requested.filter((t) => !isCacheTag(t));

  if (!tags.length) {
    return NextResponse.json(
      {
        success: false,
        message: "No known cache tags supplied",
        unknown,
      },
      { status: 400 }
    );
  }

  for (const tag of tags) {
    // Next 16 requires a cache-life profile; "max" expires every entry
    // carrying the tag regardless of how recently it was written.
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    success: true,
    revalidated: tags,
    ...(unknown.length ? { ignored: unknown } : {}),
    at: new Date().toISOString(),
  });
}
