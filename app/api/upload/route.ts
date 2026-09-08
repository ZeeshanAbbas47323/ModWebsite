import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/upstream";

/**
 * Proxy for file uploads.
 *
 * The body is multipart, so it is streamed through untouched — setting a
 * Content-Type here would break the boundary the browser generated.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const folder = url.searchParams.get("folder") ?? "uploads";
  // "video" for review/product video attachments; anything else stays image.
  const kind = url.searchParams.get("type") === "video" ? "video" : "image";

  try {
    const form = await req.formData();
    const res = await fetch(
      `${API_BASE}/upload/${kind}?folder=${encodeURIComponent(folder)}`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY ?? "",
          "x-api-password": process.env.NEXT_PUBLIC_X_API_PASSWORD ?? "",
        },
        body: form,
        cache: "no-store",
        // Artwork files can be large, so allow a slow upstream write.
        signal: AbortSignal.timeout(180_000),
      }
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
