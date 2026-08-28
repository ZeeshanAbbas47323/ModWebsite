import { NextResponse } from "next/server";
import { BUILDER_ORIGIN } from "@/lib/gang-sheet";

/**
 * The builder's catalogue.
 *
 * Proxied rather than fetched from the browser: the builder only allow-lists
 * the production storefront origins for CORS, so a direct call fails locally.
 */
export async function GET() {
  try {
    // Not cached on the server: a cached list survives restarts, so a product
    // added in the builder would not open here until a second page load. The
    // payload is tiny, and the client already caches it for 10 minutes.
    const res = await fetch(`${BUILDER_ORIGIN}/api/v1/gang-sheet/products`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json({ products: data.products ?? [] });
  } catch {
    // A builder outage should not break the product page.
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
