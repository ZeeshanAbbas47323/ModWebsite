import { NextRequest, NextResponse } from "next/server";
import { API_ORIGIN, IMAGE_BASE_URL, MEDIA_BASE_URL } from "@/lib/image-url";


const resolvedHost = new Map<string, string>();
const MAX_CACHE = 500;

function candidates(key: string): string[] {
  return [

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

          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
    }
  }

  return NextResponse.json(
    { success: false, message: "Not found." },
    { status: 404 }
  );
}
