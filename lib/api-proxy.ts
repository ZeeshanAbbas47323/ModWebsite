import { NextRequest, NextResponse } from "next/server";
import { API_BASE, upstreamHeaders } from "@/lib/upstream";
import type { CacheTag } from "@/lib/cache-tags";

interface ProxyOptions {
  method?: string;
  revalidate?: number;

  cacheSeconds?: number;
  /**
   * Cache tags for the upstream fetch. The backend posts these to
   * /api/revalidate after a write, which is what clears this entry on demand.
   */
  tags?: CacheTag[];
}


/**
 * Backstop TTL for shared content. On-demand revalidation by tag is the
 * mechanism that actually keeps the storefront current; this only bounds how
 * long content could stay stale if a revalidation call is ever missed.
 */
export const SHARED_CONTENT_TTL = 2 * 60 * 60;

/**
 * The shared cache in front of this app cannot be purged by tag, so it holds a
 * response for its full lifetime no matter what the admin changes. It is kept
 * deliberately short: the expensive upstream call is still cached for
 * SHARED_CONTENT_TTL in the data cache, so this costs little and bounds
 * staleness to a minute rather than hours.
 */
const EDGE_MAX_AGE = 60;

function cacheHeaders(seconds?: number) {
  if (!seconds) return undefined;
  return {
    "Cache-Control": `public, s-maxage=${EDGE_MAX_AGE}, stale-while-revalidate=300`,
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
    const tags = opts?.tags;
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "GET",
      headers: upstreamHeaders(),
      next:
        revalidate || tags
          ? {
              ...(revalidate ? { revalidate } : {}),
              ...(tags?.length ? { tags } : {}),
            }
          : undefined,
    });
    return respond(await res.text(), res.status, opts?.cacheSeconds);
  } catch (err) {
    return fail(err);
  }
}


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


export async function proxyCachedQuery(
  path: string,
  body: unknown,
  cacheSecondsOrOpts:
    | number
    | { cacheSeconds?: number; tags?: CacheTag[] } = SHARED_CONTENT_TTL
) {
  const opts =
    typeof cacheSecondsOrOpts === "number"
      ? { cacheSeconds: cacheSecondsOrOpts }
      : cacheSecondsOrOpts;
  const cacheSeconds = opts.cacheSeconds ?? SHARED_CONTENT_TTL;

  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "POST",
      headers: upstreamHeaders(),
      body: JSON.stringify(body),
      next: {
        revalidate: cacheSeconds,
        ...(opts.tags?.length ? { tags: opts.tags } : {}),
      },
    });
    return respond(await res.text(), res.status, cacheSeconds);
  } catch (err) {
    return fail(err);
  }
}
