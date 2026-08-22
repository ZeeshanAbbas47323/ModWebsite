import { NextRequest, NextResponse } from "next/server";
import { API_BASE, API_HEADERS } from "@/lib/upstream";

interface ProxyOptions {
  method?: string;
  revalidate?: number;
}

export async function proxyGet(path: string, opts?: ProxyOptions) {
  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "GET",
      headers: API_HEADERS,
      next: opts?.revalidate ? { revalidate: opts.revalidate } : undefined,
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: false, message: "Upstream returned invalid JSON" },
        { status: 502 }
      );
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function proxyPost(req: NextRequest, path: string) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "POST",
      headers: API_HEADERS,
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: false, message: "Upstream returned invalid JSON" },
        { status: 502 }
      );
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
