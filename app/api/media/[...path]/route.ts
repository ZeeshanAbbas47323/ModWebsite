import { NextRequest, NextResponse } from "next/server";
import { API_ORIGIN, IMAGE_BASE_URL, MEDIA_BASE_URL } from "@/lib/image-url";

/**
 * CMS media, wherever it happens to live.
 *
 * Uploads are served from the storage CDN now, but some files still only exist
 * on R2 or the API origin — and each host 404s for the other's files. This
 * checks the CDN first and falls back.
 *
 * The bytes are streamed rather than redirected on purpose: Next's image
 * optimizer will not follow a cross-origin redirect from a local path, so a
 * 307 here makes every image fail with a 400. Once the backend has migrated
 * the old files, point resolveImageUrl straight at the CDN and delete this route.
 */
const resolvedHost = new Map<string, string>();
const MAX_CACHE = 500;

function candidates(key: string): string[] {
  return [
    // The CDN and R2 both key files without the /uploads/ prefix the API reports.
    IMAGE_BASE_URL ? `${IMAGE_BASE_URL}/${key}` : null,
    MEDIA_BASE_URL ? `${MEDIA_BASE_URL}/${key}` : null,
    API_ORIGIN ? `${API_ORIGIN}/uploads/${key}` : null,
  ].filter((url): url is string => !!url);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.map(decodeURIComponent).join("/");
  if (!key || key.includes("..")) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  // Try the host that served this key last time before probing the others.
  const known = resolvedHost.get(key);
  const urls = known
    ? [known, ...candidates(key).filter((u) => u !== known)]
    : candidates(key);

  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok || !res.body) continue;

      if (resolvedHost.size >= MAX_CACHE) resolvedHost.clear();
      resolvedHost.set(key, url);

      return new NextResponse(res.body, {
        status: 200,
        headers: {
          "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
          // Uploaded media never changes under the same name.
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Try the next host.
    }
  }

  return NextResponse.json(
    { success: false, message: "Not found." },
    { status: 404 }
  );
}
