import { NextRequest, NextResponse } from "next/server";
import { BUILDER_ORIGIN, DEFAULT_BUILDER_PRODUCT_SLUG } from "@/lib/gang-sheet";

/**
 * Open a builder session.
 *
 * This runs server-side on purpose: the builder's docs are explicit that a
 * handoff token (which attaches the customer) must never be minted in the
 * browser. Keeping it here also sidesteps CORS, since the builder only
 * allow-lists the production storefront origins.
 */
export async function POST(req: NextRequest) {
  let body: {
    productSlug?: string;
    name?: string;
    quantity?: number;
  } = {};
  try {
    body = await req.json();
  } catch {
    // An empty body is fine — the defaults below cover it.
  }

  try {
    const res = await fetch(`${BUILDER_ORIGIN}/api/v1/gang-sheet/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: body.productSlug || DEFAULT_BUILDER_PRODUCT_SLUG,
        name: body.name || "Gang sheet",
        quantity: body.quantity ?? 1,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data?.error?.message ?? "Could not start a gang sheet session.";
      return NextResponse.json(
        { success: false, message },
        { status: res.status }
      );
    }

    // The embed loader only needs these two fields.
    return NextResponse.json({
      sessionId: data.session?.id,
      token: data.token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
