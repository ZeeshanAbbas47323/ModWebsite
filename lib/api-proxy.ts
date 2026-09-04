import { NextRequest, NextResponse } from "next/server";
import { API_BASE, upstreamHeaders } from "@/lib/upstream";

interface ProxyOptions {
  method?: string;
  revalidate?: number;
  /**
   * Seconds this response may be reused. Site-wide content (menus, settings,
   * footer) is the same for every visitor and changes rarely, so letting the
   * browser and CDN hold it avoids a round trip on every page load.
   */
  cacheSeconds?: number;
}

/** Site-wide content that only changes when someone edits the CMS. */
export const SHARED_CONTENT_TTL = 2 * 60 * 60;

function cacheHeaders(seconds?: number) {
  if (!seconds) return undefined;
  return {
    // Serve stale for a day while revalidating, so a slow upstream never
    // blocks a page render.
    "Cache-Control": `public, max-age=${seconds}, stale-while-revalidate=86400`,
  };
}

function respond(text: string, status: number, cacheSeconds?: number) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { success: false, message: "Upstream returned invalid JSON" },
      { status: 502 }
    );
  }
  // Only a good response is worth caching.
  const headers = status === 200 ? cacheHeaders(cacheSeconds) : undefined;
  return NextResponse.json(data, { status, headers });
}

function fail(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return NextResponse.json({ success: false, message }, { status: 500 });
}

export async function proxyGet(path: string, opts?: ProxyOptions) {
  try {
    const revalidate = opts?.revalidate ?? opts?.cacheSeconds;
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "GET",
      headers: upstreamHeaders(),
      next: revalidate ? { revalidate } : undefined,
    });
    return respond(await res.text(), res.status, opts?.cacheSeconds);
  } catch (err) {
    return fail(err);
  }
}

/** GET that forwards the caller's Authorization header (auth-gated endpoints). */
export async function proxyAuthGet(req: NextRequest, path: string) {
  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "GET",
      headers: upstreamHeaders(req.headers.get("authorization")),
      cache: "no-store",
    });
    return respond(await res.text(), res.status);
  } catch (err) {
    return fail(err);
  }
}

async function proxyWithBody(
  req: NextRequest,
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE"
) {
  try {
    let body: unknown = undefined;
    try {
      body = await req.json();
    } catch {
      // no body — fine for DELETE / empty POST
    }
    const res = await fetch(`${API_BASE}/${path}`, {
      method,
      headers: upstreamHeaders(req.headers.get("authorization")),
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    return respond(await res.text(), res.status);
  } catch (err) {
    return fail(err);
  }
}

export async function proxyPost(req: NextRequest, path: string) {
  return proxyWithBody(req, path, "POST");
}

export async function proxyPut(req: NextRequest, path: string) {
  return proxyWithBody(req, path, "PUT");
}

export async function proxyPatch(req: NextRequest, path: string) {
  return proxyWithBody(req, path, "PATCH");
}

export async function proxyDelete(req: NextRequest, path: string) {
  return proxyWithBody(req, path, "DELETE");
}

/**
 * A cacheable GET for an upstream endpoint that only accepts POST.
 *
 * The body is fixed here rather than taken from the caller, so the result is
 * the same for everyone and can be cached by URL.
 */
export async function proxyCachedQuery(
  path: string,
  body: unknown,
  cacheSeconds: number = SHARED_CONTENT_TTL
) {
  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "POST",
      headers: upstreamHeaders(),
      body: JSON.stringify(body),
      next: { revalidate: cacheSeconds },
    });
    return respond(await res.text(), res.status, cacheSeconds);
  } catch (err) {
    return fail(err);
  }
}
