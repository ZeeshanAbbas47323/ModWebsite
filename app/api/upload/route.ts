import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/upstream";

/**
 * Proxy for file uploads.
 *
 * The body is multipart, so it is streamed through untouched — setting a
 * Content-Type here would break the boundary the browser generated.
 */
export async function POST(req: NextRequest) {
  const folder = new URL(req.url).searchParams.get("folder") ?? "uploads";

  try {
    const form = await req.formData();
    const res = await fetch(
      `${API_BASE}/upload/image?folder=${encodeURIComponent(folder)}`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY ?? "",
          "x-api-password": process.env.NEXT_PUBLIC_X_API_PASSWORD ?? "",
        },
        body: form,
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      }
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}
