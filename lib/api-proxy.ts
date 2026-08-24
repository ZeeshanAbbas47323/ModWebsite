import { NextRequest, NextResponse } from "next/server";
import { API_BASE, upstreamHeaders } from "@/lib/upstream";

interface ProxyOptions {
  method?: string;
  revalidate?: number;
}

function respond(text: string, status: number) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { success: false, message: "Upstream returned invalid JSON" },
      { status: 502 }
    );
  }
  return NextResponse.json(data, { status });
}

function fail(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return NextResponse.json({ success: false, message }, { status: 500 });
}

export async function proxyGet(path: string, opts?: ProxyOptions) {
  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "GET",
      headers: upstreamHeaders(),
      next: opts?.revalidate ? { revalidate: opts.revalidate } : undefined,
    });
    return respond(await res.text(), res.status);
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
